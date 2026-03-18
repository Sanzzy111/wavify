/**
 * Fallback Chain Logic
 * 
 * Search:   Cache → Last.fm → Deezer → Spotify (last resort)
 * Trending: Cache → Last.fm → Deezer
 * Lyrics:   Cache → Musixmatch
 * 
 * Semua hasil di-cache biar hemat API call
 */

import { cacheGet, cacheSet, TTL } from "./cache";
import { lastfmSearch, lastfmTopTracksGlobal, lastfmTopTracksByCountry } from "./apis/lastfm";
import { deezerSearch, deezerTopTracks } from "./apis/deezer";
import { spotifySearch } from "./apis/spotify";
import { getLyrics } from "./apis/musixmatch";

export interface NormalizedTrack {
  title: string;
  artist: string;
  album?: string;
  cover?: string;
  preview?: string;       // Deezer 30s preview URL
  duration?: number;
  deezerUrl?: string;
  lastfmUrl?: string;
  spotifyId?: string;
  source: string;         // "lastfm" | "deezer" | "spotify"
}

// ─── Normalize ke format yang sama ─────────────────────────────────────────────

function fromLastfm(t: any): NormalizedTrack {
  return {
    title: t.name,
    artist: typeof t.artist === "string" ? t.artist : t.artist?.name,
    cover: t.image,
    lastfmUrl: t.url,
    source: "lastfm",
  };
}

function fromDeezer(t: any): NormalizedTrack {
  return {
    title: t.title,
    artist: t.artist,
    album: t.album,
    cover: t.cover,
    preview: t.preview,
    duration: t.duration,
    deezerUrl: t.link,
    source: "deezer",
  };
}

function fromSpotify(t: any): NormalizedTrack {
  return {
    title: t.title,
    artist: t.artist,
    album: t.album,
    cover: t.cover,
    preview: t.preview,
    duration: t.duration,
    spotifyId: t.id,
    source: "spotify",
  };
}

// ─── Search ────────────────────────────────────────────────────────────────────

export async function searchTracks(query: string): Promise<NormalizedTrack[]> {
  const cacheKey = `search:${query.toLowerCase().trim()}`;

  // 1. Cache
  const cached = await cacheGet<NormalizedTrack[]>(cacheKey);
  if (cached) return cached;

  let results: NormalizedTrack[] = [];

  // 2. Last.fm
  try {
    const tracks = await lastfmSearch(query, 10);
    if (tracks.length > 0) {
      results = tracks.map(fromLastfm);
    }
  } catch {}

  // 3. Deezer (enrich atau fallback)
  try {
    const tracks = await deezerSearch(query, 10);
    if (tracks.length > 0) {
      if (results.length === 0) {
        results = tracks.map(fromDeezer);
      } else {
        // Enrich Last.fm results dengan Deezer data (cover + preview)
        results = results.map((r, i) => ({
          ...r,
          cover: r.cover || tracks[i]?.cover,
          preview: tracks[i]?.preview,
          deezerUrl: tracks[i]?.deezerUrl,
          duration: r.duration || tracks[i]?.duration,
        }));
      }
    }
  } catch {}

  // 4. Spotify (last resort)
  if (results.length === 0) {
    try {
      const tracks = await spotifySearch(query, 10);
      results = tracks.map(fromSpotify);
    } catch {}
  }

  if (results.length > 0) {
    await cacheSet(cacheKey, results, TTL.SEARCH);
  }

  return results;
}

// ─── Trending ──────────────────────────────────────────────────────────────────

export async function getTrending(type: "global" | "indonesia"): Promise<NormalizedTrack[]> {
  const cacheKey = `trending:${type}`;

  const cached = await cacheGet<NormalizedTrack[]>(cacheKey);
  if (cached) return cached;

  let results: NormalizedTrack[] = [];

  try {
    const tracks =
      type === "indonesia"
        ? await lastfmTopTracksByCountry("Indonesia", 20)
        : await lastfmTopTracksGlobal(20);

    results = tracks.map(fromLastfm);
  } catch {}

  // Enrich dengan Deezer untuk cover + preview
  if (results.length > 0) {
    try {
      const enriched = await Promise.allSettled(
        results.slice(0, 20).map(async (track) => {
          const deezerResults = await deezerSearch(`${track.title} ${track.artist}`, 1);
          if (deezerResults[0]) {
            return {
              ...track,
              cover: track.cover || deezerResults[0].cover,
              preview: deezerResults[0].preview,
              deezerUrl: deezerResults[0].deezerUrl,
            };
          }
          return track;
        })
      );

      results = enriched.map((r) => (r.status === "fulfilled" ? r.value : results[0]));
    } catch {}
  }

  // Fallback ke Deezer chart kalau Last.fm gagal
  if (results.length === 0 && type === "global") {
    try {
      const tracks = await deezerTopTracks(20);
      results = tracks.map(fromDeezer);
    } catch {}
  }

  if (results.length > 0) {
    await cacheSet(cacheKey, results, TTL.TRENDING);
  }

  return results;
}

// ─── Lyrics ────────────────────────────────────────────────────────────────────

export async function fetchLyrics(title: string, artist: string) {
  const cacheKey = `lyrics:${title.toLowerCase()}:${artist.toLowerCase()}`;

  const cached = await cacheGet<{ lyrics: string; copyright?: string }>(cacheKey);
  if (cached) return cached;

  const result = await getLyrics(title, artist);
  if (result) {
    await cacheSet(cacheKey, result, TTL.LYRICS);
    return result;
  }

  return null;
}
