import { NextRequest, NextResponse } from "next/server";
import { searchTracks } from "@/lib/fallback";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: "Query minimal 2 karakter" }, { status: 400 });
  }

  try {
    const results = await searchTracks(query.trim());
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[SEARCH ERROR]", err);
    return NextResponse.json({ error: "Gagal melakukan pencarian" }, { status: 500 });
  }
}
