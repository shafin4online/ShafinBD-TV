/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Heart, 
  History, 
  Trash2
} from "lucide-react";
import { Channel, SavedPlaylist, PlayHistoryItem } from "../types";
import { translations, Language } from "../utils/translations";

export interface PlaylistManagerProps {
  playlists: SavedPlaylist[];
  activePlaylistId: string;
  history: PlayHistoryItem[];
  favorites: string[];
  activeControlTab: "import" | "history" | "favorites";
  setActiveControlTab: (tab: "import" | "history" | "favorites") => void;
  lang: Language;
  
  activeChannels: Channel[];
  
  // Core actions
  handleSelectChannel: (channel: Channel) => void;
  selectPlaylist: (playlistId: string) => void;
  toggleFavorite: (channelId: string, event: React.MouseEvent) => void;
  handleDeletePlaylist: (playlistId: string, event: React.MouseEvent) => void;
  handleClearHistory: () => void;
}

export default function PlaylistManager({
  playlists,
  activePlaylistId,
  history,
  favorites,
  activeControlTab,
  setActiveControlTab,
  lang,
  activeChannels,
  handleSelectChannel,
  selectPlaylist,
  toggleFavorite,
  handleDeletePlaylist,
  handleClearHistory,
}: PlaylistManagerProps) {
  return (
    <section id="playlist-manager" className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
      
      {/* Headers tabs */}
      <div className="border-b border-white/5 bg-zinc-950/50 flex select-none">
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
          {translations[lang].favorites} ({favorites?.length || 0})
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
          {translations[lang].recent_history}
        </button>
      </div>

      {/* Config Panels body */}
      <div className="p-5 md:p-6 text-sm">
        
        {/* --- FAVORITES PANEL --- */}
        {activeControlTab === "favorites" && (
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-bold text-sm mb-1">{translations[lang].favorites}</h4>
              <p className="text-slate-400 text-xs text-start">
                {lang === "bn" 
                  ? "দ্রুত অ্যাক্সেস বুকমার্ক তালিকা। যেকোনো চ্যানেলের পাশে হার্ট আইকনে ক্লিক করে এখানে যুক্ত করুন।" 
                  : "Quick access bookmark list. Click on the heart icon on any channel in the sidebar to add it here."}
              </p>
            </div>

            {(favorites?.length || 0) === 0 ? (
              <div className="text-center py-8 text-neutral-500 bg-zinc-950/30 rounded-xl border border-white/5">
                <Heart className="mx-auto mb-2 opacity-30 text-rose-500" size={28} />
                <p className="text-xs font-medium">{translations[lang].no_favorites}</p>
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
                        className="text-rose-500 p-1 hover:bg-rose-500/10 rounded cursor-pointer"
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
                <h4 className="text-white font-bold text-sm mb-0.5">{translations[lang].recent_history}</h4>
                <p className="text-slate-400 text-xs text-start">
                  {lang === "bn"
                    ? "এই ব্রাউজারে সম্প্রতি চালানো চ্যানেলগুলির ইতিহাস দেখে নিন।"
                    : "Review channels you streamed recently on this browser."}
                </p>
              </div>
              {(history?.length || 0) > 0 && (
                <button
                  id="btn-clear-history-logs"
                  onClick={handleClearHistory}
                  className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition flex items-center gap-1.5 bg-rose-950/20 border border-rose-950/50 hover:border-rose-900/50 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  <Trash2 size={12} />
                  {translations[lang].clear_history}
                </button>
              )}
            </div>

            {(history?.length || 0) === 0 ? (
              <div className="text-center py-8 text-neutral-500 bg-zinc-950/30 rounded-xl border border-white/5">
                <History className="mx-auto mb-2 opacity-30" size={28} />
                <p className="text-xs font-medium">{translations[lang].no_history}</p>
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
