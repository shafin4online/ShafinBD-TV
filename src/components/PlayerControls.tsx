import React from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Tv, 
  Settings, 
  Layers, 
  Check, 
  Minimize, 
  Maximize,
  PictureInPicture
} from "lucide-react";

interface PlayerQuality {
  index: number;
  height: number;
  bitrate: number;
}

interface PlayerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  aspectRatio: "contain" | "fill" | "cover";
  onRotateAspectRatio: () => void;
  qualities: PlayerQuality[];
  currentQuality: number;
  onChangeQuality: (levelIndex: number) => void;
  showSettings: boolean;
  onToggleSettings: (visible: boolean) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isPiPSupported?: boolean;
  onTogglePiP?: () => void;
}

export default function PlayerControls({
  isPlaying,
  onTogglePlay,
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
  aspectRatio,
  onRotateAspectRatio,
  qualities,
  currentQuality,
  onChangeQuality,
  showSettings,
  onToggleSettings,
  isFullscreen,
  onToggleFullscreen,
  isPiPSupported = false,
  onTogglePiP,
}: PlayerControlsProps) {
  return (
    <div id="hud-controls-dock" className="mt-auto flex flex-col gap-2 z-30">
      {/* Live progress indicator train */}
      <div className="w-full flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
        <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-400 rounded-full w-full" />
        </div>
        <span className="text-[10px] text-white/50 font-mono tracking-wider">LIVE STREAM</span>
      </div>

      {/* Buttons docking bar */}
      <div className="flex items-center justify-between mt-1">
        {/* Play Pause & Volume Controls */}
        <div className="flex items-center gap-4">
          <button
            id="btn-play-pause"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            className="text-white hover:text-cyan-400 transition-colors p-1"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>

          {/* Volume toggle & slide controls */}
          <div className="flex items-center gap-2 group/volume">
            <button
              id="btn-volume-toggle"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}
              className="text-white/80 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              id="input-player-volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={onVolumeChange}
              className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 group-hover/volume:w-20 transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Aspect Ratio, Resolutions and Fullscreen settings */}
        <div className="flex items-center gap-3">
          {/* Dynamic Aspect Ratio aspect toggle trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotateAspectRatio();
            }}
            title={`Toggle Aspect Ratio (Current: ${aspectRatio})`}
            className="text-white/80 hover:text-cyan-400 transition-colors p-1 flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5 hover:border-white/10"
          >
            <Tv size={14} />
            <span className="text-[10px] font-bold font-mono uppercase hidden sm:inline">{aspectRatio}</span>
          </button>

          {/* Stream resolution levels settings popover control */}
          {qualities.length > 0 && (
            <div className="relative">
              <button
                id="btn-toggle-video-settings"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSettings(!showSettings);
                }}
                className="text-white/80 hover:text-cyan-400 transition-colors p-1"
              >
                <Settings size={18} className={showSettings ? "rotate-45" : ""} />
              </button>
              
              {/* Resolutions popup dropdown window */}
              {showSettings && (
                <div 
                  className="absolute bottom-10 right-0 bg-slate-950/95 border border-white/10 rounded-xl overflow-hidden py-1.5 w-44 z-40 shadow-2xl backdrop-blur-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold px-3 py-1 border-b border-white/5 flex items-center gap-1.5">
                    <Layers size={10} /> Stream Feeds
                  </div>
                  {/* Auto adaptive levels switch option button */}
                  <button
                    onClick={() => {
                      onChangeQuality(-1);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition ${
                      currentQuality === -1 
                        ? "bg-cyan-500/15 text-cyan-400 font-semibold" 
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    Auto Adaptive
                    {currentQuality === -1 && <Check size={12} />}
                  </button>
                  {/* Single levels map items */}
                  {qualities.map((q) => (
                    <button
                      key={q.index}
                      onClick={() => {
                        onChangeQuality(q.index);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition ${
                        currentQuality === q.index 
                          ? "bg-cyan-500/15 text-cyan-400 font-semibold" 
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {q.height}p ({Math.round(q.bitrate/1000)}k)
                      {currentQuality === q.index && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* System Device Picture-in-Picture floating toggle */}
          {isPiPSupported && (
            <button
              id="btn-video-pip"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePiP?.();
              }}
              title="System Picture-in-Picture (Overlay)"
              className="text-white/80 hover:text-cyan-400 transition-colors p-1"
            >
              <PictureInPicture size={18} />
            </button>
          )}

          {/* Fullscreen entering toggle switch */}
          <button
            id="btn-video-fullscreen"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFullscreen();
            }}
            className="text-white/80 hover:text-white transition-colors p-1"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
