import React from "react";
import { Keyboard } from "lucide-react";

interface PlayerShortcutsProps {
  onClose: () => void;
}

export default function PlayerShortcuts({ onClose }: PlayerShortcutsProps) {
  return (
    <div 
      id="player-shortcuts-modal" 
      className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 z-30 overflow-y-auto cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="text-indigo-400" size={18} />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Smart hotkeys</h4>
          </div>
          <button 
            onClick={onClose}
            className="text-xs bg-indigo-500/15 text-indigo-300 hover:text-white px-2.5 py-1 rounded-lg border border-indigo-500/10 transition"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="flex justify-between items-center bg-white/5 border border-white/5 px-2.5 py-2 rounded-lg">
            <span className="text-neutral-400">Play/Pause</span>
            <kbd className="bg-neutral-800 text-white px-1.5 py-0.5 rounded border border-neutral-700 text-[10px]">Space</kbd>
          </div>
          <div className="flex justify-between items-center bg-white/5 border border-white/5 px-2.5 py-2 rounded-lg">
            <span className="text-neutral-400">Aspect Ratio</span>
            <kbd className="bg-neutral-800 text-white px-1.5 py-0.5 rounded border border-neutral-700 text-[10px]">A / V</kbd>
          </div>
          <div className="flex justify-between items-center bg-white/5 border border-white/5 px-2.5 py-2 rounded-lg">
            <span className="text-neutral-400">Fullscreen</span>
            <kbd className="bg-neutral-800 text-white px-1.5 py-0.5 rounded border border-neutral-700 text-[10px]">F</kbd>
          </div>
          <div className="flex justify-between items-center bg-white/5 border border-white/5 px-2.5 py-2 rounded-lg">
            <span className="text-neutral-400">Toggle Mute</span>
            <kbd className="bg-neutral-800 text-white px-1.5 py-0.5 rounded border border-neutral-700 text-[10px]">M</kbd>
          </div>
          <div className="flex justify-between items-center bg-white/5 border border-white/5 px-2.5 py-2 rounded-lg col-span-2">
            <span className="text-neutral-400">Volume Settings</span>
            <kbd className="bg-neutral-800 text-white px-1.5 py-0.5 rounded border border-neutral-700 text-[10px]">▲ / ▼ Arrows</kbd>
          </div>
          <div className="flex justify-between items-center bg-white/5 border border-white/5 px-2.5 py-2 rounded-lg col-span-2">
            <span className="text-neutral-400">Reconnection Signal</span>
            <kbd className="bg-neutral-800 text-white px-1.5 py-0.5 rounded border border-neutral-700 text-[10px]">R</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
