/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  AlertCircle, 
  RefreshCw, 
  Activity, 
  Layers, 
  Check, 
  HelpCircle 
} from "lucide-react";
import { Channel } from "../types";

interface IPTVPlayerProps {
  channel: Channel | null;
  onAutoPlayFailed?: () => void;
}

export default function IPTVPlayer({ channel, onAutoPlayFailed }: IPTVPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // States for player controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Custom states for quality switching
  const [qualities, setQualities] = useState<Array<{ index: number; height: number; bitrate: number }>>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 is Auto
  const [showSettings, setShowSettings] = useState(false);

  // Stats / Diagnostics overlay state
  const [showStats, setShowStats] = useState(false);
  const [latency, setLatency] = useState<number>(0);
  const [resolution, setResolution] = useState<string>("Unknown");
  const [bufferLength, setBufferLength] = useState<number>(0);
  const [bitrate, setBitrate] = useState<number>(0);

  // Trigger stream refresh/retry
  const handleReload = () => {
    setRetryCount(prev => prev + 1);
  };

  // Keep track of quality/buffering stats on intervals
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && videoRef.current) {
      interval = setInterval(() => {
        const video = videoRef.current;
        if (!video) return;

        // Active video dimensions
        setResolution(`${video.videoWidth}x${video.videoHeight}`);

        // Buffer length
        let bufLen = 0;
        const buffered = video.buffered;
        const time = video.currentTime;
        for (let i = 0; i < buffered.length; i++) {
          if (time >= buffered.start(i) && time <= buffered.end(i)) {
            bufLen = buffered.end(i) - time;
            break;
          }
        }
        setBufferLength(parseFloat(bufLen.toFixed(1)));

        // Hls.js diagnostics if active
        if (hlsRef.current) {
          const hls = hlsRef.current;
          if (hls.levels && hls.currentLevel !== -1 && hls.levels[hls.currentLevel]) {
            const level = hls.levels[hls.currentLevel];
            setBitrate(Math.round(level.bitrate / 1000));
          } else {
            setBitrate(0);
          }
          if (hls.latency !== undefined) {
            setLatency(parseFloat(hls.latency.toFixed(2)));
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle stream url changes
  useEffect(() => {
    if (!channel) return;

    setErrorMsg(null);
    setIsLoading(true);
    setQualities([]);
    setCurrentQuality(-1);
    setShowSettings(false);

    const video = videoRef.current;
    if (!video) return;

    // Clean up previous Hls.js instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = channel.url;

    // Standard hls.js options for highly responsive live streams
    const hlsConfig = {
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 60,
      maxBufferLength: 30,
      manifestLoadingMaxRetry: 4,
      manifestLoadingRetryDelay: 1000,
      levelLoadingMaxRetry: 4,
    };

    if (Hls.isSupported()) {
      const hls = new Hls(hlsConfig);
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        // Safe to play
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsLoading(false);
        
        // Extract and populate quality levels
        const levels = hls.levels.map((level, idx) => ({
          index: idx,
          height: level.height,
          bitrate: level.bitrate
        }));
        setQualities(levels);

        // Attempt autoplay
        video.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.log("Autoplay failed/blocked by browser, waiting for user interaction:", err);
            setIsPlaying(false);
            if (onAutoPlayFailed) onAutoPlayFailed();
          });
      });

      // Handle custom quality changes
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        // Sync our local states
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS.js loading error: ", data);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMsg("Network connection error. Reconnecting stream...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setErrorMsg("Media buffer parity error. Reviving player decoding...");
              hls.recoverMediaError();
              break;
            default:
              setErrorMsg("Unable to boot stream. This channel may be offline, format unsupported, or blocked by CORS restrictions.");
              hls.destroy();
              setIsLoading(false);
              setIsPlaying(false);
              break;
          }
        }
      });

    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native Safari support
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      });

      video.addEventListener("error", (e) => {
        console.error("Native HLS error: ", e);
        setErrorMsg("Failed to open the live stream natively. If you are on Desktop, please ensure modern CORS permissions allow loading.");
        setIsLoading(false);
        setIsPlaying(false);
      });
    } else {
      setErrorMsg("Your web browser is not equipped to play HLS (.m3u8) video streams directly. Please try a modern browser like Chrome, Edge, or Safari.");
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, retryCount]);

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  // Sync Volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Listen for fullscreen change events to update state representation
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Controls actions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || isLoading || errorMsg) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const changeLevel = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
    }
    setShowSettings(false);
  };

  return (
    <div id="player-view-container" className="flex flex-col bg-[#0d0d0d] rounded-2xl overflow-hidden shadow-2xl relative border border-white/5 transition-all duration-300">
      
      {/* Video Frame Host Container */}
      <div 
        ref={containerRef}
        className="relative group aspect-video w-full bg-black select-none max-h-[70vh]"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          playsInline
          id="shafinbd-video-element"
        />

        {/* Dynamic Inner Hover Overlay (Semi-gradient background) */}
        <div 
          id="player-overlay"
          className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/35 flex flex-col justify-between transition-opacity duration-300 p-4 ${
            isPlaying && !showSettings ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          }`}
          onClick={(e) => e.stopPropagation()} // Overlays maintain core click handling
        >
          {/* Header Title Information */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col drop-shadow-md">
              {channel ? (
                <>
                  <span id="player-channel-category" className="text-cyan-400 font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 mb-1 bg-cyan-950/50 border border-cyan-800/30 px-2 py-0.5 rounded w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    {channel.category}
                  </span>
                  <h3 id="player-channel-title" className="text-white text-base md:text-xl font-bold tracking-tight">
                    {channel.name}
                  </h3>
                </>
              ) : (
                <span className="text-white font-medium">Select a live TV channel to stream</span>
              )}
            </div>

            {/* Diagnostic Stats Button */}
            <div className="flex items-center gap-2">
              <button 
                id="btn-toggle-diagnostics"
                onClick={() => setShowStats(!showStats)}
                title="Stream Diagnostics"
                className={`p-2 rounded-lg border transition-all ${
                  showStats 
                    ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]" 
                    : "bg-black/40 border-white/10 hover:border-white/20 text-white/70 hover:text-white"
                }`}
              >
                <Activity size={16} />
              </button>
            </div>
          </div>

          {/* Buffering/Loading Indicator */}
          {isLoading && (
            <div id="player-loading-scaffold" className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 pointer-events-none">
              <RefreshCw className="animate-spin text-cyan-400 mb-3" size={42} />
              <p className="text-white/80 font-medium tracking-wide text-sm">Aligning IPTV signal buffers...</p>
            </div>
          )}

          {/* Playback Error Container */}
          {errorMsg && (
            <div id="player-error-scaffold" className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-20 p-4 text-center animate-fade-in text-slate-100">
              <div className="max-w-[480px]">
                <AlertCircle className="text-red-500 mx-auto mb-4 animate-bounce" size={48} />
                <h4 className="text-white text-lg font-bold mb-2">Stream Initialization Offline</h4>
                <p className="text-slate-400 text-xs md:text-sm line-clamp-3 mb-4 leading-relaxed">
                  {errorMsg}
                </p>
                
                {/* Advanced Diagnostic recommendations for users */}
                <div id="troubleshooting-card" className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-3 mb-5 text-left text-slate-300 text-xs space-y-1.5">
                  <div className="font-semibold text-rose-300 flex items-center gap-1">
                    <HelpCircle size={13} strokeWidth={2.5} />
                    Common Fixes:
                  </div>
                  <p>1. <strong>CORS Shielding</strong>: IPTV feeds require CORS clearance. If blocked, install <strong>CORS Unblock</strong> extension in your Chrome browser.</p>
                  <p>2. <strong>Stream Offline</strong>: Feeds expire frequently. Try pasting a verified M3U8 link in custom payload tab or test other loaded channels.</p>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <button 
                    id="btn-error-retry"
                    onClick={handleReload}
                    className="bg-cyan-500 hover:bg-cyan-600 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] active:transform hover:scale-[1.02] text-black font-semibold text-sm px-4 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 shadow-lg shadow-cyan-950/40"
                  >
                    <RefreshCw size={14} className="animate-spin-slow" />
                    Attempt Reconnection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analytics / Stats Overlay */}
          {showStats && isPlaying && (
            <div id="player-diagnostics-overlay" className="absolute top-16 right-4 bg-black/90 border border-white/10 rounded-xl p-3 text-[11px] font-mono text-slate-300 space-y-1.5 z-10 max-w-[200px] shadow-lg pointer-events-none">
              <div className="border-b border-white/5 pb-1 mb-1 font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                <Activity size={10} /> Stream Signals
              </div>
              <div><span className="text-slate-500">Res:</span> {resolution}</div>
              <div><span className="text-slate-500">Buffer:</span> {bufferLength}s</div>
              {bitrate > 0 && <div><span className="text-slate-500">Bitrate:</span> {bitrate} kbps</div>}
              {latency > 0 && <div><span className="text-slate-500">Latency:</span> {latency}s</div>}
              <div><span className="text-slate-500">Protocol:</span> HLS.js {Hls.version}</div>
            </div>
          )}

          {/* Sub Control bar */}
          <div className="mt-auto flex flex-col gap-2">
            
            {/* ProgressBar / Hover Indicator - (Not seeker because HLS livestreams are infinite) */}
            <div className="w-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full w-full" />
              </div>
              <span className="text-[10px] text-white/50 font-mono tracking-wider">LIVE STREAM</span>
            </div>

            {/* Custom Control Buttons layout */}
            <div className="flex items-center justify-between mt-1">
              {/* Play Pause & Volume Controls */}
              <div className="flex items-center gap-4">
                <button
                  id="btn-play-pause"
                  onClick={togglePlay}
                  className="text-white hover:text-cyan-400 transition-colors p-1"
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>

                {/* Volume slider control */}
                <div className="flex items-center gap-2 group/volume">
                  <button
                    id="btn-volume-toggle"
                    onClick={toggleMute}
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
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 group-hover/volume:w-20 transition-all duration-300"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Right Settings and Fullscreen Control */}
              <div className="flex items-center gap-3">
                {/* Advanced Settings menu toggle */}
                {qualities.length > 0 && (
                  <div className="relative">
                    <button
                      id="btn-toggle-video-settings"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSettings(!showSettings);
                      }}
                      className="text-white/80 hover:text-cyan-400 transition-colors p-1"
                    >
                      <Settings size={18} className={showSettings ? "rotate-45" : ""} />
                    </button>
                    
                    {/* Settings Dropdown menu popup */}
                    {showSettings && (
                      <div className="absolute bottom-10 right-0 bg-slate-950/95 border border-white/10 rounded-xl overflow-hidden py-1.5 w-40 z-30 shadow-2xl backdrop-blur-md">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold px-3 py-1 border-b border-white/5 flex items-center gap-1.5">
                          <Layers size={10} /> Live Resolution
                        </div>
                        {/* Auto Level toggle */}
                        <button
                          onClick={() => changeLevel(-1)}
                          className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                            currentQuality === -1 
                              ? "bg-cyan-500/10 text-cyan-400 font-semibold" 
                              : "text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          Auto
                          {currentQuality === -1 && <Check size={12} />}
                        </button>
                        {/* Individual qualities map */}
                        {qualities.map((q) => (
                          <button
                            key={q.index}
                            onClick={() => changeLevel(q.index)}
                            className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                              currentQuality === q.index 
                                ? "bg-cyan-500/10 text-cyan-400 font-semibold" 
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {q.height}p
                            {currentQuality === q.index && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  id="btn-video-fullscreen"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Under Player Stream Detail Summary card */}
      {channel && (
        <div id="player-channel-summary-info" className="p-4 bg-[#0d0d0d] border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {channel.logoUrl ? (
              <img 
                id="player-active-channel-logo"
                src={channel.logoUrl} 
                alt={channel.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Hide logo on fallback, show generic badge
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                className="w-12 h-12 rounded-xl object-contain bg-slate-900 border border-white/10 p-1 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-lg text-cyan-400 shrink-0 select-none">
                {channel.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            
            <div className="flex flex-col">
              <h4 id="player-active-channel-name" className="text-white font-bold leading-snug">{channel.name}</h4>
              <p id="player-active-channel-desc" className="text-slate-400 text-xs mt-0.5 line-clamp-1 max-w-[600px]">
                {channel.description || "Interactive dynamic live streaming source. Buffering adaptive HLS signals."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <span className="font-semibold text-slate-200">SIGNAL SECURE</span>
          </div>
        </div>
      )}

    </div>
  );
}
