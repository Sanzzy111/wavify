import { NextRequest, NextResponse } from "next/server";
import { fetchLyrics } from "@/lib/fallback";

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title");
  const artist = req.nextUrl.searchParams.get("artist");

  if (!title || !artist) {
    return NextResponse.json({ error: "Parameter title dan artist wajib diisi" }, { status: 400 });
  }

  try {
    const result = await fetchLyrics(title, artist);

    if (!result) {
      return NextResponse.json({ error: "Lirik tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[LYRICS ERROR]", err);
    return NextResponse.json({ error: "Gagal mengambil lirik" }, { status: 500 });
  }
}
