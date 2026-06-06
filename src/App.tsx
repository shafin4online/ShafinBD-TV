/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Tv, 
  Plus, 
  AlertTriangle,
  List
} from "lucide-react";
import { Channel, SavedPlaylist, PlayHistoryItem } from "./types";
import { DEFAULT_CHANNELS } from "./data/defaultChannels";
import { parseM3U } from "./utils/m3uParser";
import IPTVPlayer from "./components/IPTVPlayer";
import ChannelSidebar from "./components/ChannelSidebar";
import PlaylistManager from "./components/PlaylistManager";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
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

  // Currently playing channel
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  // Active sidebar control states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Tab selections
  // activeImporTab: 'link' (direct stream), 'm3u_file' (upload playlist), 'm3u_url' (link playlist), 'history' (recent play logs)
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

  // --- DERIVED SENSORS & DATA AGGREGATION ---

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
      setActiveChannel(activeChannels[0]);
    }
  }, [activeChannels]);

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
    // Reset file input value
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
      // Attempt fetching directly
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

  return (
    <div id="shafinbd-tv-root" className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-cyan-500 selection:text-neutral-950 flex flex-col antialiased">
      
      {/* 🚀 Sleek Header */}
      <Header playlistsCount={playlists.length + 1} />

      {/* 💻 Main Layout Grid Block */}
      <main id="app-main-layout" className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-24 lg:pb-6">
        
        {/* Left Side: Video Host & Configurations (8/12 Columns) */}
        <div 
          id="player-and-import-panel" 
          className={`lg:col-span-8 flex flex-col gap-6 w-full ${
            mobileActiveTab === "player" || mobileActiveTab === "playlists" ? "flex" : "hidden lg:flex"
          }`}
        >
          
          {/* Main IPTV player */}
          <div className={`${mobileActiveTab === "player" ? "block" : "hidden lg:block"}`}>
            <IPTVPlayer 
              channel={activeChannel} 
              onAutoPlayFailed={() => {
                // Custom prompt handled gracefully by player internally
              }}
            />
          </div>

          {/* Quick Playlist Selection Bar & Info Statuses */}
          <div className={`flex flex-col gap-4 bg-neutral-900/40 border border-white/5 p-4 rounded-2xl relative ${
            mobileActiveTab === "player" ? "flex" : "hidden lg:flex"
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-neutral-400 text-xs font-medium tracking-wide">ACTIVE IPTV SOURCE:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-white text-sm">
                    {activePlaylistId === "default" ? "🌍 shafinbd Default Public Live Stations" : `📂 ${playlists.find(p => p.id === activePlaylistId)?.name}`}
                  </span>
                  <span className="bg-white/5 hover:bg-white/10 text-[10px] text-neutral-300 border border-white/10 px-2 py-0.5 rounded-lg select-none">
                    {activeChannels.length} streams
                  </span>
                </div>
              </div>

              {/* Select Dropdown lists */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 shrink-0 hidden sm:inline">Switch Feed:</span>
                <select
                  id="playlist-selector"
                  value={activePlaylistId}
                  onChange={(e) => selectPlaylist(e.target.value)}
                  className="bg-zinc-950 border border-white/10 hover:border-white/20 text-neutral-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-cyan-500 cursor-pointer min-w-[180px] font-medium transition"
                >
                  <option value="default">🌍 default stations (Public)</option>
                  {playlists.map((ply) => (
                    <option key={ply.id} value={ply.id}>
                      📂 {ply.name} ({ply.channels.length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error notifications / confirmation banners builder */}
            {importStatus && (
              <div 
                id="utility-alert-banner"
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed animate-fade-in ${
                  importStatus.type === "success" 
                    ? "bg-cyan-950/40 border-cyan-500/20 text-cyan-300" 
                    : importStatus.type === "error"
                    ? "bg-rose-950/40 border-rose-500/20 text-rose-300"
                    : "bg-teal-950/40 border-teal-500/20 text-teal-300"
                }`}
              >
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{importStatus.text}</span>
              </div>
            )}
          </div>

          {/* Configuration Desk (Playlists import & Links payload) */}
          <div className={`${mobileActiveTab === "playlists" ? "block" : "hidden lg:block"}`}>
            <PlaylistManager
              playlists={playlists}
              activePlaylistId={activePlaylistId}
              history={history}
              favorites={favorites}
              activeControlTab={activeControlTab}
              setActiveControlTab={setActiveControlTab}
              activeImportMethod={activeImportMethod}
              setActiveImportMethod={setActiveImportMethod}
              directStreamUrl={directStreamUrl}
              setDirectStreamUrl={setDirectStreamUrl}
              directStreamName={directStreamName}
              setDirectStreamName={setDirectStreamName}
              directStreamCategory={directStreamCategory}
              setDirectStreamCategory={setDirectStreamCategory}
              playlistUrlInput={playlistUrlInput}
              setPlaylistUrlInput={setPlaylistUrlInput}
              playlistNameInput={playlistNameInput}
              setPlaylistNameInput={setPlaylistNameInput}
              activeChannels={activeChannels}
              handleSelectChannel={handleSelectChannel}
              selectPlaylist={selectPlaylist}
              toggleFavorite={toggleFavorite}
              handleDeletePlaylist={handleDeletePlaylist}
              handlePlayDirectStream={handlePlayDirectStream}
              handleM3UFileUpload={handleM3UFileUpload}
              handleImportRemotePlaylist={handleImportRemotePlaylist}
              handleClearHistory={handleClearHistory}
            />
          </div>

        </div>

        {/* Right Side: Channel Sidebar (4/12 Columns) */}
        <div className={`lg:col-span-4 w-full ${mobileActiveTab === "channels" ? "block" : "hidden lg:block"}`}>
          <ChannelSidebar
            filteredChannels={filteredChannels}
            activeChannels={activeChannels}
            activeChannel={activeChannel}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            handleSelectChannel={handleSelectChannel}
          />
        </div>

      </main>

      {/* 📱 Mobile & Tablet View bottom navigation menu bar */}
      <nav id="mobile-bottom-nav" className="lg:hidden fixed bottom-5 left-5 right-5 z-50 bg-black/95 backdrop-blur-lg border border-white/10 rounded-2xl p-2 flex items-center justify-around shadow-2xl shadow-cyan-950/30">
        <button
          onClick={() => setMobileActiveTab("player")}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition duration-200 outline-none select-none ${
            mobileActiveTab === "player"
              ? "text-cyan-400 bg-cyan-950/40 border border-cyan-500/15 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Tv size={16} className={mobileActiveTab === "player" ? "text-cyan-400 animate-pulse" : "text-slate-400"} />
          <span className="text-[10px] font-bold tracking-wider uppercase">Watch</span>
        </button>

        <button
          onClick={() => setMobileActiveTab("channels")}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition duration-200 relative outline-none select-none ${
            mobileActiveTab === "channels"
              ? "text-cyan-400 bg-cyan-950/40 border border-cyan-500/15 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="absolute top-2 right-1/4 flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
          </span>
          <List size={16} className={mobileActiveTab === "channels" ? "text-cyan-400" : "text-slate-400"} />
          <span className="text-[10px] font-bold tracking-wider uppercase">Stations</span>
        </button>

        <button
          onClick={() => setMobileActiveTab("playlists")}
          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition duration-200 outline-none select-none ${
            mobileActiveTab === "playlists"
              ? "text-cyan-400 bg-cyan-950/40 border border-cyan-500/15 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Plus size={16} className={mobileActiveTab === "playlists" ? "text-cyan-400" : "text-slate-400"} />
          <span className="text-[10px] font-bold tracking-wider uppercase">Feeds</span>
        </button>
      </nav>

      {/* 🔮 Deep Footer */}
      <Footer />

    </div>
  );
}
