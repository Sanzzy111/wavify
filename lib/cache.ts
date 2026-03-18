import { prisma } from "@/lib/prisma";

export const TTL = {
  SEARCH: 60 * 60,
  TRENDING: 60 * 60 * 6,
  METADATA: 60 * 60 * 24 * 7,
  COVER: 60 * 60 * 24 * 30,
  LYRICS: 60 * 60 * 24 * 365,
};

async function redisGet(key: string): Promise<string | null> {
  try {
    const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    });
    const data = await res.json();
    return data.result ?? null;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: string, ttl: number): Promise<boolean> {
  try {
    await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value, ex: ttl }),
    });
    return true;
  } catch {
    return false;
  }
}

async function dbGet(key: string): Promise<string | null> {
  try {
    const cache = await prisma.cache.findUnique({ where: { key } });
    if (!cache) return null;
    if (cache.expiredAt < new Date()) {
      await prisma.cache.delete({ where: { key } }).catch(() => {});
      return null;
    }
    return cache.value;
  } catch {
    return null;
  }
}

async function dbSet(key: string, value: string, ttl: number): Promise<void> {
  try {
    const expiredAt = new Date(Date.now() + ttl * 1000);
    await prisma.cache.upsert({
      where: { key },
      update: { value, expiredAt },
      create: { key, value, expiredAt },
    });
  } catch {}
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redisVal = await redisGet(key);
  if (redisVal) {
    try { return JSON.parse(redisVal) as T; } catch {}
  }
  const dbVal = await dbGet(key);
  if (dbVal) {
    try { return JSON.parse(dbVal) as T; } catch {}
  }
  return null;
}

export async function cacheSet(key: string, value: unknown, ttl: number): Promise<void> {
  const serialized = JSON.stringify(value);
  const redisOk = await redisSet(key, serialized, ttl);
  if (!redisOk) {
    await dbSet(key, serialized, ttl);
  }
}

export async function cleanExpiredCache(): Promise<void> {
  await prisma.cache.deleteMany({ where: { expiredAt: { lt: new Date() } } });
}
