// =====================================================
// IN-MEMORY CACHE
// Simplified for serverless environments
// =====================================================

interface CacheItem<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number = 5000): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const cache = new MemoryCache();

// Cache key generators
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userBalance: (userId: string) => `user:balance:${userId}`,
  products: () => 'products:all',
};

// TTL presets (in milliseconds)
export const CacheTTL = {
  SHORT: 3000,
  MEDIUM: 10000,
  LONG: 60000,
};
