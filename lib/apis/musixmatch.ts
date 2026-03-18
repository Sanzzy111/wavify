/**
 * Musixmatch API
 * Docs: https://developer.musixmatch.com/documentation
 * Free tier: 2000 req/hari, lirik hanya 30% dari lagu
 */

const BASE = "https://api.musixmatch.com/ws/1.1";
const KEY = process.env.MUSIXMATCH_API_KEY!;

export interface LyricsResult {
  lyrics: string;
  source: "musixmatch";
  copyright?: string;
}

// Search track ID by title + artist
async function searchTrackId(title: string, artist: string): Promise<number | null> {
  const url = new URL(`${BASE}/track.search`);
  url.searchParams.set("q_track", title);
  url.searchParams.set("q_artist", artist);
  url.searchParams.set("page_size", "1");
  url.searchParams.set("s_track_rating", "desc");
  url.searchParams.set("apikey", KEY);

  const res = await fetch(url.toString());
  const data = await res.json();
  const track = data?.message?.body?.track_list?.[0]?.track;
  return track?.track_id ?? null;
}

// Get lyrics by track ID
async function getLyricsByTrackId(trackId: number): Promise<LyricsResult | null> {
  const url = new URL(`${BASE}/track.lyrics.get`);
  url.searchParams.set("track_id", String(trackId));
  url.searchParams.set("apikey", KEY);

  const res = await fetch(url.toString());
  const data = await res.json();
  const lyricsBody = data?.message?.body?.lyrics;

  if (!lyricsBody?.lyrics_body) return null;

  return {
    lyrics: lyricsBody.lyrics_body,
    source: "musixmatch",
    copyright: lyricsBody.lyrics_copyright,
  };
}

// Main: get lyrics by title + artist
export async function getLyrics(title: string, artist: string): Promise<LyricsResult | null> {
  try {
    const trackId = await searchTrackId(title, artist);
    if (!trackId) return null;
    return await getLyricsByTrackId(trackId);
  } catch {
    return null;
  }
}
