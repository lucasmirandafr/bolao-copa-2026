type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cacheStore = new Map<string, CacheEntry<unknown>>();

export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const entry = cacheStore.get(key) as CacheEntry<T> | undefined;

  if (entry && entry.expiresAt > now) {
    return entry.value;
  }

  const value = await loader();
  cacheStore.set(key, {
    value,
    expiresAt: now + ttlSeconds * 1000,
  });
  return value;
}

export function invalidateCache(key: string) {
  cacheStore.delete(key);
}

export function invalidateCachePrefix(prefix: string) {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
}
