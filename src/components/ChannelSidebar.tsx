/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Video, Search, AlertTriangle, Heart, Info, ArrowUpDown } from "lucide-react";
import { Channel, SavedPlaylist } from "../types";
import { translations, Language } from "../utils/translations";

export interface ChannelSidebarProps {
  filteredChannels: Channel[];
  activeChannels: Channel[];
  activeChannel: Channel | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  favorites: string[];
  toggleFavorite: (channelId: string, event: React.MouseEvent) => void;
  handleSelectChannel: (channel: Channel) => void;
  lang: Language;
  activePlaylistId: string;
  playlists: SavedPlaylist[];
  selectPlaylist: (playlistId: string) => void;
}

export default function ChannelSidebar({
  filteredChannels,
  activeChannels,
  activeChannel,
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategory,
  setSelectedCategory,
  favorites,
  toggleFavorite,
  handleSelectChannel,
  lang,
  activePlaylistId,
  playlists,
  selectPlaylist,
}: ChannelSidebarProps) {
  const [sortMethod, setSortMethod] = useState<"recent" | "name">("recent");

  // Dynamically sort the filtered channels locally
  const sortedChannels = useMemo(() => {
    const list = [...filteredChannels];
    if (sortMethod === "name") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    // 'recent' keeps original M3U list index / recently added stream order
    return list;
  }, [filteredChannels, sortMethod]);

  return (
    <aside id="channel-list-aside" className="lg:col-span-4 w-full flex flex-col gap-5 bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden shadow-xl self-stretch lg:h-[calc(100vh-120px)] lg:sticky lg:top-24">
      
      {/* Sidebar Header Console */}
      <div className="p-4 border-b border-white/5 bg-zinc-950/50 flex flex-col gap-3">
        
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold text-slate-300 font-mono tracking-widest uppercase flex items-center gap-1.5 truncate">
            <Video size={13} className="text-cyan-400 shrink-0" />
            {translations[lang].live_stations_header}
          </h2>
          <span className="bg-neutral-800 text-[9px] sm:text-[10px] text-slate-300 font-mono font-bold px-2 py-0.5 rounded-lg border border-white/5 shrink-0">
            {filteredChannels.length} / {activeChannels.length}
          </span>
        </div>

        {/* Playlist Selector inside Sidebar */}
        <div className="flex flex-col gap-1.5 bg-zinc-950 p-2 rounded-xl border border-white/5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-1 shrink-0">
            {translations[lang].select_playlist}:
          </span>
          <select
            id="sidebar-playlist-selector"
            value={activePlaylistId}
            onChange={(e) => selectPlaylist(e.target.value)}
            className="bg-zinc-900 border border-white/10 hover:border-white/20 hover:text-white text-neutral-200 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-cyan-500 cursor-pointer min-w-0 flex-1 font-semibold transition"
          >
            <option value="default" className="bg-neutral-900 text-neutral-300">
              {lang === "bn" ? "🌍 ডিফল্ট চ্যানেলসমূহ" : "🌍 Default channels (Public)"}
            </option>
            {playlists.map((ply) => (
              <option key={ply.id} value={ply.id} className="bg-neutral-900 text-neutral-300">
                📂 {ply.name} ({ply.channels?.length || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Smart search input and sorting selection bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search size={14} />
            </span>
            <input
              id="search-channel-sidebar"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={translations[lang].search_placeholder}
              className="w-full bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2 pl-9 pr-3 text-xs outline-none text-neutral-200 transition"
            />
          </div>

          <div className="shrink-0 flex items-center bg-zinc-950 border border-white/10 hover:border-white/15 focus-within:border-cyan-500 rounded-xl overflow-hidden transition px-2">
            <ArrowUpDown size={12} className="text-slate-400 mr-1 shrink-0" />
            <select
              id="stations-sort-selector"
              value={sortMethod}
              onChange={(e) => setSortMethod(e.target.value as "recent" | "name")}
              className="bg-transparent text-neutral-300 text-[11px] py-2 pr-1 outline-none cursor-pointer font-semibold select-none bg-zinc-950 border-none"
            >
              <option value="recent" className="bg-neutral-900">{lang === "bn" ? "সাম্প্রতিক" : "Recent"}</option>
              <option value="name" className="bg-neutral-900">{lang === "bn" ? "নাম A-Z" : "Name A-Z"}</option>
            </select>
          </div>
        </div>

        {/* Top Categories Filters Tabbed line */}
        <div id="category-scroller" className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 select-none">
          {categories.map((cat) => {
            const displayLabel = cat === "Favorites" 
              ? (lang === "bn" ? "❤️ ফেভারিটস" : "❤️ Favs") 
              : cat === "All" 
                ? translations[lang].all_categories 
                : cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] px-2.5 py-1.5 rounded-lg shrink-0 font-bold border transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-cyan-500 text-black border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-extrabold"
                    : "bg-neutral-800 border-white/5 text-slate-300 hover:bg-neutral-700 hover:text-white"
                }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>

      </div>

      {/* Channels Scroll lists container */}
      <div 
        id="channels-sidebar-list" 
        className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5 scrollbar-thin scrollbar-thumb-white/5 divide-y divide-white/5"
      >
        {sortedChannels.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
            <AlertTriangle size={20} className="mb-2 text-slate-600 animate-bounce" />
            <p className="text-xs">
              {lang === "bn" ? "কোনো মিল পাওয়া যায়নি।" : "No channels found matching filters."}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-cyan-400 hover:underline mt-2 flex items-center gap-1 cursor-pointer"
              >
                {lang === "bn" ? "সার্চ মুছুন" : "Clear Search"}
              </button>
            )}
          </div>
        ) : (
          sortedChannels.map((chan) => {
            const isCurrent = activeChannel?.id === chan.id;
            const isFav = favorites.includes(chan.id);
            
            return (
              <div
                key={chan.id}
                onClick={() => handleSelectChannel(chan)}
                className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition relative group ${
                  isCurrent 
                    ? "bg-cyan-500/10 border border-cyan-500/30 text-white" 
                    : "border border-transparent hover:bg-white/5 text-slate-300 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {/* Logo or placeholder logo styling block */}
                  {chan.logoUrl ? (
                    <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/10 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                      <img 
                        src={chan.logoUrl} 
                        alt={chan.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-white/10 text-[10px] font-bold text-cyan-400 flex items-center justify-center shrink-0">
                      {chan.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs truncate leading-normal">
                      {chan.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-slate-500 font-semibold font-mono tracking-wider uppercase">
                        {chan.category || "General"}
                      </span>
                      {isCurrent && (
                        <span className="text-[8px] bg-red-600/25 px-1.5 py-0.5 rounded text-red-500 animate-pulse font-mono tracking-widest font-bold">
                          LIVE
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bookmarking / Heart element */}
                <button
                  id={`btn-favorite-icon-${chan.id}`}
                  onClick={(e) => toggleFavorite(chan.id, e)}
                  title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                  className={`p-1.5 rounded-lg hover:bg-white/5 block cursor-pointer shrink-0 ${
                    isFav ? "text-rose-500" : "text-slate-500 group-hover:text-slate-300 hover:text-white transition duration-200"
                  }`}
                >
                  <Heart size={14} fill={isFav ? "currentColor" : "none"} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Informational Drawer Footer inside block */}
      <div className="p-3 bg-zinc-950/80 border-t border-white/5 text-[10px] text-zinc-500 leading-normal flex items-start gap-2 select-none">
        <Info size={14} className="shrink-0 mt-0.5 text-slate-400" />
        <span>
          {lang === "bn"
            ? "CORS রেস্ট্রিকশন ব্রাউজারের একটি ডিফল্ট নিরাপত্তা ব্যবস্থা। চ্যানেল চালানোর জন্য মূল সার্ভারের ক্রস-অরিজিন পারমিশন সাপোর্ট থাকা প্রয়োজন।"
            : "CORS restriction is a generic browser protection block. Feeds requires the target stream servers to send clear cross-domain permissions."}
        </span>
      </div>

    </aside>
  );
}
