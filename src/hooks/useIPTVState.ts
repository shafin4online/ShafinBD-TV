import React, { useState, useEffect, useMemo } from "react";
import { Channel, SavedPlaylist, PlayHistoryItem } from "../types";
import { DEFAULT_CHANNELS } from "../data/defaultChannels";
import { parseM3U } from "../utils/m3uParser";

export default function useIPTVState() {
  // --- STATE PERSISTENCE & INITIALIZATION ---
  
  // Custom uploaded playlists list
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>(() => {
    try {
      const saved = localStorage.getItem("shafinbd_playlists");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active playlist ID ('default' or playlist.id)
  const [activePlaylistId, setActivePlaylistId] = useState<string>(() => {
    return localStorage.getItem("shafinbd_active_playlist_id") || "default";
  });

  // Watch history list
  const [history, setHistory] = useState<PlayHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("shafinbd_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Favorites list (IDs of channels)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("shafinbd_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Blocked / offline channels list
  const [blockedChannels, setBlockedChannels] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("shafinbd_blocked_channels");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toggle to hide blocked / dead channels automatically from listing
  const [hideBlocked, setHideBlocked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("shafinbd_hide_blocked");
      return saved ? JSON.parse(saved) === "true" || saved === "true" : true;
    } catch {
      return true;
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

  // Get active channels list based on selected playlist
  const activeChannels = useMemo(() => {
    if (activePlaylistId === "default") {
      return DEFAULT_CHANNELS;
    }
    const matching = playlists.find(p => p.id === activePlaylistId);
    return matching ? matching.channels : DEFAULT_CHANNELS;
  }, [activePlaylistId, playlists]);

  // Set default active channel if none loaded
  useEffect(() => {
    if (!activeChannel && activeChannels.length > 0) {
      const defaultChannel = activeChannels.find(c => c.id === "fifa_plus_us") || activeChannels[0];
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

  // Save blocked channels selection
  useEffect(() => {
    localStorage.setItem("shafinbd_blocked_channels", JSON.stringify(blockedChannels));
  }, [blockedChannels]);

  // Save hide blocked preference
  useEffect(() => {
    localStorage.setItem("shafinbd_hide_blocked", String(hideBlocked));
  }, [hideBlocked]);

  // Auto clear error status messages after 5 seconds
  useEffect(() => {
    if (importStatus) {
      const t = setTimeout(() => setImportStatus(null), 5000);
      return () => clearTimeout(t);
    }
  }, [importStatus]);

  // Extract unique categories based on currently selected channels list
  const categories = useMemo(() => {
    const list = new Set<string>();
    list.add("All");
    list.add("Favorites");
    
    activeChannels.forEach(chan => {
      if (chan.category) {
        list.add(chan.category);
      }
    });
    
    return Array.from(list);
  }, [activeChannels]);

  // Filter channels lists by category & search query
  const filteredChannels = useMemo(() => {
    return activeChannels.filter(chan => {
      // Filter out auto-hidden blocked channels
      if (hideBlocked && blockedChannels.includes(chan.id)) {
        return false;
      }

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
  }, [activeChannels, selectedCategory, searchQuery, favorites, blockedChannels, hideBlocked]);

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
      ? DEFAULT_CHANNELS 
      : playlists.find(p => p.id === playlistId)?.channels || [];
      
    if (targetList.length > 0) {
      setActiveChannel(targetList[0]);
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
        if (DEFAULT_CHANNELS.length > 0) {
          setActiveChannel(DEFAULT_CHANNELS[0]);
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

  // Handle auto-detect offline channel
  const handleChannelOffline = (channelId: string) => {
    setBlockedChannels(prev => {
      if (prev.includes(channelId)) return prev;
      const updated = [...prev, channelId];
      
      // Select another channel to play next if current active is now hidden
      if (activeChannel?.id === channelId) {
        // Find next non-blocked channel in our active list
        const fallback = activeChannels.find(c => c.id !== channelId && !updated.includes(c.id));
        if (fallback) {
          setActiveChannel(fallback);
        }
      }

      // Display dynamic temporary status notice
      const channelObj = activeChannels.find(c => c.id === channelId);
      const name = channelObj ? channelObj.name : "channel";
      setImportStatus({ 
        type: "info", 
        text: `Offline channel "${name}" automatically hidden to keep list clean.` 
      });

      return updated;
    });
  };

  // Reset/Clear all blocked channels
  const handleClearBlockedChannels = () => {
    setBlockedChannels([]);
    setImportStatus({ 
      type: "success", 
      text: "Hidden channels list restored successfully!" 
    });
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
    blockedChannels,
    setBlockedChannels,
    hideBlocked,
    setHideBlocked,
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
    handleChannelOffline,
    handleClearBlockedChannels,
  };
}
