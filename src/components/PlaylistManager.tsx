/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Plus, 
  Heart, 
  History, 
  Trash2, 
  Link, 
  Video, 
  FolderOpen, 
  Globe, 
  Upload, 
  AlertTriangle 
} from "lucide-react";
import { Channel, SavedPlaylist, PlayHistoryItem } from "../types";

export interface PlaylistManagerProps {
  playlists: SavedPlaylist[];
  activePlaylistId: string;
  history: PlayHistoryItem[];
  favorites: string[];
  activeControlTab: "import" | "history" | "favorites";
  setActiveControlTab: (tab: "import" | "history" | "favorites") => void;
  activeImportMethod: "link" | "upload" | "m3u_url";
  setActiveImportMethod: (method: "link" | "upload" | "m3u_url") => void;
  
  // Custom stream binders
  directStreamUrl: string;
  setDirectStreamUrl: (val: string) => void;
  directStreamName: string;
  setDirectStreamName: (val: string) => void;
  directStreamCategory: string;
  setDirectStreamCategory: (val: string) => void;
  
  // Cloud playlist binder
  playlistUrlInput: string;
  setPlaylistUrlInput: (val: string) => void;
  playlistNameInput: string;
  setPlaylistNameInput: (val: string) => void;
  
  activeChannels: Channel[];
  
  // Core actions
  handleSelectChannel: (channel: Channel) => void;
  selectPlaylist: (playlistId: string) => void;
  toggleFavorite: (channelId: string, event: React.MouseEvent) => void;
  handleDeletePlaylist: (playlistId: string, event: React.MouseEvent) => void;
  handlePlayDirectStream: (e: React.FormEvent) => void;
  handleM3UFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImportRemotePlaylist: (e: React.FormEvent) => void;
  handleClearHistory: () => void;
}

export default function PlaylistManager({
  playlists,
  activePlaylistId,
  history,
  favorites,
  activeControlTab,
  setActiveControlTab,
  activeImportMethod,
  setActiveImportMethod,
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
  activeChannels,
  handleSelectChannel,
  selectPlaylist,
  toggleFavorite,
  handleDeletePlaylist,
  handlePlayDirectStream,
  handleM3UFileUpload,
  handleImportRemotePlaylist,
  handleClearHistory,
}: PlaylistManagerProps) {
  return (
    <section id="playlist-manager" className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
      
      {/* Headers tabs */}
      <div className="border-b border-white/5 bg-zinc-950/50 flex select-none">
        <button
          id="tab-import"
          onClick={() => setActiveControlTab("import")}
          className={`flex-1 py-3 text-xs md:text-sm font-semibold tracking-wide border-b-2 flex items-center justify-center gap-2 transition ${
            activeControlTab === "import" 
              ? "border-cyan-400 bg-neutral-900 text-white" 
              : "border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/10"
          }`}
        >
          <Plus size={15} />
          Load Streams
        </button>
        <button
          id="tab-favorites"
          onClick={() => setActiveControlTab("favorites")}
          className={`flex-1 py-3 text-xs md:text-sm font-semibold tracking-wide border-b-2 flex items-center justify-center gap-2 transition ${
            activeControlTab === "favorites" 
              ? "border-cyan-400 bg-neutral-900 text-white" 
              : "border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/10"
          }`}
        >
          <Heart size={15} />
          Favorites ({favorites?.length || 0})
        </button>
        <button
          id="tab-history"
          onClick={() => setActiveControlTab("history")}
          className={`flex-1 py-3 text-xs md:text-sm font-semibold tracking-wide border-b-2 flex items-center justify-center gap-2 transition ${
            activeControlTab === "history" 
              ? "border-cyan-400 bg-neutral-900 text-white" 
              : "border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/10"
          }`}
        >
          <History size={15} />
          Recent History
        </button>
      </div>

      {/* Config Panels body */}
      <div className="p-5 md:p-6 text-sm">
        
        {/* --- LOAD STREAMS PANEL --- */}
        {activeControlTab === "import" && (
          <div className="space-y-6">
            
            {/* Selector options subtabs */}
            <div className="flex gap-2 p-1 bg-zinc-950 rounded-xl border border-white/5 w-fit select-none">
              <button
                onClick={() => setActiveImportMethod("link")}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition ${
                  activeImportMethod === "link"
                    ? "bg-neutral-800 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📺 Live Stream URL
              </button>
              <button
                onClick={() => setActiveImportMethod("upload")}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition ${
                  activeImportMethod === "upload"
                    ? "bg-neutral-800 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📎 Upload M3U List
              </button>
              <button
                onClick={() => setActiveImportMethod("m3u_url")}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition ${
                  activeImportMethod === "m3u_url"
                    ? "bg-neutral-800 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ⛓️ M3U Link
              </button>
            </div>

            {/* 1. Direct Loader Form */}
            {activeImportMethod === "link" && (
              <form onSubmit={handlePlayDirectStream} className="space-y-4">
                <div>
                  <h4 className="text-white font-bold leading-normal text-sm mb-1">Direct M3U8 Stream Play</h4>
                  <p className="text-slate-400 text-xs">Instantly load any HLS Live Stream URL (.m3u8 index feeds) into the secure video player.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 font-mono">CHANNEL STREAM URL (.m3u8)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Link size={14} />
                      </span>
                      <input
                        id="input-direct-stream-url"
                        value={directStreamUrl}
                        onChange={(e) => setDirectStreamUrl(e.target.value)}
                        placeholder="https://example.com/playlist/live.m3u8"
                        className="w-full bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2 pl-9 pr-3 text-xs outline-none text-neutral-200 transition"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 font-mono">CHANNEL DISPLAY NAME (OPTIONAL)</label>
                    <input
                      id="input-direct-stream-name"
                      value={directStreamName}
                      onChange={(e) => setDirectStreamName(e.target.value)}
                      placeholder="My Test Channel"
                      className="w-full bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2 px-3 text-xs outline-none text-neutral-200 transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300 font-mono">CATEGORY LABEL (OPTIONAL)</label>
                  <input
                    id="input-direct-stream-category"
                    value={directStreamCategory}
                    onChange={(e) => setDirectStreamCategory(e.target.value)}
                    placeholder="General"
                    className="w-full max-w-[280px] bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2 px-3 text-xs outline-none text-neutral-200 transition"
                  />
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-end">
                  <button
                    id="btn-play-custom-hls"
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-600 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-[0.98] font-bold text-xs text-black px-5 py-2.5 rounded-xl shadow-lg transition duration-150 flex items-center gap-1.5"
                  >
                    <Video size={14} />
                    Launch Stream
                  </button>
                </div>
              </form>
            )}

            {/* 2. Drag & Drop Upload File playlist */}
            {activeImportMethod === "upload" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">Import Local Playlist File</h4>
                  <p className="text-slate-400 text-xs">Choose or drag an `.m3u` / `.m3u8` formatted playlist. Channels will be cached securely inside your web browser.</p>
                </div>

                <div className="border border-dashed border-white/10 hover:border-cyan-500/50 bg-zinc-950/55 rounded-2xl p-6 transition duration-200 text-center relative group">
                  <input
                    id="file-playlist-upload"
                    type="file"
                    accept=".m3u,.m3u8,text/plain"
                    onChange={handleM3UFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <FolderOpen size={36} className="text-slate-500 group-hover:text-cyan-400 mx-auto mb-3 transition duration-200" />
                  <span className="text-white text-xs font-bold block mb-1">Click to browse or Drag file here</span>
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Supports .m3u, .m3u8, UTF-8 txt indices</span>
                </div>
              </div>
            )}

            {/* 3. Load Remote URL playlist */}
            {activeImportMethod === "m3u_url" && (
              <form onSubmit={handleImportRemotePlaylist} className="space-y-4">
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">Import Cloud M3U URL</h4>
                  <p className="text-slate-400 text-xs">Provide a remote playlist hosting URL. Note that standard website firewalls block remote server resources due to CORS policies.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 font-mono">PLAYLIST INDEX URL</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Globe size={14} />
                      </span>
                      <input
                        id="input-playlist-import-url"
                        value={playlistUrlInput}
                        onChange={(e) => setPlaylistUrlInput(e.target.value)}
                        placeholder="https://example.com/playlist.m3u"
                        className="w-full bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2 pl-9 pr-3 text-xs outline-none text-neutral-200 transition"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300 font-mono">PLAYLIST CUSTOM TITLE</label>
                    <input
                      id="input-playlist-import-title"
                      value={playlistNameInput}
                      onChange={(e) => setPlaylistNameInput(e.target.value)}
                      placeholder="My Sports Feed"
                      className="w-full bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2 px-3 text-xs outline-none text-neutral-200 transition"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-end">
                  <button
                    id="btn-load-remote-m3u"
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-600 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-[0.98] font-bold text-xs text-black px-5 py-2.5 rounded-xl shadow-lg transition duration-150 flex items-center gap-1.5"
                  >
                    <Upload size={14} />
                    Pull Playlist Channels
                  </button>
                </div>
              </form>
            )}

            {/* List of custom imported playlists with delete options */}
            {(playlists?.length || 0) > 0 && (
              <div className="pt-4 border-t border-white/5">
                <h5 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-widest mb-3">Stored Custom Playlists ({playlists?.length || 0})</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(playlists || []).map((ply) => (
                    <div 
                      key={ply.id}
                      onClick={() => selectPlaylist(ply.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        activePlaylistId === ply.id 
                          ? "bg-cyan-500/10 border-cyan-500/30 text-white" 
                          : "bg-zinc-950/60 border-white/5 text-slate-300 hover:border-white/10"
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-4">
                        <span className="font-bold text-xs truncate max-w-[190px]">{ply.name}</span>
                        <span className="text-[10px] text-slate-400 mt-1">{ply.channels?.length || 0} channels • {ply.importDate}</span>
                      </div>
                      <button
                        id={`btn-delete-playlist-${ply.id}`}
                        onClick={(e) => handleDeletePlaylist(ply.id, e)}
                        title="Delete Playlist"
                        className="text-slate-500 hover:text-red-400 p-1.5 transition duration-150 rounded-lg hover:bg-white/5 shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* --- FAVORITES PANEL --- */}
        {activeControlTab === "favorites" && (
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Your Favorite Channels</h4>
              <p className="text-slate-400 text-xs">Quick access bookmark list. Click on the heart icon on any channel in the sidebar to add it here.</p>
            </div>

            {(favorites?.length || 0) === 0 ? (
              <div className="text-center py-8 text-neutral-500 bg-zinc-950/30 rounded-xl border border-white/5">
                <Heart className="mx-auto mb-2 opacity-30 text-rose-500" size={28} />
                <p className="text-xs font-medium">Favorite streams list is currently empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeChannels
                  .filter(chan => favorites.includes(chan.id))
                  .map((chan) => (
                    <div
                      key={chan.id}
                      onClick={() => handleSelectChannel(chan)}
                      className="bg-zinc-950/50 hover:bg-zinc-900 border border-white/5 p-3 rounded-xl flex items-center justify-between cursor-pointer hover:border-white/10 transition duration-150"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {chan.logoUrl ? (
                          <img 
                            src={chan.logoUrl} 
                            alt={chan.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => (e.target as HTMLElement).style.display = "none"}
                            className="w-7 h-7 rounded-lg object-contain bg-neutral-900 p-0.5 shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-neutral-900 text-[10px] font-bold text-cyan-400 flex items-center justify-center shrink-0">
                            {chan.name.slice(0,2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-bold text-xs truncate text-white">{chan.name}</span>
                      </div>
                      <button
                        id={`btn-unfav-${chan.id}`}
                        onClick={(e) => toggleFavorite(chan.id, e)}
                        className="text-rose-500 p-1 hover:bg-rose-500/10 rounded"
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                    </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- WATCH HISTORY PANEL --- */}
        {activeControlTab === "history" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-sm mb-0.5">Recents Played History</h4>
                <p className="text-slate-400 text-xs">Review channels you streamed recently on this browser.</p>
              </div>
              {(history?.length || 0) > 0 && (
                <button
                  id="btn-clear-history-logs"
                  onClick={handleClearHistory}
                  className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition flex items-center gap-1.5 bg-rose-950/20 border border-rose-950/50 hover:border-rose-900/50 px-2.5 py-1 rounded-lg"
                >
                  <Trash2 size={12} />
                  Clear History
                </button>
              )}
            </div>

            {(history?.length || 0) === 0 ? (
              <div className="text-center py-8 text-neutral-500 bg-zinc-950/30 rounded-xl border border-white/5">
                <History className="mx-auto mb-2 opacity-30" size={28} />
                <p className="text-xs font-medium">History is clean. Play some streams to populate this list.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {history.map((record, index) => (
                  <div
                    key={`${record.channelId}-${index}`}
                    onClick={() => handleSelectChannel({
                      id: record.channelId,
                      name: record.name,
                      url: record.url,
                      category: record.category,
                      logoUrl: record.logoUrl
                    })}
                    className="bg-zinc-950/50 hover:bg-zinc-900 border border-white/5 p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:border-white/10 transition min-w-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-neutral-900/80 shrink-0 flex items-center justify-center font-bold text-xs text-slate-400">
                      {index + 1}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs truncate text-white leading-normal">{record.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5">{new Date(record.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
