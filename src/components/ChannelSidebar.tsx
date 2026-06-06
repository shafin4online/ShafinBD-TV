/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Video, Search, AlertTriangle, Heart, Info, ArrowUpDown } from "lucide-react";
import { Channel } from "../types";

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
        
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 font-mono tracking-widest uppercase flex items-center gap-1.5">
            <Video size={13} className="text-cyan-400" />
            Live Stations
          </h2>
          <span className="bg-neutral-800 text-[10px] text-slate-300 font-mono font-bold px-2 py-0.5 rounded-lg border border-white/5">
            {filteredChannels.length} of {activeChannels.length}
          </span>
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
              placeholder="Search TV channels..."
              className="w-full bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2 pl-9 pr-3 text-xs outline-none text-neutral-200 transition"
            />
          </div>

          <div className="shrink-0 flex items-center bg-zinc-950 border border-white/10 hover:border-white/15 focus-within:border-cyan-500 rounded-xl overflow-hidden transition px-2">
            <ArrowUpDown size={12} className="text-slate-400 mr-1 shrink-0" />
            <select
              id="stations-sort-selector"
              value={sortMethod}
              onChange={(e) => setSortMethod(e.target.value as "recent" | "name")}
              className="bg-transparent text-neutral-300 text-[11px] py-2 pr-1 outline-none cursor-pointer font-semibold select-none"
            >
              <option value="recent">Recent</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Top Categories Filters Tabbed line */}
        <div id="category-scroller" className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] px-2.5 py-1 rounded-lg shrink-0 font-bold border transition ${
                selectedCategory === cat
                  ? "bg-cyan-500 text-black border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  : "bg-neutral-800 border-white/5 text-slate-300 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              {cat === "Favorites" ? "❤️ Favs" : cat}
            </button>
          ))}
        </div>

      </div>

      {/* Channels Scroll lists container */}
      <div 
        id="channels-sidebar-list" 
        className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5 scrollbar-thin scrollbar-thumb-white/5 divide-y divide-white/5"
      >
        {sortedChannels.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
            <AlertTriangle size={20} className="mb-2 text-slate-600" />
            <p className="text-xs">No channels found matching filters.</p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-cyan-400 hover:underline mt-2 flex items-center gap-1"
              >
                Clear Search
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
                        <span className="text-[8px] bg-red-600/25 px-1 py-0.5 rounded text-red-500 animate-pulse font-mono tracking-widest font-bold">
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
                  className={`p-1.5 rounded-lg hover:bg-white/5 block ${
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
          CORS restriction is a generic browser protection block. Feeds requires the target stream servers to send clear cross-domain permissions.
        </span>
      </div>

    </aside>
  );
}
