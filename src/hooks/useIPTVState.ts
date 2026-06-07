import React, { useState, useEffect, useMemo } from "react";
import { Channel, SavedPlaylist, PlayHistoryItem, PopupConfig } from "../types";
import { DEFAULT_CHANNELS } from "../data/defaultChannels";
import { parseM3U } from "../utils/m3uParser";
import { collection, onSnapshot, query, doc, setDoc, deleteDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../utils/firebase";

export default function useIPTVState() {
  // --- POPUP CONTROLLER SYSTEM ---
  const [popupConfig, setPopupConfig] = useState<PopupConfig>({
    fbPopupMinutes: 15,
    fbPopupText: "ভিডিও দেখা কন্টিনিউ করতে আমাদের অফিশিয়াল ফেসবুক পেজটি ফলো এবং শেয়ার করুন। নিচের লিংকে ক্লিক করে পেজ ফলো করলেই ভিডিও আবার চালু হয়ে যাবে!",
    facebookLink: "https://www.facebook.com/yourpage",
    customPopupMinutes: 30,
    customPopupText: "আমাদের স্পন্সর ওয়েবসাইট ভিজিট করুন এবং ভিডিও কন্টিনিউ করুন!",
    customPopupLink: "https://example.com/sponsor",
    controlSystemEnabled: false
  });

  // Fetch Popup configuration
  useEffect(() => {
    const docRef = doc(db, "configs", "popupConfig");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPopupConfig({
          fbPopupMinutes: typeof data.fbPopupMinutes === "number" ? data.fbPopupMinutes : 15,
          fbPopupText: typeof data.fbPopupText === "string" ? data.fbPopupText : "ভিডিও দেখা কন্টিনিউ করতে আমাদের অফিশিয়াল ফেসবুক পেজটি ফলো এবং শেয়ার করুন। নিচের লিংকে ক্লিক করে পেজ ফলো করলেই ভিডিও আবার চালু হয়ে যাবে!",
          facebookLink: typeof data.facebookLink === "string" ? data.facebookLink : "https://www.facebook.com/yourpage",
          customPopupMinutes: typeof data.customPopupMinutes === "number" ? data.customPopupMinutes : 30,
          customPopupText: typeof data.customPopupText === "string" ? data.customPopupText : "আমাদের স্পন্সর ওয়েবসাইট ভিজিট করুন এবং ভিডিও কন্টিনিউ করুন!",
          customPopupLink: typeof data.customPopupLink === "string" ? data.customPopupLink : "https://example.com/sponsor",
          controlSystemEnabled: typeof data.controlSystemEnabled === "boolean" ? data.controlSystemEnabled : false
        });
      }
    }, (error) => {
      console.error("Firestore popupConfig snapshot error:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdatePopupConfig = async (fields: Partial<PopupConfig>) => {
    try {
      setImportStatus({ type: "info", text: "Updating control system settings..." });
      const docRef = doc(db, "configs", "popupConfig");
      await setDoc(docRef, { ...popupConfig, ...fields }, { merge: true });
      setImportStatus({ type: "success", text: "Control system settings updated successfully!" });
    } catch (err: any) {
      console.error(err);
      setImportStatus({ type: "error", text: `Failed to save control settings: ${err.message}` });
    }
  };

  // --- CATEGORIES SYNC & ORDERING SYSTEM ---
  const [dbCategories, setDbCategories] = useState<string[]>([]);

  useEffect(() => {
    const docRef = doc(db, "configs", "categoriesConfig");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.order)) {
          setDbCategories(data.order);
        }
      }
    }, (error) => {
      console.error("Firestore categoriesConfig snapshot error:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateCategories = async (newCategories: string[]) => {
    try {
      setImportStatus({ type: "info", text: "Updating categories layout..." });
      const docRef = doc(db, "configs", "categoriesConfig");
      const cleanList = Array.from(new Set(
        newCategories
          .map(c => c.trim())
          .filter(c => c && c !== "All" && c !== "Favorites")
      ));
      await setDoc(docRef, { order: cleanList });
      setImportStatus({ type: "success", text: "Categories and ordering saved successfully!" });
    } catch (err: any) {
      console.error(err);
      setImportStatus({ type: "error", text: `Failed to update categories layout: ${err.message}` });
    }
  };

  // --- STATE PERSISTENCE & INITIALIZATION ---
  
  // Custom uploaded playlists list
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>(() => {
    try {
      const saved = localStorage.getItem("shafinbd_playlists");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any) => ({
            ...p,
            channels: p && Array.isArray(p.channels) ? p.channels : []
          }));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Active playlist ID ('default' or playlist.id)
  const [activePlaylistId, setActivePlaylistId] = useState<string>(() => {
    return localStorage.getItem("shafinbd_active_playlist_id") || "default";
  });

  // --- CLOUD FIREBASE SYNC STATES & MUTATORS ---
  const [cloudChannels, setCloudChannels] = useState<Channel[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(true);

  // Load cloud channel lists reactively in real-time
  useEffect(() => {
    const q = query(collection(db, "channels"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Channel[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Channel);
      });

      // Sort by order weight (lowest first), then name secondary
      list.sort((a, b) => {
        const orderA = typeof a.order === "number" ? a.order : 99999;
        const orderB = typeof b.order === "number" ? b.order : 99999;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
      });

      setCloudChannels(list);
      setIsLoadingCloud(false);
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      setIsLoadingCloud(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync / seed default offline library to cloud database
  const handleSeedDefaultChannels = async () => {
    try {
      setImportStatus({ type: "info", text: "Seeding default channels..." });
      const batch = writeBatch(db);
      DEFAULT_CHANNELS.forEach((chan, idx) => {
        const docRef = doc(db, "channels", chan.id);
        batch.set(docRef, {
          name: chan.name,
          url: chan.url,
          category: chan.category,
          logoUrl: chan.logoUrl || "",
          description: chan.description || "",
          groupTitle: chan.groupTitle || "",
          order: idx,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
      setImportStatus({ type: "success", text: "Successfully pre-seeded default channels to server!" });
    } catch (err: any) {
      console.error(err);
      setImportStatus({ type: "error", text: `Failed to seed database: ${err.message}` });
    }
  };

  // Add a new channel to Firestore
  const handleAddCloudChannel = async (chan: Omit<Channel, "id">) => {
    try {
      const newId = `chan_${Date.now()}`;
      const docRef = doc(db, "channels", newId);
      
      // Calculate max order to append at bottom
      const maxOrder = cloudChannels.reduce((max, c) => Math.max(max, c.order || 0), 0);

      await setDoc(docRef, {
        name: chan.name,
        url: chan.url,
        category: chan.category,
        logoUrl: chan.logoUrl || "",
        description: chan.description || "",
        groupTitle: chan.groupTitle || "",
        order: maxOrder + 1,
        createdAt: new Date().toISOString()
      });
      setImportStatus({ type: "success", text: `Channel "${chan.name}" created successfully!` });
    } catch (err: any) {
      console.error(err);
      setImportStatus({ type: "error", text: `Error: ${err.message}` });
    }
  };

  // Update channel properties in Firestore
  const handleUpdateCloudChannel = async (id: string, fields: Partial<Channel>) => {
    try {
      const docRef = doc(db, "channels", id);
      await updateDoc(docRef, fields);
      setImportStatus({ type: "success", text: "Channel information updated successfully!" });
    } catch (err: any) {
      console.error(err);
      setImportStatus({ type: "error", text: `Error: ${err.message}` });
    }
  };

  // Delete channel from Firestore
  const handleDeleteCloudChannel = async (id: string) => {
    try {
      const docRef = doc(db, "channels", id);
      await deleteDoc(docRef);
      setImportStatus({ type: "success", text: "Channel deleted from cloud database successfully." });
    } catch (err: any) {
      console.error(err);
      setImportStatus({ type: "error", text: `Error: ${err.message}` });
    }
  };

  // Re-save entire list ordering
  const handleReorderCloudChannels = async (reordered: Channel[]) => {
    try {
      const batch = writeBatch(db);
      reordered.forEach((chan, idx) => {
        const docRef = doc(db, "channels", chan.id);
        batch.update(docRef, { order: idx });
      });
      await batch.commit();
      setImportStatus({ type: "success", text: "Feeds organization sorted successfully!" });
    } catch (err: any) {
      console.error(err);
      setImportStatus({ type: "error", text: `Sorting error: ${err.message}` });
    }
  };

  // Set a specific channel as default, resetting all other channels' isDefault status in Firestore
  const handleSetDefaultCloudChannel = async (channelId: string | null) => {
    try {
      setImportStatus({ type: "info", text: "Updating default channel configuration..." });
      const batch = writeBatch(db);
      cloudChannels.forEach((chan) => {
        const docRef = doc(db, "channels", chan.id);
        const shouldBeDefault = chan.id === channelId;
        batch.update(docRef, { isDefault: shouldBeDefault });
      });
      await batch.commit();
      setImportStatus({ 
        type: "success", 
        text: channelId 
          ? "Successfully set default stream channel!" 
          : "Successfully cleared default channel." 
      });
    } catch (err: any) {
      console.error(err);
      setImportStatus({ type: "error", text: `Failed to set default channel: ${err.message}` });
    }
  };

  // Watch history list
  const [history, setHistory] = useState<PlayHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("shafinbd_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Favorites list (IDs of channels)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("shafinbd_favorites");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Currently playing channel
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  // Active sidebar control states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Tab selections
  const [activeControlTab, setActiveControlTab] = useState<"import" | "history" | "favorites">("import");
  const [activeImportMethod, setActiveImportMethod] = useState<"link" | "upload" | "m3u_url">("link");
  const [mobileActiveTab, setMobileActiveTab] = useState<"player" | "channels" | "playlists">("player");

  // Input states
  const [directStreamUrl, setDirectStreamUrl] = useState("");
  const [directStreamName, setDirectStreamName] = useState("");
  const [directStreamCategory, setDirectStreamCategory] = useState("Direct Play");

  const [playlistUrlInput, setPlaylistUrlInput] = useState("");
  const [playlistNameInput, setPlaylistNameInput] = useState("");

  const [importStatus, setImportStatus] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // --- DERIVED DATA ---

  // Get active channels list based on selected playlist (supports cloud syncing falling back to default)
  const activeChannels = useMemo(() => {
    if (activePlaylistId === "default") {
      return cloudChannels.length > 0 ? cloudChannels : (DEFAULT_CHANNELS || []);
    }
    const matching = (playlists || []).find(p => p.id === activePlaylistId);
    return matching && Array.isArray(matching.channels) ? matching.channels : (cloudChannels.length > 0 ? cloudChannels : DEFAULT_CHANNELS || []);
  }, [activePlaylistId, playlists, cloudChannels]);

  // Set default active channel if none loaded
  useEffect(() => {
    if (!activeChannel && activeChannels && activeChannels.length > 0) {
      const defaultChannel = activeChannels.find(c => c.isDefault) || activeChannels.find(c => c.id === "fifa_plus_us") || activeChannels[0];
      setActiveChannel(defaultChannel);
    }
  }, [activeChannels, activeChannel]);

  // Save playlists representation on state change
  useEffect(() => {
    localStorage.setItem("shafinbd_playlists", JSON.stringify(playlists));
  }, [playlists]);

  // Save active playlist ID preference
  useEffect(() => {
    localStorage.setItem("shafinbd_active_playlist_id", activePlaylistId);
  }, [activePlaylistId]);

  // Save history on changes
  useEffect(() => {
    localStorage.setItem("shafinbd_history", JSON.stringify(history));
  }, [history]);

  // Save favorites selection
  useEffect(() => {
    localStorage.setItem("shafinbd_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Auto clear error status messages after 5 seconds
  useEffect(() => {
    if (importStatus) {
      const t = setTimeout(() => setImportStatus(null), 5000);
      return () => clearTimeout(t);
    }
  }, [importStatus]);

  // Extract unique categories based on both custom configuration and channels list categories
  const categories = useMemo(() => {
    const finalOrder: string[] = ["All", "Favorites"];
    
    // Extracted dynamic categories from channels
    const channelCats = new Set<string>();
    activeChannels.forEach(chan => {
      if (chan.category) {
        const trimmed = chan.category.trim();
        if (trimmed) {
          channelCats.add(trimmed);
        }
      }
    });

    const addedFromDb = new Set<string>();

    // Add elements from dbCategories (except duplicate/All/Favorites)
    dbCategories.forEach(cat => {
      const trimmed = cat.trim();
      if (trimmed && trimmed !== "All" && trimmed !== "Favorites") {
        const lower = trimmed.toLowerCase();
        if (!addedFromDb.has(lower)) {
          finalOrder.push(trimmed);
          addedFromDb.add(lower);
        }
      }
    });

    // Append any channel categories that were NOT in dbCategories
    channelCats.forEach(cat => {
      const lower = cat.toLowerCase();
      if (!addedFromDb.has(lower) && cat !== "All" && cat !== "Favorites") {
        finalOrder.push(cat);
        addedFromDb.add(lower);
      }
    });

    return finalOrder;
  }, [activeChannels, dbCategories]);

  // Filter channels lists by category & search query
  const filteredChannels = useMemo(() => {
    return activeChannels.filter(chan => {
      // Category matches
      const categoryMatch = 
        selectedCategory === "All" ||
        (selectedCategory === "Favorites" && favorites.includes(chan.id)) ||
        chan.category === selectedCategory;

      // Search matches (case insensitive)
      const queryLower = searchQuery.toLowerCase();
      const searchMatch = 
        chan.name.toLowerCase().includes(queryLower) ||
        (chan.category && chan.category.toLowerCase().includes(queryLower)) ||
        (chan.groupTitle && chan.groupTitle.toLowerCase().includes(queryLower));

      return categoryMatch && searchMatch;
    });
  }, [activeChannels, selectedCategory, searchQuery, favorites]);

  // --- ACTIONS & HANDLERS ---

  // Handle switching channel source safely
  const handleSelectChannel = (channel: Channel) => {
    setActiveChannel(channel);
    setMobileActiveTab("player");
    
    // Push into play history list (preventing duplicate sequential logs & keeping most recent first)
    const newHistoryItem: PlayHistoryItem = {
      channelId: channel.id,
      name: channel.name,
      url: channel.url,
      category: channel.category,
      logoUrl: channel.logoUrl,
      timestamp: Date.now()
    };

    setHistory(prev => {
      const filtered = prev.filter(item => item.channelId !== channel.id);
      return [newHistoryItem, ...filtered].slice(0, 50); // limit to last 50 items
    });
  };

  // Switch Active Playlist Source
  const selectPlaylist = (playlistId: string) => {
    setActivePlaylistId(playlistId);
    setSelectedCategory("All");
    setSearchQuery("");
    
    const targetList = playlistId === "default" 
      ? (cloudChannels.length > 0 ? cloudChannels : DEFAULT_CHANNELS) 
      : playlists.find(p => p.id === playlistId)?.channels || [];
      
    if (targetList.length > 0) {
      const defaultChannel = targetList.find(c => c.isDefault) || targetList[0];
      setActiveChannel(defaultChannel);
    }
  };

  // Toggle channel to favorites
  const toggleFavorite = (channelId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(channelId)) {
        return prev.filter(id => id !== channelId);
      } else {
        return [...prev, channelId];
      }
    });
  };

  // Delete a saved custom playlist completely
  const handleDeletePlaylist = (playlistId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this custom playlist?")) {
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      if (activePlaylistId === playlistId) {
        setActivePlaylistId("default");
        setSelectedCategory("All");
        const fallbackList = cloudChannels.length > 0 ? cloudChannels : DEFAULT_CHANNELS;
        if (fallbackList && fallbackList.length > 0) {
          setActiveChannel(fallbackList[0]);
        }
      }
      setImportStatus({ type: "success", text: "Playlist removed cleanly." });
    }
  };

  // Quick direct stream loader
  const handlePlayDirectStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directStreamUrl.trim()) {
      setImportStatus({ type: "error", text: "Please supply a valid Stream URL." });
      return;
    }

    const newChannel: Channel = {
      id: `direct_${Date.now()}`,
      name: directStreamName.trim() || `Direct Stream`,
      url: directStreamUrl.trim(),
      category: directStreamCategory.trim() || `Custom Link`,
      description: "Direct parsed stream custom loader."
    };

    setActiveChannel(newChannel);
    handleSelectChannel(newChannel);
    setImportStatus({ type: "success", text: "Direct HLS Stream loaded in active player!" });
  };

  // M3U Local File upload selector response
  const handleM3UFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        const playlistName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
        const parsedChannels = parseM3U(content, playlistName);

        if (parsedChannels.length === 0) {
          setImportStatus({ type: "error", text: "Failed to locate HLS channels. Verify M3U payload format." });
          return;
        }

        const newPlaylist: SavedPlaylist = {
          id: `playlist_${Date.now()}`,
          name: playlistName,
          channels: parsedChannels,
          importDate: new Date().toLocaleDateString(),
          isActive: false
        };

        setPlaylists(prev => [...prev, newPlaylist]);
        setActivePlaylistId(newPlaylist.id);
        setActiveChannel(parsedChannels[0]);
        setSelectedCategory("All");
        
        setImportStatus({ 
          type: "success", 
          text: `Success! Imported ${parsedChannels.length} channels from "${playlistName}".` 
        });
      } catch (err) {
        setImportStatus({ type: "error", text: "Parse failure. Please ensure a valid .m3u or .m3u8 text format." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Remote Playlist URL compiler loader
  const handleImportRemotePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = playlistUrlInput.trim();
    const name = playlistNameInput.trim() || `Cloud Feed ${playlists.length + 1}`;

    if (!url) {
      setImportStatus({ type: "error", text: "Please state a valid playlist link URL." });
      return;
    }

    setImportStatus({ type: "info", text: "Requesting playlist payload from host stream..." });

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("HTTP connection failed. Access blocked or network offline");
      }
      const rawText = await response.text();
      const parsedChannels = parseM3U(rawText, name);

      if (parsedChannels.length === 0) {
        setImportStatus({ type: "error", text: "Empty file. Check if URL contains actual #EXTM3U formatting." });
        return;
      }

      const newPlaylist: SavedPlaylist = {
        id: `playlist_${Date.now()}`,
        name: name,
        channels: parsedChannels,
        importDate: new Date().toLocaleDateString(),
        isActive: false
      };

      setPlaylists(prev => [...prev, newPlaylist]);
      setActivePlaylistId(newPlaylist.id);
      setActiveChannel(parsedChannels[0]);
      setSelectedCategory("All");
      setPlaylistUrlInput("");
      setPlaylistNameInput("");

      setImportStatus({ 
        type: "success", 
        text: `Success! Streamed ${parsedChannels.length} channels dynamically.` 
      });

    } catch (err: any) {
      console.error(err);
      setImportStatus({ 
        type: "error", 
        text: "Direct connection blocked by CORS security. If importing from a custom subscription dashboard, download the .m3u file and select 'Upload File' tab." 
      });
    }
  };

  // Reset watchlist history
  const handleClearHistory = () => {
    if (confirm("Reset watch history log list?")) {
      setHistory([]);
      setImportStatus({ type: "success", text: "History log cleared." });
    }
  };

  return {
    playlists,
    setPlaylists,
    activePlaylistId,
    setActivePlaylistId,
    history,
    setHistory,
    favorites,
    setFavorites,
    activeChannel,
    setActiveChannel,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    activeControlTab,
    setActiveControlTab,
    activeImportMethod,
    setActiveImportMethod,
    mobileActiveTab,
    setMobileActiveTab,
    directStreamUrl,
    setDirectStreamUrl,
    directStreamName,
    setDirectStreamName,
    directStreamCategory,
    setDirectStreamCategory,
    playlistUrlInput,
    setPlaylistUrlInput,
    playlistNameInput,
    setPlaylistNameInput,
    importStatus,
    setImportStatus,
    activeChannels,
    categories,
    filteredChannels,
    handleSelectChannel,
    selectPlaylist,
    toggleFavorite,
    handleDeletePlaylist,
    handlePlayDirectStream,
    handleM3UFileUpload,
    handleImportRemotePlaylist,
    handleClearHistory,
    // Cloud states
    cloudChannels,
    isLoadingCloud,
    handleSeedDefaultChannels,
    handleAddCloudChannel,
    handleUpdateCloudChannel,
    handleDeleteCloudChannel,
    handleReorderCloudChannels,
    handleSetDefaultCloudChannel,
    // Popup controller
    popupConfig,
    handleUpdatePopupConfig,
    // Categories management
    dbCategories,
    handleUpdateCategories,
  };
}
