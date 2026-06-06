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
  blockedChannelsCount?: number;
  onClearBlockedChannels?: () => void;
  hideBlockedChannels?: boolean;
  setHideBlockedChannels?: (hide: boolean) => void;
  onMarkOffline?: (channelId: string) => void;
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
  blockedChannelsCount = 0,
  onClearBlockedChannels,
  hideBlockedChannels = true,
  setHideBlockedChannels,
  onMarkOffline,
}: ChannelSidebarProps) {
  const [sortMethod, setSortMethod] = useState<"recent" | "name">("recent");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });

  // Dynamically sort the filtered channels locally
  const sortedChannels = useMemo(() => {
    const list = [...filteredChannels];
    if (sortMethod === "name") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    // 'recent' keeps original M3U list index / recently added stream order
    return list;
  }, [filteredChannels, sortMethod]);

  // Background scanner to check all sorted channels health
  const handleScanCategory = async () => {
    if (isScanning || sortedChannels.length === 0 || !onMarkOffline) return;
    setIsScanning(true);
    setScanProgress({ current: 0, total: sortedChannels.length });

    // Copy list of channels to check
    const listToScan = [...sortedChannels];
    let processed = 0;

    for (const chan of listToScan) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000); // 2 seconds timeout is fast!

        // Fetch stream URL with no-cors so we bypass any same-site controls to check if endpoint returns anything
        await fetch(chan.url, {
          method: "GET",
          mode: "no-cors",
          signal: controller.signal
        });
        clearTimeout(timeout);
      } catch (err) {
        onMarkOffline(chan.id);
      }
      processed++;
      setScanProgress({ current: processed, total: listToScan.length });
    }
    
    setIsScanning(false);
  };

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

      {/* Smart Auto-Check Shield Console */}
      <div id="smart-shield-console" className="mx-4 bg-zinc-950/40 px-3.5 py-3 rounded-xl border border-white/5 space-y-2 text-xs select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-mono tracking-wider font-bold">AUTO SHIELD TRACKER</span>
          </div>
          
          <button
            id="btn-toggle-auto-hide-blocked"
            onClick={() => setHideBlockedChannels?.(!hideBlockedChannels)}
            className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border transition cursor-pointer ${
              hideBlockedChannels 
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : "bg-neutral-800 text-slate-400 border-white/5 hover:text-white"
            }`}
          >
            {hideBlockedChannels ? "HIDE OFFLINE: ON" : "HIDE OFFLINE: OFF"}
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono">Hidden feeds: <strong className="text-rose-400">{blockedChannelsCount}</strong></span>
          <div className="flex items-center gap-3">
            {blockedChannelsCount > 0 && (
              <button
                id="btn-clear-blocked-channels"
                onClick={onClearBlockedChannels}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition cursor-pointer"
              >
                Reset Hidden
              </button>
            )}
            
            <button
              id="btn-scan-category-channels"
              onClick={handleScanCategory}
              disabled={isScanning || sortedChannels.length === 0}
              className={`font-semibold transition cursor-pointer ${
                isScanning 
                  ? "text-yellow-400 animate-pulse font-mono" 
                  : "text-slate-200 hover:text-cyan-400"
              }`}
            >
              {isScanning ? `Checking ${scanProgress.current}/${scanProgress.total}` : "Scan Category"}
            </button>
          </div>
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
