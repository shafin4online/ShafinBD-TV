import React from "react";
import { X, Smartphone, Share, MoreVertical, Monitor, Tv } from "lucide-react";

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PWAInstallModal({ isOpen, onClose }: PWAInstallModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      id="pwa-install-modal-overlay" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div 
        id="pwa-install-dialog" 
        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Ambient background blur elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Tv className="text-black shrink-0" size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">ShafinBD TV ইনস্টল করুন</h3>
              <p className="text-xs text-slate-400">PWA লাইটওয়েট মোবাইল ও কম্পিউটার অ্যাপ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-zinc-300 leading-relaxed font-medium">
            ShafinBD TV টিকে আপনার ফোনে বা কম্পিউটারে একটি অফিসিয়াল অ্যাপের মতো ইনস্টল করে নিন। এটি অফলাইনে দ্রুত লোড হবে এবং খুবই কম ডাটা খরচ করবে।
          </p>

          {/* Step for Mobile Android */}
          <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold text-xs sm:text-sm">
              <Smartphone size={16} />
              <span>অ্যান্ড্রয়েড বা ক্রোম ব্রাউজার (Android & Chrome)</span>
            </div>
            <ul className="space-y-2 text-zinc-400 text-xs list-decimal pl-4 leading-relaxed">
              <li>আপনার ব্রাউজারের উপরে ডান পাশে থাকা <strong className="text-white font-semibold">৩ ডট ( <MoreVertical className="inline shrink-0 text-white" size={12} /> )</strong> আইকনে ক্লিক করুন।</li>
              <li>মেনু থেকে <strong className="text-white font-semibold">"Add to Home screen"</strong> অথবা <strong className="text-white font-semibold">"Install app"</strong> অপশনে ট্যাপ করুন।</li>
              <li>কনফার্মেশন পপ-আপে <strong className="text-white font-semibold">Add / Install</strong> ক্লিক করুন।</li>
            </ul>
          </div>

          {/* Step for Apple Safari */}
          <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-xs sm:text-sm">
              <Smartphone size={16} />
              <span>আইফোন বা অ্যাপল সাফারী (iPhone / iOS Safari)</span>
            </div>
            <ul className="space-y-2 text-zinc-400 text-xs list-decimal pl-4 leading-relaxed">
              <li>সাফারী ব্রাউজারের নিচে থাকা <strong className="text-white font-semibold flex items-center inline-flex gap-1 text-[11px] sm:text-xs">শেয়ার বাটন (<Share size={11} className="text-white inline" />)</strong> টিতে চাপুন।</li>
              <li>নিচের দিকে স্ক্রোল করে <strong className="text-white font-semibold">"Add to Home Screen" (হোম স্ক্রিনে যোগ করুন)</strong> অপশনটিতে ক্লিক করুন।</li>
              <li>উপরে ডান পাশে থাকা <strong className="text-white font-semibold">Add</strong> বাটনে ট্যাপ করুন।</li>
            </ul>
          </div>

          {/* Step for Desktop */}
          <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3 text-purple-400 font-bold text-xs sm:text-sm">
              <Monitor size={16} />
              <span>কম্পিউটার (Desktop / Laptop)</span>
            </div>
            <ul className="space-y-2 text-zinc-400 text-xs list-decimal pl-4 leading-relaxed">
              <li>ব্রাউজারের অ্যাড্রেস বারের ঠিক ডান পাশে থাকা <strong className="text-white font-semibold">Install Icon</strong> (স্টপ বা প্লাস সাইন) এ ক্লিক করুন।</li>
              <li>অথবা ব্রাউজারের ৩ ডট মেনু থেকে <strong className="text-white font-semibold">"Install ShafinBD TV"</strong> অপশনটিতে চাপুন।</li>
            </ul>
          </div>

          <div className="pt-1 text-center text-slate-500 font-mono text-[9px]">
            App Icon: 192x192 & 512x512 with Maskable Support 💎
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold py-3 rounded-2xl transition cursor-pointer"
          >
            ঠিক আছে (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
