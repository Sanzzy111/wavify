"use client";

import { useEffect, useState } from "react";
import TrackCard from "@/components/TrackCard";
import { Track } from "@/lib/PlayerContext";

export default function HomePage() {
  const [globalTrending, setGlobalTrending] = useState<Track[]>([]);
  const [idTrending, setIdTrending] = useState<Track[]>([]);
  const [internalTrending, setInternalTrending] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const [global, indonesia, internal] = await Promise.allSettled([
          fetch("/api/trending?type=global").then(r => r.json()),
          fetch("/api/trending?type=indonesia").then(r => r.json()),
          fetch("/api/trending?type=internal").then(r => r.json()),
        ]);

        if (global.status === "fulfilled") setGlobalTrending(global.value.results ?? []);
        if (indonesia.status === "fulfilled") setIdTrending(indonesia.value.results ?? []);
        if (internal.status === "fulfilled") setInternalTrending(internal.value.results ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Hero */}
      <div className="px-6 pt-10 pb-8">
        <p className="text-white/40 text-sm font-medium tracking-widest uppercase mb-1">
          {greeting()}
        </p>
        <h1 className="text-4xl font-bold text-white">
          What&apos;s <span className="text-emerald-400">trending</span> today?
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-6 space-y-10">

          {/* Internal trending (most played on this app) */}
          {internalTrending.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🔥</span>
                <h2 className="text-xl font-bold text-white">Most Played Here</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {internalTrending.slice(0, 6).map((track, i) => (
                  <TrackCard key={i} track={track} queue={internalTrending} index={i} variant="grid" />
                ))}
              </div>
            </section>
          )}

          {/* Trending Indonesia */}
          {idTrending.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🇮🇩</span>
                <h2 className="text-xl font-bold text-white">Trending Indonesia</h2>
              </div>
              <div className="space-y-1">
                {idTrending.slice(0, 15).map((track, i) => (
                  <TrackCard key={i} track={track} queue={idTrending} index={i} variant="list" />
                ))}
              </div>
            </section>
          )}

          {/* Trending Global */}
          {globalTrending.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🌍</span>
                <h2 className="text-xl font-bold text-white">Trending Global</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {globalTrending.slice(0, 10).map((track, i) => (
                  <TrackCard key={i} track={track} queue={globalTrending} index={i} variant="grid" />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
