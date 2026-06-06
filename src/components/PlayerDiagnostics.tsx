import React from "react";
import { Activity } from "lucide-react";
import Hls from "hls.js";

interface PlayerDiagnosticsProps {
  resolution: string;
  bufferLength: number;
  bitrate: number;
  latency: number;
}

export default function PlayerDiagnostics({
  resolution,
  bufferLength,
  bitrate,
  latency,
}: PlayerDiagnosticsProps) {
  return (
    <div 
      id="player-diagnostics-overlay" 
      className="absolute top-16 right-4 bg-black/95 border border-white/10 rounded-xl p-3 text-[11px] font-mono text-slate-300 space-y-1.5 z-30 max-w-[230px] shadow-2xl pointer-events-none"
    >
      <div className="border-b border-white/5 pb-1 mb-1 font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
        <Activity size={10} className="text-cyan-400" /> 
        <span>Stream Signals</span>
      </div>
      <div><span className="text-slate-500">Resolution:</span> {resolution}</div>
      <div><span className="text-slate-500">Buffer Length:</span> {bufferLength}s</div>
      {bitrate > 0 && <div><span className="text-slate-500">Bitrate:</span> {bitrate} kbps</div>}
      {latency > 0 && <div><span className="text-slate-500">Latency:</span> {latency}s</div>}
      <div><span className="text-slate-500">Protocol:</span> HLS.js {Hls.version}</div>
    </div>
  );
}
