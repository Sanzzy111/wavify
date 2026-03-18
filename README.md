# 🎵 Spotify Clone — Backend Setup

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Supabase
- **Cache**: Upstash Redis → PostgreSQL fallback
- **APIs**: Last.fm → Deezer → Spotify (fallback chain)
- **Lirik**: Musixmatch
- **Deploy**: Vercel

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npx create-next-app@latest spotify-clone --typescript --tailwind --app
cd spotify-clone
npm install prisma @prisma/client
npm install next-auth
```

### 2. Copy file-file ini ke project kamu
```
prisma/schema.prisma
lib/cache.ts
lib/fallback.ts
lib/apis/lastfm.ts
lib/apis/deezer.ts
lib/apis/spotify.ts
lib/apis/musixmatch.ts
app/api/search/route.ts
app/api/trending/route.ts
app/api/lyrics/route.ts
app/api/player/route.ts
```

### 3. Setup environment variables
```bash
cp .env.example .env.local
# Isi semua value di .env.local
```

### 4. Setup Database
```bash
npx prisma generate
npx prisma db push
```

### 5. Jalankan
```bash
npm run dev
```

---

## 📡 API Endpoints

### Search
```
GET /api/search?q=hitung+mundur
```

### Trending
```
GET /api/trending?type=global
GET /api/trending?type=indonesia
GET /api/trending?type=internal   ← berdasarkan play count di DB kamu
```

### Lirik
```
GET /api/lyrics?title=Hitung+Mundur&artist=Kunto+Aji
```

### Play tracking
```
POST /api/player
Body: { title, artist, cover, preview, deezerUrl, spotifyId, userId? }
```

---

## 🔄 Fallback Chain

```
Search:   Cache → Last.fm → Deezer → Spotify
Trending: Cache → Last.fm (by country) → Deezer chart
Lirik:    Cache → Musixmatch
```

---

## 📦 API Keys yang Dibutuhkan

| API | Wajib? | Daftar di |
|-----|--------|-----------|
| Last.fm | ✅ Ya | last.fm/api |
| Musixmatch | ✅ Ya | developer.musixmatch.com |
| Supabase | ✅ Ya | supabase.com |
| Upstash | ✅ Ya | console.upstash.com |
| Spotify | ⚠️ Opsional | developer.spotify.com |
| Deezer | ❌ Tidak perlu | — |

---

## 💡 Tips

- **Deezer tidak perlu API key** — langsung bisa dipakai
- **Cache TTL**: search 1 jam, trending 6 jam, lirik 1 tahun
- Kalau Upstash limit habis, cache otomatis fallback ke PostgreSQL
- Trending "internal" makin akurat seiring bertambahnya user
