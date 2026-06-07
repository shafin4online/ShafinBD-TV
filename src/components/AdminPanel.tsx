import React, { useState, useMemo } from "react";
import { Channel } from "../types";
import { 
  Lock, 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  X, 
  FolderOpen, 
  RefreshCw, 
  Sparkles,
  ExternalLink,
  ChevronLeft
} from "lucide-react";

interface AdminPanelProps {
  cloudChannels: Channel[];
  isLoadingCloud: boolean;
  onSeedDefault: () => Promise<void>;
  onAddChannel: (chan: Omit<Channel, "id">) => Promise<void>;
  onUpdateChannel: (id: string, fields: Partial<Channel>) => Promise<void>;
  onDeleteChannel: (id: string) => Promise<void>;
  onReorderChannels: (reordered: Channel[]) => Promise<void>;
  onClose: () => void;
  importStatus: { type: "success" | "error" | "info"; text: string } | null;
}

export default function AdminPanel({
  cloudChannels,
  isLoadingCloud,
  onSeedDefault,
  onAddChannel,
  onUpdateChannel,
  onDeleteChannel,
  onReorderChannels,
  onClose,
  importStatus,
}: AdminPanelProps) {
  // --- CREDENTIALS SYSTEM ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // --- FORM STATES ---
  const [isEditing, setIsEditing] = useState<string | null>(null); // holds ID if in edit mode
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    category: "",
    logoUrl: "",
    description: "",
    groupTitle: ""
  });

  // --- SEARCH & CATEGORY FILTERS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Handle Login Validation
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === "ShafinHasnat" && password === "Hasnat123") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid administrator username or security key.");
    }
  };

  // Pre-seed dynamically list unique categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    set.add("All");
    cloudChannels.forEach(c => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [cloudChannels]);

  // Clean filtered lists for listing
  const filteredChannels = useMemo(() => {
    return cloudChannels.filter(c => {
      const catMatch = selectedCategory === "All" || c.category === selectedCategory;
      const searchLower = searchTerm.toLowerCase();
      const qMatch = c.name.toLowerCase().includes(searchLower) ||
        c.category.toLowerCase().includes(searchLower) ||
        (c.description && c.description.toLowerCase().includes(searchLower));
      return catMatch && qMatch;
    });
  }, [cloudChannels, selectedCategory, searchTerm]);

  // Handle Submit Form (Add/Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim() || !formData.category.trim()) {
      alert("Name, Stream URL, and Category are absolutely mandatory!");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      url: formData.url.trim(),
      category: formData.category.trim(),
      logoUrl: formData.logoUrl.trim(),
      description: formData.description.trim(),
      groupTitle: formData.groupTitle.trim()
    };

    if (isEditing) {
      await onUpdateChannel(isEditing, payload);
      setIsEditing(null);
    } else {
      await onAddChannel(payload);
    }

    // Reset Form cleanly
    setFormData({
      name: "",
      url: "",
      category: "",
      logoUrl: "",
      description: "",
      groupTitle: ""
    });
  };

  // Populate channel values for update action
  const handleEditClick = (chan: Channel) => {
    setIsEditing(chan.id);
    setFormData({
      name: chan.name,
      url: chan.url,
      category: chan.category,
      logoUrl: chan.logoUrl || "",
      description: chan.description || "",
      groupTitle: chan.groupTitle || ""
    });
    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Move channel rank positioning in Firestore
  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === filteredChannels.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    
    // Copy the actual list from state to re-evaluate the order rank
    const updatedList = [...cloudChannels];
    
    // Find absolute indices in original list
    const firstChan = filteredChannels[index];
    const secondChan = filteredChannels[targetIdx];
    
    const origFirstIdx = updatedList.findIndex(c => c.id === firstChan.id);
    const origSecondIdx = updatedList.findIndex(c => c.id === secondChan.id);

    if (origFirstIdx !== -1 && origSecondIdx !== -1) {
      // Swap order positions in database array
      const temp = updatedList[origFirstIdx];
      updatedList[origFirstIdx] = updatedList[origSecondIdx];
      updatedList[origSecondIdx] = temp;
      
      await onReorderChannels(updatedList);
    }
  };

  // Delete Channel handle
  const handleDeleteClick = async (chan: Channel) => {
    if (confirm(`Are you sure you want to permanently delete "${chan.name}" from the Cloud database? This change syncs to everyone.`)) {
      await onDeleteChannel(chan.id);
      if (isEditing === chan.id) {
        setIsEditing(null);
        setFormData({ name: "", url: "", category: "", logoUrl: "", description: "", groupTitle: "" });
      }
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditing(null);
    setFormData({
      name: "",
      url: "",
      category: "",
      logoUrl: "",
      description: "",
      groupTitle: ""
    });
  };

  // --- RENDER LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 font-sans text-neutral-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_0,transparent_65%)] pointer-events-none" />
        
        <div className="max-w-md w-full bg-zinc-900/90 border border-white/5 rounded-2xl p-6 shadow-2xl relative backdrop-blur-xl">
          <button 
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
            <h1 className="text-lg font-bold font-mono tracking-tight text-white mt-3">SHAFINBD ADMIN SECURITY PORTAL</h1>
            <p className="text-xs text-slate-400 leading-relaxed">Please authenticate with secure credentials to gain access to dynamic cloud custom settings.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Username</label>
              <input 
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
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-cyan-500 text-white transition font-sans"
                required
              />
            </div>

            {authError && (
              <p className="text-[11px] text-rose-500 font-medium bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">{authError}</p>
            )}

            <button 
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

  // --- RENDER CONSOLE INTERFACE ---
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans pb-20 relative">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.05)_0,transparent_75%)] pointer-events-none" />

      {/* Header Panel */}
      <header className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-md font-bold font-mono text-white tracking-wide">SHAFINBD TV CODESHIELD CONSOLE</h1>
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-bold font-mono">LIVE CLOUD</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Control, manage, and organize app playlists in real-time with zero code edits required.</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="self-start sm:self-auto bg-neutral-900 border border-white/5 hover:border-white/10 hover:bg-neutral-800 text-slate-200 text-xs font-bold font-mono px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <ChevronLeft size={14} />
            <span>Exit Console</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Creator Form Panel (5/12 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900/40 rounded-2xl border border-white/5 p-5 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="font-bold text-xs font-mono text-white uppercase tracking-wider">
                  {isEditing ? "Edit Station Properties" : "Create New Station"}
                </h3>
              </div>
              {isEditing && (
                <button 
                  onClick={handleCancelEdit}
                  className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-300 font-semibold px-2 py-1 rounded transition cursor-pointer flex items-center gap-1"
                >
                  <X size={11} />
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Station Name *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Shaheen Sports"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-sans transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Category Group *</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Sports, Bangor, Kids"
                    list="existing-categories"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-sans transition"
                    required
                  />
                  <datalist id="existing-categories">
                    {categoriesList.filter(c => c !== "All" && c !== "Favorites").map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">HLS/M3U8 Stream URL *</label>
                <input 
                  type="url" 
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder="https://example.com/stream/index.m3u8"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase font-mono">Logo URL (Optional Icon)</label>
                <input 
                  type="url" 
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                  placeholder="https://example.com/logo.png (Absolute PNG/JPG link)"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-sans transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Network / Network Owner (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.groupTitle}
                    onChange={(e) => setFormData({...formData, groupTitle: e.target.value})}
                    placeholder="e.g. T-Sports Network"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-sans transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Short Description (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Stream network source details..."
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-sans transition"
                  />
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

              <button 
                type="submit" 
                className={`w-full text-xs font-mono font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  isEditing 
                    ? "bg-amber-500 hover:bg-amber-400 text-neutral-950" 
                    : "bg-cyan-500 hover:bg-cyan-400 text-neutral-950 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                }`}
              >
                {isEditing ? <Edit2 size={13} /> : <Plus size={13} />}
                <span>{isEditing ? "SAVE CHANGED PROPERTIES" : "SYNC TO LIVE CHANNELS LIST"}</span>
              </button>
            </form>
          </div>

          {/* Quick Preseed Block */}
          {cloudChannels.length === 0 && (
            <div className="bg-zinc-950 rounded-2xl border border-dashed border-white/10 p-5 space-y-3.5 text-center">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
                <RefreshCw size={15} className="animate-spin" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Empty Database Detected</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">Populate your Firestore cloud with our pre-built high-quality default playlists with a single click to instantly seed active streams.</p>
              </div>
              <button
                onClick={onSeedDefault}
                className="bg-neutral-900 border border-white/5 hover:border-cyan-500/20 hover:text-cyan-400 text-slate-200 text-[10px] font-bold font-mono px-4 py-2 rounded-xl transition cursor-pointer uppercase tracking-wider"
              >
                Seed Default Channels List
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Channels List Manager (7/12 columns) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Filters Bar */}
          <div className="bg-zinc-900/20 rounded-2xl border border-white/5 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xs shrink-0">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search live feeds..."
                className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full justify-end font-sans">
              <span className="text-[10px] text-slate-400 font-mono">Category:</span>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none cursor-pointer focus:border-cyan-500"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Database Counter */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-slate-400 font-mono">
              Total Managed Cloud Channels: <strong className="text-cyan-400">{cloudChannels.length}</strong>
            </span>
            {filteredChannels.length !== cloudChannels.length && (
              <span className="text-slate-500 font-mono">
                Filtered: <strong className="text-white">{filteredChannels.length}</strong>
              </span>
            )}
          </div>

          {/* Loading States */}
          {isLoadingCloud ? (
            <div className="py-24 text-center text-slate-400 font-mono text-xs">
              <RefreshCw className="animate-spin mx-auto mb-3 opacity-35 text-cyan-400" size={24} />
              <span>Querying database structures... please hold on...</span>
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="py-24 text-center text-neutral-500 border border-dashed border-white/5 rounded-2xl bg-zinc-950/20">
              <FolderOpen className="mx-auto mb-3 opacity-25" size={32} />
              <span className="text-xs font-mono">No live channels discovered matching criteria.</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredChannels.map((chan, idx) => (
                <div 
                  key={chan.id}
                  className="bg-zinc-900/60 hover:bg-zinc-900/95 border border-white/5 rounded-2xl p-4 transition-all duration-200 flex items-center justify-between gap-4 py-3.5 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 shrink-0 overflow-hidden flex items-center justify-center p-1 bg-gradient-to-br from-zinc-900 to-zinc-950">
                      {chan.logoUrl ? (
                        <img 
                          src={chan.logoUrl} 
                          alt="" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://placehold.co/80x80/0d001a/ffffff?text=${encodeURIComponent(chan.name.slice(0, 2))}`;
                          }}
                        />
                      ) : (
                        <span className="text-[10px] font-extrabold font-mono text-cyan-400 uppercase">{chan.name.slice(0, 2)}</span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-slate-100 font-bold text-xs truncate max-w-[180px] sm:max-w-xs">{chan.name}</h4>
                        <span className="text-[9px] bg-white/5 border border-white/5 text-slate-400 px-1.5 py-0.5 rounded font-mono font-medium truncate max-w-[80px]">
                          {chan.category}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 font-mono truncate max-w-[200px] sm:max-w-sm flex items-center gap-1.5">
                        <span className="text-neutral-600">ID:</span> {chan.id}
                        <span className="text-neutral-700">•</span>
                        <span className="text-cyan-600/70">{chan.url.split("/").pop()?.slice(0,25) || "M3U8 Feed"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Position Organization arrows */}
                    <div className="flex flex-col sm:flex-row items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-white/5">
                      <button 
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                        className={`p-1.5 rounded transition hover:text-white cursor-pointer ${
                          idx === 0 ? "text-neutral-700 pointer-events-none" : "text-slate-400 hover:bg-white/5"
                        }`}
                      >
                        <ArrowUp size={11} />
                      </button>
                      <button 
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === filteredChannels.length - 1}
                        title="Move Down"
                        className={`p-1.5 rounded transition hover:text-white cursor-pointer ${
                          idx === filteredChannels.length - 1 ? "text-neutral-700 pointer-events-none" : "text-slate-400 hover:bg-white/5"
                        }`}
                      >
                        <ArrowDown size={11} />
                      </button>
                    </div>

                    {/* Basic Edit / Delete */}
                    <button 
                      onClick={() => handleEditClick(chan)}
                      title="Edit Channel Properties"
                      className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-neutral-800 rounded-lg border border-white/5 bg-neutral-900 font-bold cursor-pointer transition"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(chan)}
                      title="Permanently Delete Channel"
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg border border-white/5 bg-neutral-900 font-bold cursor-pointer transition"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
