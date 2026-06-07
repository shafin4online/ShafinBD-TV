/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { AlertTriangle, Flame, Layers, Play } from "lucide-react";
import { Channel, SavedPlaylist } from "../types";
import { translations, Language } from "../utils/translations";

interface ActiveSourceBarProps {
  mobileActiveTab: string;
  activePlaylistId: string;
  playlists: SavedPlaylist[];
  activeChannelsCount: number;
  selectPlaylist: (playlistId: string) => void;
  importStatus: { type: "success" | "error" | "info"; text: string } | null;
  lang: Language;
  
  // New props for dynamic popular grid calculations
  activeChannels: Channel[];
  playCounts: Record<string, number>;
  handleSelectChannel: (channel: Channel) => void;
}

export default function ActiveSourceBar({
  mobileActiveTab,
  activePlaylistId,
  playlists,
  activeChannelsCount,
  selectPlaylist,
  importStatus,
  lang,
  activeChannels,
  playCounts,
  handleSelectChannel,
}: ActiveSourceBarProps) {

  // Dynamically compute the top 6 popular channels
  const popularChannels = useMemo(() => {
    if (!activeChannels || activeChannels.length === 0) return [];
    
    // Sort channels by their play count from our reactive state (descending)
    const withCounts = activeChannels.filter(c => playCounts[c.id] && playCounts[c.id] > 0);
    
    withCounts.sort((a, b) => {
      const countsA = playCounts[a.id] || 0;
      const countsB = playCounts[b.id] || 0;
      return countsB - countsA;
    });

    if (withCounts.length > 0) {
      // If we have channels with recorded views, return the top 6
      return withCounts.slice(0, 6);
    }

    // Fallback on first load (if there are no user clicks yet):
    // Show default/featured streams to guarantee a stunning, populated home screen.
    return activeChannels.slice(0, 6);
  }, [activeChannels, playCounts]);

  return (
    <div 
      id="most-popular-container" 
      className={`flex flex-col gap-4 bg-neutral-900/40 border border-white/5 p-4 md:p-5 rounded-2xl relative select-none ${
        mobileActiveTab === "player" ? "flex" : "hidden lg:flex"
      }`}
    >
      {/* Header section with title and ultra-clean online badge */}
      <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-cyan-950/60 border border-cyan-500/25 rounded-lg shrink-0">
            <Flame className="text-cyan-400 animate-pulse" size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm md:text-base font-black text-white tracking-tight flex items-center gap-1.5 truncate">
              {translations[lang].most_popular_channels}
            </h3>
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wide truncate">
              {lang === "bn" ? "অটো জেনারেটেড" : "Auto-Generated Tracker"}
            </span>
          </div>
        </div>

        {/* Dynamic Glowing Live Status Dot Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 bg-zinc-950/80 px-2.5 py-1.5 rounded-xl border border-white/5 text-[10px] text-emerald-400 font-bold tracking-wide select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>
              {activeChannelsCount} {lang === "bn" ? "টি চ্যানেল অনলাইন" : "Channels Live"}
            </span>
          </span>
        </div>
      </div>

      {/* Grid of Popular Channels */}
      {popularChannels.length === 0 ? (
        <div className="text-center py-6 text-neutral-500 bg-zinc-950/20 rounded-xl border border-white/5">
          <p className="text-xs font-semibold">{translations[lang].no_clicks_yet}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 transform-gpu">
          {popularChannels.map((chan) => {
            const hasClickCount = typeof playCounts[chan.id] === "number" && playCounts[chan.id] > 0;
            const clickCount = playCounts[chan.id] || 0;

            return (
              <div
                key={chan.id}
                onClick={() => handleSelectChannel(chan)}
                className="bg-zinc-950/30 hover:bg-zinc-900 border border-white/5 hover:border-cyan-500/30 p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_4px_15px_rgba(6,182,212,0.1)] cursor-pointer group shrink-0"
              >
                {/* Channel Icon Frame */}
                {chan.logoUrl ? (
                  <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-white/5 p-1 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-cyan-500/40 group-hover:scale-105 transition-all duration-300">
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
                  <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-white/5 text-xs font-bold text-cyan-400 flex items-center justify-center shrink-0 group-hover:bg-neutral-900 transition-all">
                    {chan.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Info Text */}
                <span className="font-bold text-[11px] text-white group-hover:text-cyan-400 mt-2 truncate w-full px-1 transition duration-150 leading-normal">
                  {chan.name}
                </span>

                {/* Dynamic watch count state badge */}
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-1 transition font-mono shrink-0">
                  <Play size={8} className="text-cyan-400/80 fill-cyan-400/30" />
                  <span>
                    {hasClickCount 
                      ? `${clickCount} ${translations[lang].views}`
                      : (lang === "bn" ? "ফিচারড" : "Featured")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alert Banner / Notification logs if importing playlists */}
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
