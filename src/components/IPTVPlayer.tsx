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
  RefreshCw, 
  Layers, 
  Tv,
  Users
} from "lucide-react";
import { Channel } from "../types";
import PlayerShortcuts from "./PlayerShortcuts";
import PlayerDiagnostics from "./PlayerDiagnostics";
import PlayerErrorScaffold from "./PlayerErrorScaffold";
import PlayerHeader from "./PlayerHeader";
import PlayerControls from "./PlayerControls";

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
  
  // Dynamic Aspect Ratio Selector: fit (contain), stretch (fill), zoom (cover)
  const [aspectRatio, setAspectRatio] = useState<"contain" | "fill" | "cover">("contain");

  // Keyboard shortcut assistant modal state
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Auto-hiding control HUD and mouse cursor state
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Premium ripple interaction animations state (YT/Netflix style center feedback)
  const [ripple, setRipple] = useState<{ id: number; type: string } | null>(null);

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

  // Real-time Concurrent Viewers state
  const [viewersCount, setViewersCount] = useState<number>(0);

  // Helper to generate a deterministic starting viewer baseline for each channel
  const getInitialViewers = (channelName: string) => {
    let hash = 0;
    for (let i = 0; i < channelName.length; i++) {
      hash = channelName.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Return a realistic viewer numbers between 850 and 15300
    return 850 + (Math.abs(hash) % 14450);
  };

  // Trigger ripple animations
  const triggerRipple = (type: string) => {
    setRipple({ id: Date.now(), type });
  };

  // Reset/Trigger controls & cursor self-hide countdown helper
  const resetControlsTimeout = () => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    // Only schedule controls fade out when playing is active and settings is not open
    if (isPlaying && !showSettings && !showShortcuts) {
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }
  };

  // Restart / Reload current feed
  const handleReload = () => {
    setRetryCount(prev => prev + 1);
    triggerRipple("reload");
  };

  // Trigger ripple clear auto-timeout
  useEffect(() => {
    if (ripple) {
      const timer = setTimeout(() => {
        setRipple(null);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [ripple]);

  // Monitor mouse interactions to reset auto-hide controls
  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showSettings, showShortcuts]);

  // Set and animate active concurrent viewer signals
  useEffect(() => {
    if (!channel) {
      setViewersCount(0);
      return;
    }
    
    // Set baseline
    const base = getInitialViewers(channel.name);
    setViewersCount(base);

    // Slowly fluctuate viewer count to simulate dynamic multi-users joining/leaving
    const interval = setInterval(() => {
      setViewersCount(current => {
        const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4 change
        const nextCount = current + delta;
        return nextCount > 100 ? nextCount : base;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [channel]);

  // Trigger action: Aspect Ratio Rotation sequence
  const rotateAspectRatio = () => {
    const nextMap: Record<"contain" | "fill" | "cover", "contain" | "fill" | "cover"> = {
      contain: "cover",
      cover: "fill",
      fill: "contain",
    };
    const nextRatio = nextMap[aspectRatio];
    setAspectRatio(nextRatio);
    triggerRipple(`aspect-${nextRatio}`);
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
      // Native Safari/iOS support
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

  // Sync Volume & Mute in real live-video elements
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Listen for native Fullscreen changed sensors
  useEffect(() => {
    const handleFullscreenChange = () => {
      const activeFullscreen = !!document.fullscreenElement;
      setIsFullscreen(activeFullscreen);
      
      // If exited fullscreen, automatically unlock orientation back to portrait/auto
      if (!activeFullscreen) {
        if (screen.orientation && typeof screen.orientation.unlock === "function") {
          try {
            screen.orientation.unlock();
          } catch (err) {
            console.log("Failed to unlock orientation:", err);
          }
        }
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard Shortcuts Listeners Setup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when user is focusing on chat, fields or input controls
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      resetControlsTimeout(); // Show controls when user hits keys

      switch (key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "a":
        case "v":
          e.preventDefault();
          rotateAspectRatio();
          break;
        case "r":
          e.preventDefault();
          handleReload();
          break;
        case "arrowup":
          e.preventDefault();
          setVolume(prev => {
            const nextVal = Math.min(1, parseFloat((prev + 0.05).toFixed(2)));
            triggerRipple(`vol-${Math.round(nextVal * 100)}`);
            if (isMuted) setIsMuted(false);
            return nextVal;
          });
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume(prev => {
            const nextVal = Math.max(0, parseFloat((prev - 0.05).toFixed(2)));
            triggerRipple(`vol-${Math.round(nextVal * 100)}`);
            if (isMuted && nextVal > 0) setIsMuted(false);
            return nextVal;
          });
          break;
        case "h":
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isMuted, volume, aspectRatio, channel]);

  // Playback Control Actions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || isLoading || errorMsg) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      triggerRipple("pause");
    } else {
      video.play()
        .then(() => {
          setIsPlaying(true);
          triggerRipple("play");
        })
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    triggerRipple(nextMute ? "mute" : "unmute");
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        try {
          await container.requestFullscreen();
          // Attempt to lock orientation to landscape on mobile devices
          const orientationObj = screen.orientation as any;
          if (orientationObj && typeof orientationObj.lock === "function") {
            await orientationObj.lock("landscape").catch((err: any) => {
              console.log("Orientation lock is not supported or was rejected:", err);
            });
          }
        } catch (err) {
          console.error("Failed to enter fullscreen:", err);
        }
      }
    } else {
      if (document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch (err) {
          console.error("Failed to exit fullscreen:", err);
        }
      }
    }
  };

  const changeLevel = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      triggerRipple("quality");
    }
    setShowSettings(false);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // If controllers/settings are clicked, skip container interaction toggles
    const target = e.target as HTMLElement;
    if (target.closest("#hud-interactive-elements") || target.closest("#player-diagnostics-overlay")) {
      return;
    }
    togglePlay();
  };

  const handleContainerDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFullscreen();
  };

  // Resolve current active class targeting object-fit properties on the video element
  const getAspectRatioClass = () => {
    if (aspectRatio === "contain") return "object-contain";
    if (aspectRatio === "fill") return "object-fill";
    return "object-cover";
  };

  return (
    <div 
      id="player-view-container" 
      className="flex flex-col bg-[#0d0d0d] rounded-2xl overflow-hidden shadow-2xl relative border border-white/5 transition-all duration-300"
    >
      {/* Dynamic Keyframe Ripple Effect CSS */}
      <style>{`
        @keyframes rippleVisual {
          0% { transform: scale(0.5); opacity: 0; }
          15% { transform: scale(1.1); opacity: 0.95; }
          40% { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .animate-hud-ripple {
          animation: rippleVisual 800ms cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* Video Frame Host Container */}
      <div 
        ref={containerRef}
        className={`relative group aspect-video w-full bg-black select-none max-h-[70vh] transition-all overflow-hidden ${
          isControlsVisible ? "cursor-default" : "cursor-none"
        }`}
        onClick={handleContainerClick}
        onDoubleClick={handleContainerDoubleClick}
        onMouseMove={resetControlsTimeout}
        onTouchStart={resetControlsTimeout}
      >
        <video
          ref={videoRef}
          className={`w-full h-full cursor-pointer transition-all duration-300 ${getAspectRatioClass()}`}
          playsInline
          id="shafinbd-video-element"
        />

        {/* Central visual feedback ripple (YT styles) */}
        {ripple && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
            <div className="bg-black/80 backdrop-blur-md rounded-full p-6 border border-white/10 text-cyan-400 font-mono shadow-2xl animate-hud-ripple flex flex-col items-center justify-center min-w-[100px] h-[100px]">
              {ripple.type === "play" && <Play size={28} fill="currentColor" className="ml-1" />}
              {ripple.type === "pause" && <Pause size={28} fill="currentColor" />}
              {ripple.type === "mute" && <VolumeX size={28} className="text-rose-400" />}
              {ripple.type === "unmute" && <Volume2 size={28} className="text-cyan-400" />}
              {ripple.type === "reload" && <RefreshCw size={28} className="animate-spin text-cyan-400" />}
              {ripple.type === "quality" && (
                <div className="flex flex-col items-center">
                  <Layers size={20} />
                  <span className="text-[10px] font-bold mt-1">Resolution</span>
                </div>
              )}
              {ripple.type.startsWith("vol-") && (
                <div className="flex flex-col items-center">
                  <Volume2 size={20} />
                  <span className="text-[10px] font-bold mt-1">{ripple.type.slice(4)}%</span>
                </div>
              )}
              {ripple.type.startsWith("aspect-") && (
                <div className="flex flex-col items-center">
                  <Tv size={20} />
                  <span className="text-[10px] font-bold mt-1 text-center uppercase">
                    {ripple.type.replace("aspect-", "")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Inner Hover Overlay (Semi-gradient background) */}
        <div 
          id="player-overlay"
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/45 flex flex-col justify-between transition-opacity duration-300 p-4 ${
            isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={(e) => e.stopPropagation()} // Overlays maintain core click handling
        >
          {/* Header Title Information Row */}
          <PlayerHeader 
            channel={channel}
            showShortcuts={showShortcuts}
            setShowShortcuts={setShowShortcuts}
            showStats={showStats}
            setShowStats={setShowStats}
          />

          {/* Buffering/Loading Indicator */}
          {isLoading && (
            <div id="player-loading-scaffold" className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 pointer-events-none animate-pulse">
              <RefreshCw className="animate-spin text-cyan-400 mb-3" size={42} />
              <p className="text-cyan-300 font-semibold tracking-wide text-xs md:text-sm font-mono">ALIGNING IPTV LIVE FEED...</p>
            </div>
          )}

          {/* Playback Error Container */}
          {errorMsg && (
            <PlayerErrorScaffold 
              errorMsg={errorMsg} 
              onReload={handleReload} 
            />
          )}

          {/* Interactive Keyboard Shortcuts Assistant Modal */}
          {showShortcuts && (
            <PlayerShortcuts 
              onClose={() => setShowShortcuts(false)} 
            />
          )}

          {/* Diagnostics / Stats Overlay panel */}
          {showStats && isPlaying && (
            <PlayerDiagnostics 
              resolution={resolution}
              bufferLength={bufferLength}
              bitrate={bitrate}
              latency={latency}
            />
          )}

          {/* Modular sub Control HUD overlay */}
          <PlayerControls 
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            aspectRatio={aspectRatio}
            onRotateAspectRatio={rotateAspectRatio}
            qualities={qualities}
            currentQuality={currentQuality}
            onChangeQuality={changeLevel}
            showSettings={showSettings}
            onToggleSettings={setShowSettings}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />

        </div>

      </div>

      {/* Under Player Stream Detail Summary bar */}
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
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                className="w-12 h-12 rounded-xl object-contain bg-slate-900 border border-white/10 p-1 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-lg text-cyan-400 shrink-0 select-none">
                {channel.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            
            <div className="flex flex-col animate-fade-in" key={channel.id}>
              <h4 id="player-active-channel-name" className="text-white font-bold leading-snug">{channel.name}</h4>
              <p id="player-active-channel-desc" className="text-slate-400 text-xs mt-0.5 line-clamp-1 max-w-[600px]">
                {channel.description || "Interactive dynamic live streaming source. Buffering adaptive HLS signals."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewersCount > 0 && (
              <div id="player-live-viewers-badge" className="flex items-center gap-1.5 text-xs bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl text-rose-400 select-none font-mono font-medium animate-fade-in">
                <Users size={12} className="text-rose-500 animate-pulse" />
                <span>{viewersCount.toLocaleString()} watching</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs shrink-0 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5 text-slate-300 select-none">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              <span className="font-semibold text-slate-200 font-mono tracking-wide">LIVE SIGNAL</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
