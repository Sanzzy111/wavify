/**
 * Deezer API
 * Docs: https://developers.deezer.com/api
 * Rate limit: 50 req/5 detik — lebih longgar dari Spotify
 * Tidak perlu API key untuk endpoint publik!
 */

const BASE = "https://api.deezer.com";

export interface DeezerTrack {
  id: number;
  title: string;
  artist: string;
  album: string;
  cover: string;
  preview: string; // 30s preview URL
  duration: number;
  link: string;
}

function mapTrack(t: any): DeezerTrack {
  return {
    id: t.id,
    title: t.title,
    artist: t.artist?.name ?? "",
    album: t.album?.title ?? "",
    cover: t.album?.cover_xl ?? t.album?.cover_big ?? t.album?.cover ?? "",
    preview: t.preview ?? "",
    duration: t.duration ?? 0,
    link: t.link ?? "",
  };
}

// Search lagu
export async function deezerSearch(query: string, limit = 10): Promise<DeezerTrack[]> {
  const url = `${BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data?.data ?? []).map(mapTrack);
}

// Get track by ID
export async function deezerGetTrack(id: number): Promise<DeezerTrack | null> {
  const res = await fetch(`${BASE}/track/${id}`);
  const data = await res.json();
  if (data?.error) return null;
  return mapTrack(data);
}

// Trending chart global (Deezer editorial chart)
export async function deezerTopTracks(limit = 20): Promise<DeezerTrack[]> {
  const res = await fetch(`${BASE}/chart/0/tracks?limit=${limit}`);
  const data = await res.json();
  return (data?.data ?? []).map(mapTrack);
}

// Trending by genre (e.g. genre_id 132 = Pop Indonesia)
export async function deezerTopByGenre(genreId: number, limit = 20): Promise<DeezerTrack[]> {
  const res = await fetch(`${BASE}/chart/${genreId}/tracks?limit=${limit}`);
  const data = await res.json();
  return (data?.data ?? []).map(mapTrack);
}
