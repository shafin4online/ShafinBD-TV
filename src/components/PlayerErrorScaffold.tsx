import React from "react";
import { AlertTriangle, HelpCircle, RefreshCw, Radio } from "lucide-react";

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
      className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-md z-20 p-5 text-center animate-fade-in text-slate-100 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-w-[480px] w-full px-2">
        {/* Pulsing notification frame */}
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5 text-cyan-400 relative">
          <span className="absolute inset-0 rounded-2xl bg-cyan-500/10 animate-ping opacity-35" />
          <Radio size={32} className="animate-pulse" />
        </div>

        {/* Bengali Calming Title */}
        <h4 className="text-white text-base md:text-lg font-black mb-1 tracking-tight">
          চ্যানেল সংযোগ সাময়িক বন্ধ আছে
        </h4>
        {/* English comforting subtitle */}
        <p className="text-cyan-400 text-[11px] font-bold font-mono tracking-widest uppercase mb-3">
          Broadcast Signal Temporarily Offline
        </p>

        {/* Reassuring main explanation text */}
        <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-4">
          এটি কোনো অ্যাপের সমস্যা নয়। মূলত ব্রডকাস্টারদের লাইভ লিংক পরিবর্তন বা ফিড সার্ভার রক্ষণাবেক্ষণ কাজের জন্য সাময়িক সিগন্যাল বন্ধ থাকতে পারে। ধৈর্য ধরুন এবং কিছুক্ষণের মধ্যে এটি স্বয়ংক্রিয়ভাবে সচল হবে।
        </p>
        <p className="text-slate-400 text-[11px] leading-relaxed italic mb-5">
          (This is not an issue with your app. Live stream feeds are occasionally paused by broadcasters for server updates. It will recover shortly.)
        </p>

        {/* Premium Helpful Instructions Board */}
        <div 
          id="troubleshooting-card" 
          className="bg-neutral-900/80 border border-white/5 rounded-2xl p-4 mb-6 text-left text-xs space-y-2.5 max-h-[160px] overflow-y-auto"
        >
          <div className="font-extrabold text-cyan-400 flex items-center gap-1.5 uppercase font-mono tracking-wide text-[10px]">
            <HelpCircle size={14} className="text-cyan-400" />
            সহজ কিছু পরামর্শ / Quick Tips:
          </div>
          <div className="text-slate-300 leading-normal space-y-1.5">
            <p>
              • <strong>অন্য চ্যানেল দেখুন (Try Others):</strong> সাময়িক অসঙ্গতি এড়াতে আমাদের শত শত সচল ডিফল্ট বা অন্যান্য ক্যাটাগরির লাইভ চ্যানেল উপভোগ করতে পারেন।
            </p>
            <p>
              • <strong>ইন্টারনেট পরীক্ষা করুন (WiFi / Data):</strong> আপনার ইন্টারনেট সংযোগ ঠিকঠাক কাজ করছে এবং স্পিড পর্যাপ্ত আছে তা নিশ্চিত করে নিন।
            </p>
            <p>
              • <strong>সার্ভার লগ (System Code):</strong> <span className="font-mono text-[10px] text-zinc-500">{errorMsg.slice(0, 80) || "CORS, format or stream mismatch."}</span>
            </p>
          </div>
        </div>

        {/* Action Button Segment */}
        <div className="flex items-center justify-center gap-3">
          <button 
            id="btn-error-retry"
            onClick={onReload}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 active:scale-95 text-neutral-950 font-black text-xs md:text-sm px-5 py-2.5 rounded-xl transition duration-300 flex items-center gap-2 shadow-[0_4px_20px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            <RefreshCw size={14} className="animate-spin-slow text-neutral-950 font-black" />
            পুনরায় চেষ্টা করুন / Retry Loading
          </button>
        </div>
      </div>
    </div>
  );
}
