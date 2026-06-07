import React, { useState } from "react";
import { Lock, ChevronLeft } from "lucide-react";

interface AdminLoginProps {
  onAuthenticated: () => void;
  onClose: () => void;
}

export default function AdminLogin({ onAuthenticated, onClose }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === "ShafinHasnat" && password === "Hasnat123") {
      onAuthenticated();
      setAuthError("");
    } else {
      setAuthError("Invalid administrator username or security key.");
    }
  };

  return (
    <div id="admin-login-screen" className="min-h-screen bg-[#050505] flex items-center justify-center px-4 font-sans text-neutral-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_0,transparent_65%)] pointer-events-none" />
      
      <div id="admin-login-card" className="max-w-md w-full bg-zinc-900/90 border border-white/5 rounded-2xl p-6 shadow-2xl relative backdrop-blur-xl">
        <button 
          id="admin-login-back-btn"
          onClick={onClose}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 cursor-pointer"
        >
          <ChevronLeft size={13} />
          <span>Back to App</span>
        </button>

        <div className="text-center mt-6 mb-8 space-y-2">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
            <Lock size={20} />
          </div>
          <h1 id="admin-login-title" className="text-lg font-bold font-mono tracking-tight text-white mt-3">SHAFINBD ADMIN SECURITY PORTAL</h1>
          <p className="text-xs text-slate-400 leading-relaxed">Please authenticate with secure credentials to gain access to dynamic cloud custom settings.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Username</label>
            <input 
              id="admin-login-username"
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Manager account name"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-cyan-500 text-white transition font-sans"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Master Security Key (Password)</label>
            <input 
              id="admin-login-password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-cyan-500 text-white transition font-sans"
              required
            />
          </div>

          {authError && (
            <p id="admin-login-error" className="text-[11px] text-rose-500 font-medium bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">{authError}</p>
          )}

          <button 
            id="admin-login-submit"
            type="submit" 
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-bold font-mono py-2.5 rounded-xl cursor-pointer transition hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            INITIATE AUTHENTICATION
          </button>
        </form>
      </div>
    </div>
  );
}
