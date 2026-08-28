import { ICacheStore, CacheOptions } from './types';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null; // unix timestamp ms
  tags: string[];
}

/**
 * Clean In-Memory Cache Store with TTL & Tag invalidation
 * Zero external dependencies, safe for immediate use in Node.js server runtimes.
 */
export class MemoryCacheStore implements ICacheStore {
  readonly provider = 'memory' as const;
  private store = new Map<string, CacheEntry<any>>();
  private tagIndex = new Map<string, Set<string>>();

  private isExpired(entry: CacheEntry<any>): boolean {
    if (entry.expiresAt === null) return false;
    return Date.now() > entry.expiresAt;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (this.isExpired(entry)) {
      await this.del(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, options?: CacheOptions | number): Promise<void> {
    const ttlSeconds = typeof options === 'number' ? options : options?.ttlSeconds;
    const tags = typeof options === 'object' && Array.isArray(options?.tags) ? options.tags : [];

    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;

    // Clean existing tags
    const old = this.store.get(key);
    if (old?.tags) {
      for (const t of old.tags) {
        this.tagIndex.get(t)?.delete(key);
      }
    }

    this.store.set(key, { value, expiresAt, tags });

    // Index new tags
    for (const t of tags) {
      if (!this.tagIndex.has(t)) {
        this.tagIndex.set(t, new Set());
      }
      this.tagIndex.get(t)?.add(key);
    }
  }

  async del(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (entry?.tags) {
      for (const t of entry.tags) {
        this.tagIndex.get(t)?.delete(key);
      }
    }
    return this.store.delete(key);
  }

  async delPattern(pattern: string): Promise<number> {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    let deletedCount = 0;

    for (const key of Array.from(this.store.keys())) {
      if (regex.test(key)) {
        await this.del(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async delByTag(tag: string): Promise<number> {
    const keys = this.tagIndex.get(tag);
    if (!keys || keys.size === 0) return 0;

    let count = 0;
    for (const key of Array.from(keys)) {
      if (await this.del(key)) count++;
    }
    this.tagIndex.delete(tag);
    return count;
  }

  async has(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }

  async flush(): Promise<void> {
    this.store.clear();
    this.tagIndex.clear();
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions | number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    await this.set(key, fresh, options);
    return fresh;
  }

  size(): number {
    return this.store.size;
  }
}
