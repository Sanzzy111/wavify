/**
 * Spotify API — Last Resort
 * Hanya dipanggil kalau semua API lain gagal
 * Docs: https://developer.spotify.com/documentation/web-api
 */

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const BASE = "https://api.spotify.com/v1";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60000, // minus 1 menit buffer
  };

  return cachedToken.token;
}

export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  preview: string | null; // 30s preview
  duration: number;
}

function mapTrack(t: any): SpotifyTrack {
  return {
    id: t.id,
    title: t.name,
    artist: t.artists?.map((a: any) => a.name).join(", ") ?? "",
    album: t.album?.name ?? "",
    cover: t.album?.images?.[0]?.url ?? "",
    preview: t.preview_url,
    duration: Math.round((t.duration_ms ?? 0) / 1000),
  };
}

export async function spotifySearch(query: string, limit = 10): Promise<SpotifyTrack[]> {
  const token = await getAccessToken();
  const url = new URL(`${BASE}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("type", "track");
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  return (data?.tracks?.items ?? []).map(mapTrack);
}
