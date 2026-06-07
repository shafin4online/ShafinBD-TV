/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Tv, Globe, Plus, Download } from "lucide-react";
import { translations, Language } from "../utils/translations";

export interface HeaderProps {
  playlistsCount: number;
  showInstallBtn?: boolean;
  onInstallClick?: () => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
}

export default function Header({ 
  playlistsCount, 
  showInstallBtn, 
  onInstallClick,
  lang,
  onLangChange
}: HeaderProps) {
  return (
    <header id="shafinbd-app-header" className="sticky top-0 z-50 bg-zinc-950/85 backdrop-blur-md border-b border-white/5 transform-gpu animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
            <Tv className="text-black shrink-0" size={18} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white uppercase truncate">
                shafinbd<span className="text-cyan-400"> tv</span>
              </h1>
              <span className="bg-cyan-950 text-cyan-300 font-mono text-[8px] sm:text-[9px] uppercase font-bold tracking-widest border border-cyan-800/50 px-1 py-0.5 rounded leading-none shrink-0">
                v2.0
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono tracking-wide truncate hidden sm:inline">
              {translations[lang].adaptive_subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Custom Language Toggler Switch */}
          <div className="flex items-center bg-neutral-900 border border-white/10 p-0.5 rounded-xl">
            <button
              onClick={() => onLangChange("bn")}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition duration-200 cursor-pointer ${
                lang === "bn"
                  ? "bg-gradient-to-tr from-cyan-500 to-emerald-500 text-neutral-950 ring-1 ring-cyan-400/20 shadow font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => onLangChange("en")}
              className={`px-2 py-1.5 text-[9px] font-mono font-bold rounded-lg transition duration-200 cursor-pointer ${
                lang === "en"
                  ? "bg-gradient-to-tr from-cyan-500 to-emerald-500 text-neutral-950 ring-1 ring-cyan-400/20 shadow font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          {/* PWA Install Button */}
          {showInstallBtn && (
            <button
              onClick={onInstallClick}
              id="pwa-install-header-btn"
              className="bg-gradient-to-tr from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1.5 rounded-xl transition duration-200 flex items-center gap-1 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer animate-pulse shrink-0"
            >
              <Download size={12} className="text-white animate-bounce shrink-0" />
              <span>{translations[lang].app_install}</span>
            </button>
          )}

          {/* Quick stats indicator */}
          <div className="hidden md:flex items-center gap-2 bg-neutral-900 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Globe className="text-cyan-400 shrink-0" size={14} />
            <span className="font-semibold text-white">{playlistsCount}</span> {translations[lang].playlists_loaded}
          </div>

          {/* Manage Feeds (Hidden on Mobile & Tablet, shown on Desktop: lg) */}
          <a 
            href="#playlist-manager"
            className="hidden lg:flex bg-neutral-900 hover:bg-neutral-800 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-xl transition duration-200 items-center gap-1.5 shrink-0"
          >
            <Plus size={14} className="text-cyan-400 shrink-0" />
            {translations[lang].manage_feeds}
          </a>
        </div>
      </div>
    </header>
  );
}
