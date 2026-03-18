"use client";

import { useState, useCallback, useRef } from "react";
import TrackCard from "@/components/TrackCard";
import { Track } from "@/lib/PlayerContext";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  return (
    <div className="min-h-screen pb-32 px-6 pt-10">
      <h1 className="text-3xl font-bold text-white mb-6">Search</h1>

      {/* Search input */}
      <div className="relative mb-8">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">🔍</span>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder="Songs, artists, albums..."
          className="w-full pl-12 pr-4 py-4 bg-white/10 rounded-2xl text-white placeholder-white/30
            border border-white/10 focus:border-emerald-400/50 focus:outline-none focus:bg-white/15
            transition-all text-base"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div>
          <p className="text-white/40 text-sm mb-4">{results.length} results for &quot;{query}&quot;</p>
          <div className="space-y-1">
            {results.map((track, i) => (
              <TrackCard key={i} track={track} queue={results} index={i} variant="list" />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && results.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🎵</p>
          <p className="text-white/60">No results found for &quot;{query}&quot;</p>
          <p className="text-white/30 text-sm mt-2">Try a different keyword</p>
        </div>
      )}

      {/* Initial state */}
      {!searched && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎧</p>
          <p className="text-white/40">Type to search for music</p>
        </div>
      )}
    </div>
  );
}
