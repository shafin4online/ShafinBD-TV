/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Tv, Globe, Plus } from "lucide-react";

export interface HeaderProps {
  playlistsCount: number;
}

export default function Header({ playlistsCount }: HeaderProps) {
  return (
    <header id="shafinbd-app-header" className="sticky top-0 z-40 bg-zinc-950/85 backdrop-blur-md border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Tv className="text-black shrink-0" size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white uppercase sm:text-2xl animate-fade-in">
                shafinbd<span className="text-cyan-400"> tv</span>
              </h1>
              <span className="bg-cyan-950 text-cyan-300 font-mono text-[9px] uppercase font-bold tracking-widest border border-cyan-800 px-1.5 py-0.5 rounded">
                v2.0
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wide hidden sm:inline">
              Adaptive IPTV Playback and Multi-Playlist Center
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick stats indicator */}
          <div className="hidden md:flex items-center gap-2 bg-neutral-900 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-neutral-300">
            <Globe className="text-cyan-400 shrink-0" size={14} />
            <span className="font-semibold text-white">{playlistsCount}</span> Playlists Loaded
          </div>
          <a 
            href="#playlist-manager"
            className="bg-neutral-900 hover:bg-neutral-800 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-xl transition duration-200 flex items-center gap-1.5"
          >
            <Plus size={14} className="text-cyan-400" />
            Manage Feeds
          </a>
        </div>
      </div>
    </header>
  );
}
