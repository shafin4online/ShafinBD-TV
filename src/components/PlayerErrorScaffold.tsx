import React from "react";
import { AlertCircle, HelpCircle, RefreshCw } from "lucide-react";

interface PlayerErrorScaffoldProps {
  errorMsg: string;
  onReload: () => void;
}

export default function PlayerErrorScaffold({
  errorMsg,
  onReload,
}: PlayerErrorScaffoldProps) {
  return (
    <div 
      id="player-error-scaffold" 
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-20 p-4 text-center animate-fade-in text-slate-100 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-[480px]">
        <AlertCircle className="text-red-500 mx-auto mb-4 animate-bounce" size={48} />
        <h4 className="text-white text-lg font-bold mb-2 font-sans">Stream Initialization Offline</h4>
        <p className="text-slate-400 text-xs md:text-sm line-clamp-3 mb-4 leading-relaxed">
          {errorMsg}
        </p>

        {/* Advanced Diagnostic recommendations for users */}
        <div 
          id="troubleshooting-card" 
          className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-3 mb-5 text-left text-slate-300 text-xs space-y-1.5"
        >
          <div className="font-semibold text-rose-300 flex items-center gap-1">
            <HelpCircle size={13} strokeWidth={2.5} />
            Common Fixes:
          </div>
          <p>
            1. <strong>CORS Shielding</strong>: IPTV feeds require CORS clearance. If blocked, install <strong>CORS Unblock</strong> extension in your Chrome browser.
          </p>
          <p>
            2. <strong>Stream Offline</strong>: Feeds expire frequently. Try pasting a verified M3U8 link in the custom payload tab or test other loaded channels.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button 
            id="btn-error-retry"
            onClick={onReload}
            className="bg-cyan-500 hover:bg-cyan-600 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] active:transform hover:scale-[1.02] text-black font-semibold text-sm px-4 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 shadow-lg shadow-cyan-950/40"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
            Attempt Reconnection
          </button>
        </div>
      </div>
    </div>
  );
}
