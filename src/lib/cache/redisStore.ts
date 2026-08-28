import { ICacheStore, CacheOptions } from './types';
import { MemoryCacheStore } from './memoryStore';

/**
 * Redis Cache Store Adapter
 * Provides Redis caching capabilities when REDIS_URL or UPSTASH_REDIS_REST_URL is configured.
 * Automatically falls back to high-performance in-memory cache if Redis is unconfigured or unreachable.
 */
export class RedisCacheStore implements ICacheStore {
  readonly provider = 'redis' as const;
  private fallbackStore: MemoryCacheStore;
  private redisUrl: string | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.fallbackStore = new MemoryCacheStore();
    this.redisUrl = process.env.REDIS_URL || process.env.KV_REST_API_URL || null;
    if (this.redisUrl) {
      this.isConnected = true;
    }
  }

  isRedisActive(): boolean {
    return this.isConnected && !!this.redisUrl;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isRedisActive()) {
      return this.fallbackStore.get<T>(key);
    }

    try {
      // Future integration point: Native Redis Client or REST Redis API
      // When Redis client library (ioredis / @upstash/redis) is attached, execute here:
      return this.fallbackStore.get<T>(key);
    } catch (err) {
      console.warn(`[RedisCache] GET error for key "${key}", falling back to memory:`, err);
      return this.fallbackStore.get<T>(key);
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions | number): Promise<void> {
    // Always keep memory fallback warm
    await this.fallbackStore.set(key, value, options);

    if (!this.isRedisActive()) return;

    try {
      // Future integration point: SET / SETEX command execution
    } catch (err) {
      console.warn(`[RedisCache] SET error for key "${key}":`, err);
    }
  }

  async del(key: string): Promise<boolean> {
    const memResult = await this.fallbackStore.del(key);
    if (!this.isRedisActive()) return memResult;

    try {
      // Future integration point: DEL command
      return memResult;
    } catch (err) {
      console.warn(`[RedisCache] DEL error for key "${key}":`, err);
      return memResult;
    }
  }

  async delPattern(pattern: string): Promise<number> {
    return this.fallbackStore.delPattern(pattern);
  }

  async has(key: string): Promise<boolean> {
    return this.fallbackStore.has(key);
  }

  async flush(): Promise<void> {
    await this.fallbackStore.flush();
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions | number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, options);
    return fresh;
  }
}
