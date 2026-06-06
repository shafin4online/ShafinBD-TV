import React, { useState, useEffect } from "react";
import { AlertTriangle, Globe, Play, ChevronRight, Info } from "lucide-react";

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<"bn" | "en">("bn");

  useEffect(() => {
    // Check if the user has already accepted the disclaimer
    const accepted = localStorage.getItem("shafinbd_disclaimer_accepted");
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("shafinbd_disclaimer_accepted", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      id="disclaimer-modal-overlay" 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in"
    >
      <div 
        id="disclaimer-dialog" 
        className="w-full max-w-lg bg-zinc-900/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden transform-gpu"
      >
        {/* Ambient background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Language Switcher */}
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => setLang("bn")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              lang === "bn" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            বাংলা
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              lang === "en" 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            English
          </button>
        </div>

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5 mb-5 border-b border-white/5 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Info className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {lang === "bn" ? "গুরুত্বপূর্ণ নোটিশ ও ডিসক্লেমার" : "Important Notice & Disclaimer"}
            </h3>
            <p className="text-xs text-indigo-400 font-medium">
              {lang === "bn" ? "ShafinBD TV স্ট্রিমিং প্লেয়ার" : "ShafinBD TV Streaming Platform"}
            </p>
          </div>
        </div>

        {/* Content Box */}
        <div className="space-y-4 text-sm leading-relaxed text-zinc-300 pr-1 mb-6 max-h-[50vh] overflow-y-auto">
          {lang === "bn" ? (
            <div className="space-y-4">
              <p>
                এই প্ল্যাটফর্মের সকল স্ট্রিম লিংক ও সোর্স ইন্টারনেটে <strong className="text-white font-semibold">পাবলিকভাবে উপলব্ধ</strong> জায়গা থেকে সংগ্রহ করা হয়েছে। আমরা কোনো কন্টেন্ট <strong className="text-red-400 font-semibold">হোস্ট, আপলোড বা মালিকানা দাবি করি না</strong> — শুধু পাবলিক লিংকগুলো একত্র ও যাচাই করি।
              </p>
              <p>
                কোনো কন্টেন্ট/লিংকে আপত্তি থাকলে সংশ্লিষ্ট মূল সোর্সের সাথে যোগাযোগ করুন। এই টুল শুধু লিংক যাচাই ও ব্যবস্থাপনার সুবিধার্থে।
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p>
                All stream links and sources on this platform are collected from <strong className="text-white font-semibold">publicly available resources</strong> on the internet. We do not <strong className="text-red-400 font-semibold">host, upload, or claim ownership</strong> of any content — we only aggregate and verify public stream links.
              </p>
              <p>
                If you have any objections to any content/link, please contact the respective original source. This tool is intended solely for channel link testing, aggregation, and personal streaming management.
              </p>
            </div>
          )}
        </div>

        {/* Master Consent Button */}
        <div className="pt-2 border-t border-white/5">
          <button
            onClick={handleAccept}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 rounded-2xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-600/30 active:scale-98 flex items-center justify-center gap-2"
          >
            <span>{lang === "bn" ? "আমি বুঝেছি" : "I Understand & Accept"}</span>
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
