import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "generated/prisma";
const prisma = new PrismaClient();

// POST /api/player/play — increment play count & simpan history
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, artist, cover, preview, deezerUrl, spotifyId, userId } = body;

    if (!title || !artist) {
      return NextResponse.json({ error: "title dan artist wajib diisi" }, { status: 400 });
    }

    // Upsert song ke DB
    const song = await prisma.song.upsert({
      where: {
        // Pakai kombinasi title + artist sebagai identifier unik
        id: `${title.toLowerCase()}-${artist.toLowerCase()}`.replace(/\s+/g, "-").slice(0, 50),
      },
      update: {
        playCount: { increment: 1 },
        cover: cover || undefined,
        deezerPreview: preview || undefined,
        deezerUrl: deezerUrl || undefined,
        spotifyId: spotifyId || undefined,
      },
      create: {
        id: `${title.toLowerCase()}-${artist.toLowerCase()}`.replace(/\s+/g, "-").slice(0, 50),
        title,
        artist,
        cover,
        deezerPreview: preview,
        deezerUrl,
        spotifyId,
        playCount: 1,
      },
    });

    // Simpan play history kalau user login
    if (userId) {
      await prisma.playHistory.create({
        data: { userId, songId: song.id },
      }).catch(() => {}); // Silent fail kalau user tidak valid
    }

    return NextResponse.json({ success: true, playCount: song.playCount });
  } catch (err) {
    console.error("[PLAYER ERROR]", err);
    return NextResponse.json({ error: "Gagal menyimpan data play" }, { status: 500 });
  }
}
