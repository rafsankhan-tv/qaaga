import { ICacheStore, CacheOptions } from './types';
import { MemoryCacheStore } from './memoryStore';
import { RedisCacheStore } from './redisStore';

/**
 * QAAGA Cache Manager Singleton
 * Automatically selects Redis when configured in environment, otherwise uses in-memory store.
 */
class CacheManager {
  private store: ICacheStore;

  constructor() {
    if (process.env.REDIS_URL || process.env.KV_REST_API_URL) {
      this.store = new RedisCacheStore();
    } else {
      this.store = new MemoryCacheStore();
    }
  }

  get provider(): string {
    return this.store.provider;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.store.get<T>(key);
  }

  async set<T>(key: string, value: T, options?: CacheOptions | number): Promise<void> {
    return this.store.set<T>(key, value, options);
  }

  async del(key: string): Promise<boolean> {
    return this.store.del(key);
  }

  async delPattern(pattern: string): Promise<number> {
    return this.store.delPattern(pattern);
  }

  async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions | number
  ): Promise<T> {
    return this.store.getOrSet<T>(key, fetcher, options);
  }

  /**
   * Helper to invalidate specific catalog/product/service caches
   */
  async invalidateCategory(category: string): Promise<void> {
    await this.delPattern(`catalog:${category}:*`);
    await this.delPattern(`services:${category}:*`);
  }
}

export const cache = new CacheManager();
export * from './types';
export { MemoryCacheStore } from './memoryStore';
export { RedisCacheStore } from './redisStore';
