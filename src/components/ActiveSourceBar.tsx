import React from "react";
import { AlertTriangle } from "lucide-react";
import { SavedPlaylist } from "../types";

interface ActiveSourceBarProps {
  mobileActiveTab: string;
  activePlaylistId: string;
  playlists: SavedPlaylist[];
  activeChannelsCount: number;
  selectPlaylist: (playlistId: string) => void;
  importStatus: { type: "success" | "error" | "info"; text: string } | null;
}

export default function ActiveSourceBar({
  mobileActiveTab,
  activePlaylistId,
  playlists,
  activeChannelsCount,
  selectPlaylist,
  importStatus,
}: ActiveSourceBarProps) {
  return (
    <div className={`flex flex-col gap-4 bg-neutral-900/40 border border-white/5 p-4 rounded-2xl relative ${
      mobileActiveTab === "player" ? "flex" : "hidden lg:flex"
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-neutral-400 text-xs font-medium tracking-wide">ACTIVE IPTV SOURCE:</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-white text-sm">
              {activePlaylistId === "default" 
                ? "🌍 shafinbd Default Public Live Stations" 
                : `📂 ${playlists.find(p => p.id === activePlaylistId)?.name}`}
            </span>
            <span className="bg-white/5 hover:bg-white/10 text-[10px] text-neutral-300 border border-white/10 px-2 py-0.5 rounded-lg select-none">
              {activeChannelsCount} streams
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
  );
}
