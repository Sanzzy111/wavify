import { NextRequest, NextResponse } from "next/server";
import { getTrending } from "@/lib/fallback";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "global";

  if (!["global", "indonesia", "internal"].includes(type)) {
    return NextResponse.json({ error: "type harus: global | indonesia | internal" }, { status: 400 });
  }

  try {
    // Internal trending: berdasarkan play count di DB sendiri
    if (type === "internal") {
      const songs = await prisma.song.findMany({
        orderBy: { playCount: "desc" },
        take: 20,
      });
      return NextResponse.json({ results: songs, type: "internal" });
    }

    // Global atau Indonesia dari Last.fm / Deezer
    const results = await getTrending(type as "global" | "indonesia");
    return NextResponse.json({ results, type });
  } catch (err) {
    console.error("[TRENDING ERROR]", err);
    return NextResponse.json({ error: "Gagal mengambil data trending" }, { status: 500 });
  }
}
