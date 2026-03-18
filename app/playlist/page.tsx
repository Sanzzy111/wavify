"use client";

import { useState, useEffect } from "react";
import TrackCard from "@/components/TrackCard";
import { Track } from "@/lib/PlayerContext";

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: string;
}

const STORAGE_KEY = "music_playlists";

function loadPlaylists(): Playlist[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch { return []; }
}

function savePlaylists(playlists: Playlist[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
}

export default function PlaylistPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setPlaylists(loadPlaylists());
  }, []);

  const active = playlists.find(p => p.id === activeId);

  const createPlaylist = () => {
    if (!newName.trim()) return;
    const playlist: Playlist = {
      id: Date.now().toString(),
      name: newName.trim(),
      tracks: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [...playlists, playlist];
    setPlaylists(updated);
    savePlaylists(updated);
    setNewName("");
    setCreating(false);
    setActiveId(playlist.id);
  };

  const deletePlaylist = (id: string) => {
    const updated = playlists.filter(p => p.id !== id);
    setPlaylists(updated);
    savePlaylists(updated);
    if (activeId === id) setActiveId(null);
  };

  const removeTrack = (playlistId: string, trackIndex: number) => {
    const updated = playlists.map(p => {
      if (p.id !== playlistId) return p;
      return { ...p, tracks: p.tracks.filter((_, i) => i !== trackIndex) };
    });
    setPlaylists(updated);
    savePlaylists(updated);
  };

  return (
    <div className="min-h-screen pb-32 px-6 pt-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Playlists</h1>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-xl transition-colors"
        >
          + New
        </button>
      </div>

      {/* Create playlist input */}
      {creating && (
        <div className="flex gap-2 mb-6">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") createPlaylist(); if (e.key === "Escape") setCreating(false); }}
            placeholder="Playlist name..."
            className="flex-1 px-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/30 border border-white/10 focus:border-emerald-400/50 focus:outline-none"
          />
          <button onClick={createPlaylist} className="px-4 py-3 bg-emerald-500 text-black font-bold rounded-xl">
            Create
          </button>
          <button onClick={() => setCreating(false)} className="px-4 py-3 bg-white/10 text-white rounded-xl">
            Cancel
          </button>
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🎼</p>
          <p className="text-white/40">No playlists yet</p>
          <p className="text-white/20 text-sm mt-2">Create one to get started</p>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Playlist list */}
          <div className="w-64 flex-shrink-0 space-y-2">
            {playlists.map(p => (
              <div
                key={p.id}
                onClick={() => setActiveId(p.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer group transition-all
                  ${activeId === p.id ? "bg-white/15 border border-white/10" : "hover:bg-white/5"}`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-lg flex-shrink-0">
                  🎵
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.name}</p>
                  <p className="text-white/30 text-xs">{p.tracks.length} tracks</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deletePlaylist(p.id); }}
                  className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Playlist detail */}
          <div className="flex-1">
            {active ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">{active.name}</h2>
                  <p className="text-white/40 text-sm">{active.tracks.length} tracks</p>
                </div>

                {active.tracks.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
                    <p className="text-3xl mb-3">🎵</p>
                    <p className="text-white/30 text-sm">No tracks yet</p>
                    <p className="text-white/20 text-xs mt-1">Search for songs and add them here</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {active.tracks.map((track, i) => (
                      <div key={i} className="flex items-center gap-2 group">
                        <div className="flex-1">
                          <TrackCard track={track} queue={active.tracks} index={i} variant="list" />
                        </div>
                        <button
                          onClick={() => removeTrack(active.id, i)}
                          className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all px-2 text-sm flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="text-white/20">Select a playlist</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
