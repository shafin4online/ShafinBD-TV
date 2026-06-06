import React from "react";
import { Keyboard, Activity } from "lucide-react";
import { Channel } from "../types";

interface PlayerHeaderProps {
  channel: Channel | null;
  showShortcuts: boolean;
  setShowShortcuts: (visible: boolean) => void;
  showStats: boolean;
  setShowStats: (visible: boolean) => void;
}

export default function PlayerHeader({
  channel,
  showShortcuts,
  setShowShortcuts,
  showStats,
  setShowStats,
}: PlayerHeaderProps) {
  return (
    <div id="hud-interactive-elements" className="flex justify-between items-start z-30">
      <div className="flex flex-col drop-shadow-md">
        {channel ? (
          <>
            <span 
              id="player-channel-category" 
              className="text-cyan-400 font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 mb-1 bg-cyan-950/70 border border-cyan-800/40 px-2 py-0.5 rounded w-fit"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {channel.category}
            </span>
            <h3 id="player-channel-title" className="text-white text-base md:text-xl font-bold tracking-tight">
              {channel.name}
            </h3>
          </>
        ) : (
          <span className="text-white font-medium">Select a live TV channel to stream</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowShortcuts(!showShortcuts);
          }}
          title="Keyboard Shortcuts"
          className={`p-2 rounded-lg border transition-all ${
            showShortcuts 
              ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-300"
              : "bg-black/40 border-white/10 hover:border-white/20 text-white/70 hover:text-white"
          }`}
        >
          <Keyboard size={16} />
        </button>

        <button 
          id="btn-toggle-diagnostics"
          onClick={(e) => {
            e.stopPropagation();
            setShowStats(!showStats);
          }}
          title="Stream Diagnostics"
          className={`p-2 rounded-lg border transition-all ${
            showStats 
              ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]" 
              : "bg-black/40 border-white/10 hover:border-white/20 text-white/70 hover:text-white"
          }`}
        >
          <Activity size={16} />
        </button>
      </div>
    </div>
  );
}
