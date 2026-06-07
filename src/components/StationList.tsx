import React from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  FolderOpen, 
  RefreshCw, 
  Pin 
} from "lucide-react";
import { Channel } from "../types";

interface StationListProps {
  filteredChannels: Channel[];
  cloudChannels: Channel[];
  isLoadingCloud: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  categoriesList: string[];
  onSetDefaultChannel: (id: string | null) => Promise<void>;
  onEditClick: (chan: Channel) => void;
  onDeleteClick: (chan: Channel) => Promise<void>;
  onMove: (index: number, direction: "up" | "down") => Promise<void>;
}

export default function StationList({
  filteredChannels,
  cloudChannels,
  isLoadingCloud,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categoriesList,
  onSetDefaultChannel,
  onEditClick,
  onDeleteClick,
  onMove,
}: StationListProps) {
  return (
    <div id="station-list-container" className="space-y-5">
      
      {/* Filters Bar */}
      <div className="bg-zinc-900/20 rounded-2xl border border-white/5 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs shrink-0">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
          <input 
            id="station-search-input"
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
            id="station-category-dropdown"
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
        <div id="station-loading-state" className="py-24 text-center text-slate-400 font-mono text-xs">
          <RefreshCw className="animate-spin mx-auto mb-3 opacity-35 text-cyan-400" size={24} />
          <span>Querying database structures... please hold on...</span>
        </div>
      ) : filteredChannels.length === 0 ? (
        <div id="station-empty-state" className="py-24 text-center text-neutral-500 border border-dashed border-white/5 rounded-2xl bg-zinc-950/20">
          <FolderOpen className="mx-auto mb-3 opacity-25" size={32} />
          <span className="text-xs font-mono">No live channels discovered matching criteria.</span>
        </div>
      ) : (
        <div id="station-scroll-list" className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
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
                    <h4 className="text-slate-100 font-bold text-xs truncate max-w-[150px] sm:max-w-xs">{chan.name}</h4>
                    <span className="text-[9px] bg-white/5 border border-white/5 text-slate-400 px-1.5 py-0.5 rounded font-mono font-medium truncate max-w-[80px]">
                      {chan.category}
                    </span>
                    {chan.isDefault && (
                      <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold shrink-0 animate-pulse font-bold">
                        ★ DEFAULT STARTUP
                      </span>
                    )}
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
                    onClick={() => onMove(idx, "up")}
                    disabled={idx === 0}
                    title="Move Up"
                    className={`p-1.5 rounded transition hover:text-white cursor-pointer ${
                      idx === 0 ? "text-neutral-700 pointer-events-none" : "text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <ArrowUp size={11} />
                  </button>
                  <button 
                    onClick={() => onMove(idx, "down")}
                    disabled={idx === filteredChannels.length - 1}
                    title="Move Down"
                    className={`p-1.5 rounded transition hover:text-white cursor-pointer ${
                      idx === filteredChannels.length - 1 ? "text-neutral-700 pointer-events-none" : "text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    <ArrowDown size={11} />
                  </button>
                </div>

                {/* Set Default Startup Toggle */}
                <button 
                  onClick={() => onSetDefaultChannel(chan.isDefault ? null : chan.id)}
                  title={chan.isDefault ? "Clear Default Startup Channel" : "Set as Default Startup Channel"}
                  className={`p-2 rounded-lg border font-bold cursor-pointer transition ${
                    chan.isDefault 
                      ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" 
                      : "text-slate-400 border-white/5 bg-neutral-900 hover:text-cyan-400 hover:bg-neutral-800"
                  }`}
                >
                  <Pin size={11} className={chan.isDefault ? "fill-cyan-400" : ""} />
                </button>

                {/* Basic Edit / Delete */}
                <button 
                  onClick={() => onEditClick(chan)}
                  title="Edit Channel Properties"
                  className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-neutral-800 rounded-lg border border-white/5 bg-neutral-900 font-bold cursor-pointer transition font-bold"
                >
                  <Edit2 size={11} />
                </button>
                <button 
                  onClick={() => onDeleteClick(chan)}
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
  );
}
