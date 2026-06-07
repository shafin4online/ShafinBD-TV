import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { PopupConfig } from "../types";

interface PopupControlTabProps {
  popupConfig: PopupConfig;
  onUpdatePopupConfig: (fields: Partial<PopupConfig>) => Promise<void>;
  importStatus: { type: "success" | "error" | "info"; text: string } | null;
}

export default function PopupControlTab({
  popupConfig,
  onUpdatePopupConfig,
  importStatus,
}: PopupControlTabProps) {
  // --- POPUP SETTINGS FORM ---
  const [popupFormData, setPopupFormData] = useState({
    fbPopupMinutes: popupConfig?.fbPopupMinutes ?? 15,
    fbPopupText: popupConfig?.fbPopupText ?? "",
    facebookLink: popupConfig?.facebookLink ?? "",
    fbPopupEnabled: popupConfig?.fbPopupEnabled ?? true,
    customPopupMinutes: popupConfig?.customPopupMinutes ?? 30,
    customPopupText: popupConfig?.customPopupText ?? "",
    customPopupLink: popupConfig?.customPopupLink ?? "",
    customPopupEnabled: popupConfig?.customPopupEnabled ?? true,
    fbShareMinutes: popupConfig?.fbShareMinutes ?? 20,
    fbShareText: popupConfig?.fbShareText ?? "",
    fbSharePostLink: popupConfig?.fbSharePostLink ?? "",
    fbShareEnabled: popupConfig?.fbShareEnabled ?? false,
    controlSystemEnabled: popupConfig?.controlSystemEnabled ?? false,
  });

  // Sync state if databases config gets loaded
  useEffect(() => {
    if (popupConfig) {
      setPopupFormData({
        fbPopupMinutes: popupConfig.fbPopupMinutes,
        fbPopupText: popupConfig.fbPopupText,
        facebookLink: popupConfig.facebookLink,
        fbPopupEnabled: popupConfig.fbPopupEnabled ?? true,
        customPopupMinutes: popupConfig.customPopupMinutes,
        customPopupText: popupConfig.customPopupText,
        customPopupLink: popupConfig.customPopupLink,
        customPopupEnabled: popupConfig.customPopupEnabled ?? true,
        fbShareMinutes: popupConfig.fbShareMinutes ?? 20,
        fbShareText: popupConfig.fbShareText ?? "",
        fbSharePostLink: popupConfig.fbSharePostLink ?? "",
        fbShareEnabled: popupConfig.fbShareEnabled ?? false,
        controlSystemEnabled: popupConfig.controlSystemEnabled,
      });
    }
  }, [popupConfig]);

  const handleUpdatePopupConfigLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdatePopupConfig({
      fbPopupMinutes: Number(popupFormData.fbPopupMinutes),
      fbPopupText: popupFormData.fbPopupText.trim(),
      facebookLink: popupFormData.facebookLink.trim(),
      fbPopupEnabled: popupFormData.fbPopupEnabled,
      customPopupMinutes: Number(popupFormData.customPopupMinutes),
      customPopupText: popupFormData.customPopupText.trim(),
      customPopupLink: popupFormData.customPopupLink.trim(),
      customPopupEnabled: popupFormData.customPopupEnabled,
      fbShareMinutes: Number(popupFormData.fbShareMinutes),
      fbShareText: popupFormData.fbShareText.trim(),
      fbSharePostLink: popupFormData.fbSharePostLink.trim(),
      fbShareEnabled: popupFormData.fbShareEnabled,
      controlSystemEnabled: popupFormData.controlSystemEnabled,
    });
  };

  return (
    <div id="popup-control-container" className="bg-zinc-900/40 rounded-2xl border border-white/5 p-6 backdrop-blur-sm space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h3 id="popup-control-title" className="font-bold text-sm font-mono text-white tracking-wide uppercase">POPUP & VIDEO NOTIFICATION CONTROLS</h3>
          <p className="text-xs text-slate-400">Configure unclosable popup gates triggered after user watches streaming content for a specified duration.</p>
        </div>
        
        {/* Master Toggle Button */}
        <div id="popup-control-master-toggle" className="flex items-center gap-3 bg-zinc-950 p-2.5 px-4 rounded-xl border border-white/5 shrink-0">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">System Status:</span>
          <button
            type="button"
            onClick={() => setPopupFormData(prev => ({ ...prev, controlSystemEnabled: !prev.controlSystemEnabled }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all relative cursor-pointer ${
              popupFormData.controlSystemEnabled 
                ? "bg-[#06b6d4] text-neutral-950 shadow-[0_0_10px_rgba(6,182,212,0.3)] border border-cyan-400/20" 
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {popupFormData.controlSystemEnabled ? "● ACTIVE & RUNNING" : "○ DEACTIVATED"}
          </button>
        </div>
      </div>

      <form onSubmit={handleUpdatePopupConfigLocal} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CARD 1: Facebook Page Follow */}
          <div className="bg-zinc-950/80 rounded-xl border border-white/5 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs uppercase font-mono">1</div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Facebook Follow Gate (Trigger A)</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Prompt users to connect/follow on Facebook</p>
                </div>
              </div>

              {/* Individual Toggle Switch */}
              <button
                type="button"
                onClick={() => setPopupFormData(prev => ({ ...prev, fbPopupEnabled: !prev.fbPopupEnabled }))}
                className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold transition-all border cursor-pointer ${
                  popupFormData.fbPopupEnabled 
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/25" 
                    : "bg-zinc-800 text-slate-500 border-white/5"
                }`}
              >
                {popupFormData.fbPopupEnabled ? "ACTIVE" : "INACTIVE"}
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Trigger Threshold (Minutes)</label>
              <input 
                id="popup-fb-minutes"
                type="number" 
                min="1"
                value={popupFormData.fbPopupMinutes}
                onChange={(e) => setPopupFormData({...popupFormData, fbPopupMinutes: Math.max(1, Number(e.target.value))})}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono transition"
                required
              />
              <p className="text-[10px] text-slate-500 leading-normal">The unclosable overlay will cover screen exactly after this many minutes.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Facebook Page URL Link</label>
              <input 
                id="popup-fb-link"
                type="url" 
                value={popupFormData.facebookLink}
                onChange={(e) => setPopupFormData({...popupFormData, facebookLink: e.target.value})}
                placeholder="e.g. https://www.facebook.com/shafinbdofficial"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-sans transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Popup Message (Bengali or English)</label>
              <textarea 
                id="popup-fb-text"
                rows={4}
                value={popupFormData.fbPopupText}
                onChange={(e) => setPopupFormData({...popupFormData, fbPopupText: e.target.value})}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-sans transition resize-none leading-relaxed"
                required
              />
              <p className="text-[10px] text-slate-500">Provide user explicit instructions on why they must share/follow to unlock stream continuation.</p>
            </div>
          </div>

          {/* CARD 2: Custom Notification Link */}
          <div className="bg-zinc-950/80 rounded-xl border border-white/5 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs uppercase font-mono">2</div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Custom Notification Trigger B</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Redirect users to any notice/partner page</p>
                </div>
              </div>

              {/* Individual Toggle Switch */}
              <button
                type="button"
                onClick={() => setPopupFormData(prev => ({ ...prev, customPopupEnabled: !prev.customPopupEnabled }))}
                className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold transition-all border cursor-pointer ${
                  popupFormData.customPopupEnabled 
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/25" 
                    : "bg-zinc-800 text-slate-500 border-white/5"
                }`}
              >
                {popupFormData.customPopupEnabled ? "ACTIVE" : "INACTIVE"}
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Trigger Threshold (Minutes)</label>
              <input 
                id="popup-custom-minutes"
                type="number" 
                min="1"
                value={popupFormData.customPopupMinutes}
                onChange={(e) => setPopupFormData({...popupFormData, customPopupMinutes: Math.max(1, Number(e.target.value))})}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono transition"
                required
              />
              <p className="text-[10px] text-slate-500 leading-normal">The secondary custom notice covers screen exactly after this many minutes.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Custom Link URL</label>
              <input 
                id="popup-custom-link"
                type="url" 
                value={popupFormData.customPopupLink}
                onChange={(e) => setPopupFormData({...popupFormData, customPopupLink: e.target.value})}
                placeholder="e.g. https://shafinbd.net/notice"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-sans transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Custom Message Notice</label>
              <textarea 
                id="popup-custom-text"
                rows={4}
                value={popupFormData.customPopupText}
                onChange={(e) => setPopupFormData({...popupFormData, customPopupText: e.target.value})}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-sans transition resize-none leading-relaxed"
                required
              />
              <p className="text-[10px] text-slate-500">Notice content shown in the overlay popup describing partner announcements, notes or ads.</p>
            </div>
          </div>

          {/* CARD 3: Facebook Post Share (Dedicated Popup Trigger C) */}
          <div className="bg-zinc-950/80 rounded-xl border border-white/5 p-5 space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs uppercase font-mono">3</div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Facebook Share Guard (Trigger C) - Dedicated Popup</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Prompt users to share a dedicated Facebook post directly onto their timeline to unlock the video player.</p>
                </div>
              </div>

              {/* Individual Toggle Switch */}
              <button
                type="button"
                onClick={() => setPopupFormData(prev => ({ ...prev, fbShareEnabled: !prev.fbShareEnabled }))}
                className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold transition-all border cursor-pointer ${
                  popupFormData.fbShareEnabled 
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/25" 
                    : "bg-zinc-800 text-slate-500 border-white/5"
                }`}
              >
                {popupFormData.fbShareEnabled ? "ACTIVE" : "INACTIVE"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Trigger Threshold (Minutes)</label>
                <input 
                  id="popup-share-minutes"
                  type="number" 
                  min="1"
                  value={popupFormData.fbShareMinutes}
                  onChange={(e) => setPopupFormData({...popupFormData, fbShareMinutes: Math.max(1, Number(e.target.value))})}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono transition"
                  required
                />
                <p className="text-[10px] text-slate-500 leading-normal">Dedicated Facebook share popup covers screen exactly after this many minutes.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Predefined Facebook Post Link To Share</label>
                <input 
                  id="popup-share-post-link"
                  type="url" 
                  value={popupFormData.fbSharePostLink}
                  onChange={(e) => setPopupFormData({...popupFormData, fbSharePostLink: e.target.value})}
                  placeholder="e.g. https://www.facebook.com/permalink.php?story_fbid=123&id=456"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-sans transition"
                  required
                />
                <p className="text-[10px] text-slate-500">Provide the direct URL address of the Facebook post you want users to share on their profiles.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Popup Message text for Sharing Gate</label>
              <textarea 
                id="popup-share-text"
                rows={3}
                value={popupFormData.fbShareText}
                onChange={(e) => setPopupFormData({...popupFormData, fbShareText: e.target.value})}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-sans transition resize-none leading-relaxed"
                required
              />
              <p className="text-[10px] text-slate-500">Provide Bengali or English instructional messages guiding user on performing the profile share.</p>
            </div>
          </div>

        </div>

        {importStatus && (
          <div className={`p-3 rounded-xl border text-xs font-sans ${
            importStatus.type === "success" 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : importStatus.type === "error"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
          }`}>
            {importStatus.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5">
          <button
            id="admin-reset-stopwatch-btn"
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to reset your local playlist stopwatch? This resets your watch seconds and unlocks all popup gates back to locked for testing purposes.")) {
                localStorage.setItem("shafinbd_watch_seconds", "0");
                localStorage.removeItem("shafinbd_fb_dismissed");
                localStorage.removeItem("shafinbd_custom_dismissed");
                localStorage.removeItem("shafinbd_fb_share_dismissed");
                alert("Done! Watch time counters reset successfully. Reloading...");
                window.location.reload();
              }
            }}
            className="bg-zinc-800 hover:bg-zinc-700 text-slate-300 border border-white/5 text-[10px] font-mono font-bold px-4 py-2.5 rounded-xl cursor-pointer transition align-middle shrink-0"
          >
            RESET LOCAL TEST STOPWATCH
          </button>

          <button
            id="admin-sync-settings-btn"
            type="submit"
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold font-mono px-6 py-2.5 rounded-xl cursor-pointer transition hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-1.5"
          >
            <Settings size={14} />
            <span>SYNC CONTROLLING SETTINGS TO FIREBASE</span>
          </button>
        </div>

      </form>
    </div>
  );
}
