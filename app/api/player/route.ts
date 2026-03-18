import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, artist, cover, preview, deezerUrl, spotifyId, userId } = body;

    if (!title || !artist) {
      return NextResponse.json({ error: "title dan artist wajib diisi" }, { status: 400 });
    }

    const songId = `${title.toLowerCase()}-${artist.toLowerCase()}`
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 50);

    const song = await prisma.song.upsert({
      where: { id: songId },
      update: {
        playCount: { increment: 1 },
        cover: cover || undefined,
        deezerPreview: preview || undefined,
        deezerUrl: deezerUrl || undefined,
        spotifyId: spotifyId || undefined,
      },
      create: {
        id: songId,
        title,
        artist,
        cover,
        deezerPreview: preview,
        deezerUrl,
        spotifyId,
        playCount: 1,
      },
    });

    if (userId) {
      await prisma.playHistory.create({
        data: { userId, songId: song.id },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, playCount: song.playCount });
  } catch (err) {
    console.error("[PLAYER ERROR]", err);
    return NextResponse.json({ error: "Gagal menyimpan data play" }, { status: 500 });
  }
}
