"use client";

import { usePlayer } from "@/lib/PlayerContext";
import { useCallback } from "react";

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const {
    currentTrack, isPlaying, progress, duration, currentTime,
    volume, isMuted, pause, resume, next, prev, seek, setVolume, toggleMute,
  } = usePlayer();

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    seek(percent);
  }, [seek]);

  const handleVolume = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setVolume(percent);
  }, [setVolume]);

  if (!currentTrack) return null;

  const volumeIcon = isMuted || volume === 0 ? "🔇" : volume < 0.4 ? "🔈" : volume < 0.75 ? "🔉" : "🔊";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 player-bar">
      {/* Progress bar - full width, above player */}
      <div
        className="w-full h-1 bg-white/10 cursor-pointer group"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 relative transition-all"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
        </div>
      </div>

      <div className="px-4 py-3 flex items-center gap-4">

        {/* Track info */}
        <div className="flex items-center gap-3 w-64 min-w-0">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
            {currentTrack.cover ? (
              <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">🎵</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{currentTrack.title}</p>
            <p className="text-white/50 text-xs truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Controls - center */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-6">
            <button
              onClick={prev}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Previous"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
              </svg>
            </button>

            <button
              onClick={isPlaying ? pause : resume}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button
              onClick={next}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Next"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume - right */}
        <div className="flex items-center gap-2 w-40 justify-end">
          <button
            onClick={toggleMute}
            className="text-white/60 hover:text-white transition-colors text-lg flex-shrink-0"
            aria-label="Toggle mute"
          >
            {volumeIcon}
          </button>

          {/* Volume slider */}
          <div
            className="relative flex-1 h-1 bg-white/20 rounded-full cursor-pointer group"
            onClick={handleVolume}
          >
            <div
              className="h-full bg-white/80 rounded-full relative transition-all"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow" />
            </div>
          </div>

          {/* Volume percentage */}
          <span className="text-white/40 text-xs w-8 text-right flex-shrink-0">
            {isMuted ? "0" : Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
