/**
 * Cache Interface & Types for QAAGA Platform
 * Modular caching contract supporting In-Memory and Redis backends.
 */

export interface CacheOptions {
  ttlSeconds?: number;
  tags?: string[];
}

export interface ICacheStore {
  readonly provider: 'memory' | 'redis';
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions | number): Promise<void>;
  del(key: string): Promise<boolean>;
  delPattern(pattern: string): Promise<number>;
  has(key: string): Promise<boolean>;
  flush(): Promise<void>;
  getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions | number
  ): Promise<T>;
}
