"use client";

import { usePlayer, Track } from "@/lib/PlayerContext";

interface TrackCardProps {
  track: Track;
  queue?: Track[];
  index?: number;
  variant?: "grid" | "list";
}

export default function TrackCard({ track, queue, index, variant = "grid" }: TrackCardProps) {
  const { play, pause, currentTrack, isPlaying } = usePlayer();

  const isActive = currentTrack?.title === track.title && currentTrack?.artist === track.artist;

  const handlePlay = () => {
    if (isActive && isPlaying) {
      pause();
    } else {
      play(track, queue);
    }
  };

  if (variant === "list") {
    return (
      <div
        onClick={handlePlay}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer group transition-all
          ${isActive ? "bg-white/10" : "hover:bg-white/5"}`}
      >
        {/* Index or play icon */}
        <div className="w-6 text-center flex-shrink-0">
          {isActive && isPlaying ? (
            <span className="text-emerald-400 text-xs">▶</span>
          ) : (
            <span className="text-white/30 text-sm group-hover:hidden">{index != null ? index + 1 : ""}</span>
          )}
          <span className={`text-white/60 text-xs hidden group-hover:inline ${isActive && isPlaying ? "!hidden" : ""}`}>▶</span>
        </div>

        {/* Cover */}
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
          {track.cover ? (
            <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base">🎵</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isActive ? "text-emerald-400" : "text-white"}`}>
            {track.title}
          </p>
          <p className="text-white/40 text-xs truncate">{track.artist}</p>
        </div>

        {/* Preview badge */}
        {track.preview && (
          <span className="text-white/20 text-xs flex-shrink-0">30s</span>
        )}
      </div>
    );
  }

  // Grid variant
  return (
    <div
      onClick={handlePlay}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 
        ${isActive ? "ring-2 ring-emerald-400" : "hover:scale-[1.02]"}`}
    >
      {/* Cover */}
      <div className="aspect-square bg-white/10 relative overflow-hidden">
        {track.cover ? (
          <img
            src={track.cover}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎵</div>
        )}

        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity
          ${isActive && isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            {isActive && isPlaying ? (
              <span className="text-white text-lg">⏸</span>
            ) : (
              <span className="text-white text-lg pl-1">▶</span>
            )}
          </div>
        </div>

        {isActive && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-white/5">
        <p className={`text-sm font-semibold truncate ${isActive ? "text-emerald-400" : "text-white"}`}>
          {track.title}
        </p>
        <p className="text-white/40 text-xs truncate mt-0.5">{track.artist}</p>
      </div>
    </div>
  );
}
