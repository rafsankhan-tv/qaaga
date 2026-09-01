/**
 * QAAGA Super Marketplace — Distributed Rate Limiter Abstraction
 * Supports Upstash Redis / Redis Cloud for distributed serverless environments,
 * with resilient in-memory sliding window fallback for local development.
 */

export interface RateLimiterOptions {
  limit: number;
  windowSeconds: number;
  prefix?: string;
}

export interface RateLimitStatus {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

interface LocalMemoryBucket {
  tokens: number;
  lastRefill: number;
  resetAt: number;
}

const localBuckets = new Map<string, LocalMemoryBucket>();

export class DistributedRateLimiter {
  private redisRestUrl: string | undefined;
  private redisRestToken: string | undefined;

  constructor() {
    this.redisRestUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
    this.redisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;
  }

  public isDistributedActive(): boolean {
    return Boolean(this.redisRestUrl && this.redisRestToken);
  }

  /**
   * Check and consume rate limit tokens
   */
  public async limit(identifier: string, options: RateLimiterOptions): Promise<RateLimitStatus> {
    const prefix = options.prefix || 'rl';
    const key = `${prefix}:${identifier.trim().toLowerCase()}`;
    const windowSeconds = options.windowSeconds || 60;
    const maxRequests = options.limit || 60;

    // 1. Try Upstash / Distributed Redis REST if configured
    if (this.isDistributedActive()) {
      try {
        const url = `${this.redisRestUrl}/pipeline`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.redisRestToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            ['INCR', key],
            ['EXPIRE', key, windowSeconds],
            ['TTL', key],
          ]),
        });

        if (res.ok) {
          const results = (await res.json()) as Array<{ result: number }>;
          const count = results[0]?.result || 1;
          const ttl = results[2]?.result || windowSeconds;

          const allowed = count <= maxRequests;
          return {
            allowed,
            limit: maxRequests,
            remaining: Math.max(0, maxRequests - count),
            resetSeconds: ttl > 0 ? ttl : windowSeconds,
          };
        }
      } catch (err) {
        console.warn('[RATE LIMIT] Distributed Redis unavailable, falling back to local memory bucket:', err);
      }
    }

    // 2. Local In-Memory Sliding Window Bucket (Dev / Standalone fallback)
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    let bucket = localBuckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      bucket = {
        tokens: maxRequests - 1,
        lastRefill: now,
        resetAt: now + windowMs,
      };
      localBuckets.set(key, bucket);
      return {
        allowed: true,
        limit: maxRequests,
        remaining: bucket.tokens,
        resetSeconds: windowSeconds,
      };
    }

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      const resetSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      return {
        allowed: true,
        limit: maxRequests,
        remaining: bucket.tokens,
        resetSeconds,
      };
    }

    const resetSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds,
    };
  }
}

export const rateLimiter = new DistributedRateLimiter();
