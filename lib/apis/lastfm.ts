/**
 * Last.fm API
 * Docs: https://www.last.fm/api
 * Rate limit: sangat longgar, tidak ada hard limit
 */

const BASE = "https://ws.audioscrobbler.com/2.0/";
const KEY = process.env.LASTFM_API_KEY!;

export interface LastfmTrack {
  name: string;
  artist: string | { name: string };
  album?: string;
  image?: string;
  url?: string;
  duration?: number;
  playcount?: number;
}

function getImage(images: { "#text": string; size: string }[]): string {
  const order = ["extralarge", "large", "medium", "small"];
  for (const size of order) {
    const img = images?.find((i) => i.size === size);
    if (img?.["#text"]) return img["#text"];
  }
  return "";
}

// Search lagu
export async function lastfmSearch(query: string, limit = 10): Promise<LastfmTrack[]> {
  const url = new URL(BASE);
  url.searchParams.set("method", "track.search");
  url.searchParams.set("track", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("api_key", KEY);
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());
  const data = await res.json();

  const tracks = data?.results?.trackmatches?.track ?? [];
  return tracks.map((t: any) => ({
    name: t.name,
    artist: t.artist,
    image: getImage(t.image ?? []),
    url: t.url,
  }));
}

// Trending chart global
export async function lastfmTopTracksGlobal(limit = 20): Promise<LastfmTrack[]> {
  const url = new URL(BASE);
  url.searchParams.set("method", "chart.gettoptracks");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("api_key", KEY);
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());
  const data = await res.json();

  const tracks = data?.tracks?.track ?? [];
  return tracks.map((t: any) => ({
    name: t.name,
    artist: t.artist?.name ?? t.artist,
    image: getImage(t.image ?? []),
    playcount: Number(t.playcount),
    url: t.url,
  }));
}

// Trending chart by country (pakai country name, e.g. "Indonesia")
export async function lastfmTopTracksByCountry(country: string, limit = 20): Promise<LastfmTrack[]> {
  const url = new URL(BASE);
  url.searchParams.set("method", "geo.gettoptracks");
  url.searchParams.set("country", country);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("api_key", KEY);
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());
  const data = await res.json();

  const tracks = data?.tracks?.track ?? [];
  return tracks.map((t: any) => ({
    name: t.name,
    artist: t.artist?.name ?? t.artist,
    image: getImage(t.image ?? []),
    url: t.url,
  }));
}

// Get detail track (termasuk album, cover, duration)
export async function lastfmGetTrack(artist: string, track: string): Promise<LastfmTrack | null> {
  const url = new URL(BASE);
  url.searchParams.set("method", "track.getInfo");
  url.searchParams.set("artist", artist);
  url.searchParams.set("track", track);
  url.searchParams.set("api_key", KEY);
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());
  const data = await res.json();
  const t = data?.track;
  if (!t) return null;

  return {
    name: t.name,
    artist: t.artist?.name,
    album: t.album?.title,
    image: getImage(t.album?.image ?? []),
    duration: Number(t.duration) || undefined,
    playcount: Number(t.playcount),
    url: t.url,
  };
}
