import React, { useState, useMemo } from "react";
import { Channel, PopupConfig } from "../types";
import { 
  Plus, 
  Edit2, 
  X, 
  RefreshCw, 
  Sparkles,
  ChevronLeft,
  Settings,
  Tv,
  Folder
} from "lucide-react";
import AdminLogin from "./AdminLogin";
import PopupControlTab from "./PopupControlTab";
import StationList from "./StationList";

interface AdminPanelProps {
  cloudChannels: Channel[];
  isLoadingCloud: boolean;
  onSeedDefault: () => Promise<void>;
  onAddChannel: (chan: Omit<Channel, "id">) => Promise<void>;
  onUpdateChannel: (id: string, fields: Partial<Channel>) => Promise<void>;
  onDeleteChannel: (id: string) => Promise<void>;
  onReorderChannels: (reordered: Channel[]) => Promise<void>;
  onSetDefaultChannel: (id: string | null) => Promise<void>;
  onClose: () => void;
  importStatus: { type: "success" | "error" | "info"; text: string } | null;
  popupConfig: PopupConfig;
  onUpdatePopupConfig: (fields: Partial<PopupConfig>) => Promise<void>;
  dbCategories: string[];
  onUpdateCategories: (newCatList: string[]) => Promise<void>;
}

export default function AdminPanel({
  cloudChannels,
  isLoadingCloud,
  onSeedDefault,
  onAddChannel,
  onUpdateChannel,
  onDeleteChannel,
  onReorderChannels,
  onSetDefaultChannel,
  onClose,
  importStatus,
  popupConfig,
  onUpdatePopupConfig,
  dbCategories,
  onUpdateCategories,
}: AdminPanelProps) {
  // --- ADMIN AUTHENTICATION ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- ADMIN TABS SYSTEM ---
  const [activeAdminTab, setActiveAdminTab] = useState<"channels" | "popup_control" | "categories">("channels");

  // --- FORM STATES FOR STATION MANIPULATION ---
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

  // --- CATEGORIES MANAGEMENT STATE & HANDLERS ---
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // Merge dbCategories and channels' categories to get an ordered unique list
  const categoriesList = useMemo(() => {
    const finalOrder: string[] = ["All", "Favorites"];
    
    // Extracted dynamic categories from channels
    const channelCats = new Set<string>();
    cloudChannels.forEach(chan => {
      if (chan.category) {
        const trimmed = chan.category.trim();
        if (trimmed) {
          channelCats.add(trimmed);
        }
      }
    });

    const addedFromDb = new Set<string>();

    dbCategories.forEach(cat => {
      const trimmed = cat.trim();
      if (trimmed && trimmed !== "All" && trimmed !== "Favorites") {
        const lower = trimmed.toLowerCase();
        if (!addedFromDb.has(lower)) {
          finalOrder.push(trimmed);
          addedFromDb.add(lower);
        }
      }
    });

    channelCats.forEach(cat => {
      const lower = cat.toLowerCase();
      if (!addedFromDb.has(lower) && cat !== "All" && cat !== "Favorites") {
        finalOrder.push(cat);
        addedFromDb.add(lower);
      }
    });

    return finalOrder;
  }, [cloudChannels, dbCategories]);

  const handleAddNewCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCategoryInput.trim();
    if (!cleanName || cleanName === "All" || cleanName === "Favorites") {
      alert("Please enter a valid, unique category name!");
      return;
    }

    const currentCustom = categoriesList.filter(c => c !== "All" && c !== "Favorites");
    if (currentCustom.some(c => c.toLowerCase() === cleanName.toLowerCase())) {
      alert("This category already exists!");
      return;
    }

    const updated = [...currentCustom, cleanName];
    await onUpdateCategories(updated);
    setNewCategoryInput("");
  };

  const handleMoveCategory = async (index: number, direction: "up" | "down") => {
    const currentCustom = categoriesList.filter(c => c !== "All" && c !== "Favorites");
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === currentCustom.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...currentCustom];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    await onUpdateCategories(updated);
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (confirm(`Are you sure you want to delete category "${categoryName}"? Channels assigned to this category will remain, but the category tab will be removed.`)) {
      const currentCustom = categoriesList.filter(c => c !== "All" && c !== "Favorites" && c !== categoryName);
      await onUpdateCategories(currentCustom);
    }
  };

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Move channel rank positioning in Firestore
  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === filteredChannels.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updatedList = [...cloudChannels];
    const firstChan = filteredChannels[index];
    const secondChan = filteredChannels[targetIdx];
    
    const origFirstIdx = updatedList.findIndex(c => c.id === firstChan.id);
    const origSecondIdx = updatedList.findIndex(c => c.id === secondChan.id);

    if (origFirstIdx !== -1 && origSecondIdx !== -1) {
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

  // --- RENDERING SECURE ACCESS GATEWAY ---
  if (!isAuthenticated) {
    return (
      <AdminLogin 
        onAuthenticated={() => setIsAuthenticated(true)} 
        onClose={onClose} 
      />
    );
  }

  // --- RENDER CONSOLE INTERFACE ---
  return (
    <div id="codeshield-console" className="min-h-screen bg-[#050505] text-neutral-100 font-sans pb-20 relative">
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

      {/* Tabs Menu Navigation */}
      <div className="max-w-7xl mx-auto px-4 mt-6 flex flex-wrap gap-2 border-b border-white/5">
        <button
          type="button"
          onClick={() => setActiveAdminTab("channels")}
          className={`py-3 px-4 text-xs font-mono font-bold tracking-wider transition-all relative flex items-center gap-2 border-t border-x rounded-t-xl cursor-pointer ${
            activeAdminTab === "channels" 
              ? "text-cyan-400 bg-zinc-900 border-white/10 border-b-[#050505] translate-y-[1px]" 
              : "text-slate-400 border-transparent bg-transparent hover:text-white"
          }`}
        >
          <Tv size={13} />
          <span>STATIONS & PLAYLISTS</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminTab("categories")}
          className={`py-3 px-4 text-xs font-mono font-bold tracking-wider transition-all relative flex items-center gap-2 border-t border-x rounded-t-xl cursor-pointer ${
            activeAdminTab === "categories" 
              ? "text-cyan-400 bg-zinc-900 border-white/10 border-b-[#050505] translate-y-[1px]" 
              : "text-slate-400 border-transparent bg-transparent hover:text-white"
          }`}
        >
          <Folder size={13} />
          <span>MANAGE CATEGORIES</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminTab("popup_control")}
          className={`py-3 px-4 text-xs font-mono font-bold tracking-wider transition-all relative flex items-center gap-2 border-t border-x rounded-t-xl cursor-pointer ${
            activeAdminTab === "popup_control" 
              ? "text-cyan-400 bg-zinc-900 border-white/10 border-b-[#050505] translate-y-[1px]" 
              : "text-slate-400 border-transparent bg-transparent hover:text-white"
          }`}
        >
          <Settings size={13} />
          <span>CONTROL POPUP SYSTEM</span>
        </button>
      </div>

      {activeAdminTab === "channels" && (
        <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          
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
                      id="station-name-field"
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
                      id="station-category-field"
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
                    id="station-url-field"
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
                    id="station-logo-field"
                    type="url" 
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-sans transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase font-mono">Network / Owner (Optional)</label>
                    <input 
                      id="station-group-field"
                      type="text" 
                      value={formData.groupTitle}
                      onChange={(e) => setFormData({...formData, groupTitle: e.target.value})}
                      placeholder="e.g. T-Sports Network"
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-sans transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase font-mono">Short Description (Optional)</label>
                    <input 
                      id="station-desc-field"
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
                  id="station-submit-btn"
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
          <div className="lg:col-span-7">
            <StationList
              filteredChannels={filteredChannels}
              cloudChannels={cloudChannels}
              isLoadingCloud={isLoadingCloud}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categoriesList={categoriesList}
              onSetDefaultChannel={onSetDefaultChannel}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onMove={handleMove}
            />
          </div>

        </main>
      )}

      {activeAdminTab === "categories" && (
        <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in space-y-6">
          <div className="bg-zinc-900/40 rounded-2xl border border-white/5 p-6 backdrop-blur-sm space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-white/5 pb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                CATEGORIES LAYOUT & RE-ARRANGE
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                এখানে চ্যানেলের ক্যাটাগরি তৈরি করুন এবং তাদের পজিশন পরিবর্তন (rearrange) করুন। মেইন প্লেয়ারের ক্যাটাগরি ট্যাবগুলো সাজানো অর্ডার অনুযায়ী প্রদর্শিত হবে।
              </p>
            </div>

            {/* Quick Tip Block */}
            <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 rounded-xl leading-relaxed">
              <strong>টিপস:</strong> আপনি কোনো নতুন ক্যাটাগরি অ্যাড করলে তা সঙ্গে সঙ্গে চ্যানেলের ইনফরমেশন এডিট/ক্রিয়েট করার ক্যাটাগরি ড্রপডাউনে সেট করার জন্য এভেলেবেল হবে। ক্যাটাগরিগুলো রিঅ্যারেঞ্জ করতে পাশের ▲ ও ▼ বোতাম ব্যবহার করুন।
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddNewCategory} className="flex gap-3">
              <input
                id="new-category-input"
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="নতুন ক্যাটাগরির নাম লিখুন... (যেমন: Bangla News, Sports TV, Movies)"
                className="flex-1 bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
                required
              />
              <button
                id="btn-add-category"
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-mono font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                <Plus size={14} />
                <span>অ্যাড করুন</span>
              </button>
            </form>

            {/* Ordered Categories List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                  Live Ordered Categories ({categoriesList.filter(c => c !== "All" && c !== "Favorites").length})
                </label>
              </div>

              <div id="admin-category-cards" className="bg-zinc-950 border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden">
                {categoriesList
                  .filter(c => c !== "All" && c !== "Favorites")
                  .map((cat, idx, arr) => {
                    return (
                      <div key={cat} className="flex items-center justify-between p-3.5 hover:bg-white/[0.02] transition">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 font-mono text-xs w-6 text-right font-bold">#{idx + 1}</span>
                          <span className="text-xs font-semibold text-neutral-200">{cat}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveCategory(idx, "up")}
                            className="p-1.5 px-3 text-xs bg-white/5 hover:bg-zinc-805 disabled:opacity-20 text-slate-300 hover:text-white rounded-lg border border-white/5 font-mono cursor-pointer transition"
                            title="ক্যাটাগরি উপরে নিন"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => handleMoveCategory(idx, "down")}
                            className="p-1.5 px-3 text-xs bg-white/5 hover:bg-zinc-805 disabled:opacity-20 text-slate-300 hover:text-white rounded-lg border border-white/5 font-mono cursor-pointer transition"
                            title="ক্যাটাগরি নিচে নিন"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 px-3 text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg border border-rose-500/10 cursor-pointer font-bold transition ml-1"
                            title="মুছে ফেলুন"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {categoriesList.filter(c => c !== "All" && c !== "Favorites").length === 0 && (
                  <div className="text-center py-12 text-xs text-zinc-500 font-mono leading-relaxed">
                    No custom categories defined.<br />
                    Type a category above and tap "অ্যাড করুন" to start!
                  </div>
                )}
              </div>
            </div>

            {importStatus && (
              <div className={`p-3.5 rounded-xl border text-xs font-sans ${
                importStatus.type === "success" 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : importStatus.type === "error"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
              }`}>
                {importStatus.text}
              </div>
            )}
          </div>
        </div>
      )}

      {activeAdminTab === "popup_control" && (
        <main className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
          <PopupControlTab
            popupConfig={popupConfig}
            onUpdatePopupConfig={onUpdatePopupConfig}
            importStatus={importStatus}
          />
        </main>
      )}
    </div>
  );
}
