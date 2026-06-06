import React from "react";
import { Tv, List, Plus } from "lucide-react";

interface MobileBottomNavProps {
  mobileActiveTab: "player" | "channels" | "playlists";
  setMobileActiveTab: (tab: "player" | "channels" | "playlists") => void;
}

export default function MobileBottomNav({ mobileActiveTab, setMobileActiveTab }: MobileBottomNavProps) {
  return (
    <nav 
      id="mobile-bottom-nav" 
      className="lg:hidden fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-4 right-4 z-50 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-3xl p-2.5 flex items-center justify-around shadow-2xl shadow-black/80 transform-gpu"
    >
      <button
        onClick={() => setMobileActiveTab("player")}
        className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition duration-200 outline-none select-none ${
          mobileActiveTab === "player"
            ? "text-cyan-400 bg-cyan-950/40 border border-cyan-500/15 font-bold"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Tv size={16} className={mobileActiveTab === "player" ? "text-cyan-400 animate-pulse" : "text-slate-400"} />
        <span className="text-[10px] font-bold tracking-wider uppercase">Watch</span>
      </button>

      <button
        onClick={() => setMobileActiveTab("channels")}
        className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition duration-200 relative outline-none select-none ${
          mobileActiveTab === "channels"
            ? "text-cyan-400 bg-cyan-950/40 border border-cyan-500/15 font-bold"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <span className="absolute top-2 right-1/4 flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
        </span>
        <List size={16} className={mobileActiveTab === "channels" ? "text-cyan-400" : "text-slate-400"} />
        <span className="text-[10px] font-bold tracking-wider uppercase">Stations</span>
      </button>

      <button
        onClick={() => setMobileActiveTab("playlists")}
        className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition duration-200 outline-none select-none ${
          mobileActiveTab === "playlists"
            ? "text-cyan-400 bg-cyan-950/40 border border-cyan-500/15 font-bold"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <Plus size={16} className={mobileActiveTab === "playlists" ? "text-cyan-400" : "text-slate-400"} />
        <span className="text-[10px] font-bold tracking-wider uppercase">Feeds</span>
      </button>
    </nav>
  );
}
