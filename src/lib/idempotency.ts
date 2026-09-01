/**
 * QAAGA Super Marketplace — Durable Database-Backed Idempotency Engine
 * Guarantees exactly-once execution for orders, payments, and service requests.
 * Uses PostgreSQL UNIQUE constraints with TTL expiration, falling back to in-memory in dev/test.
 */

import { dbService } from '../db/database.ts';
import { isProductionStrict } from './persistence-policy.ts';

export interface IdempotencyRecord {
  key: string;
  userId?: string | null;
  action: string;
  requestFingerprint?: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  responseData?: any;
  createdAt: string;
  expiresAt: string;
}

export interface AcquireIdempotencyResult {
  acquired: boolean;
  isDuplicate: boolean;
  inFlight?: boolean;
  cachedResponse?: {
    status: number;
    body: any;
  };
}

// In-memory fallback cache for dev / test / local environments
const memoryIdempotencyStore = new Map<
  string,
  { status: 'PROCESSING' | 'COMPLETED' | 'FAILED'; response?: { status: number; body: any }; timestamp: number }
>();
const MEMORY_TTL_MS = 60 * 1000; // 1 minute

/**
 * Initializes idempotency table if it does not exist
 */
let isTableChecked = false;
async function ensureIdempotencyTable(): Promise<void> {
  if (isTableChecked || !dbService.isDatabaseConfigured()) return;
  try {
    const ddl = `
      CREATE TABLE IF NOT EXISTS idempotency_keys (
        key VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(100),
        action VARCHAR(100) NOT NULL,
        request_fingerprint VARCHAR(255),
        status VARCHAR(50) DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
        response_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
      );
      CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys(expires_at);
    `;
    await dbService.query(ddl);
    isTableChecked = true;
  } catch (err) {
    console.warn('Idempotency table verification notice:', err);
  }
}

/**
 * Attempt to acquire an idempotency lock for a critical transaction
 */
export async function acquireIdempotencyKey(
  key: string,
  action: string,
  options?: { userId?: string; requestFingerprint?: string }
): Promise<AcquireIdempotencyResult> {
  if (!key || typeof key !== 'string' || !key.trim()) {
    return { acquired: true, isDuplicate: false };
  }

  const cleanKey = key.trim();
  const userId = options?.userId || null;
  const fingerprint = options?.requestFingerprint || null;

  if (dbService.isDatabaseConfigured()) {
    try {
      await ensureIdempotencyTable();

      // 1. Try atomic insert with PROCESSING state
      const insertSql = `
        INSERT INTO idempotency_keys (key, user_id, action, request_fingerprint, status, created_at, expires_at)
        VALUES ($1, $2, $3, $4, 'PROCESSING', NOW(), NOW() + INTERVAL '24 hours')
        ON CONFLICT (key) DO NOTHING
        RETURNING *
      `;
      const insertRes = await dbService.query(insertSql, [cleanKey, userId, action, fingerprint]);

      if (insertRes.rows.length > 0) {
        // Atomic insert succeeded — lock acquired
        return { acquired: true, isDuplicate: false };
      }

      // 2. Conflict occurred: Key already exists. Check existing record.
      const checkSql = `SELECT * FROM idempotency_keys WHERE key = $1 AND expires_at > NOW() LIMIT 1`;
      const existing = await dbService.query(checkSql, [cleanKey]);

      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        if (row.status === 'COMPLETED' && row.response_data) {
          const resp = typeof row.response_data === 'string' ? JSON.parse(row.response_data) : row.response_data;
          return {
            acquired: false,
            isDuplicate: true,
            inFlight: false,
            cachedResponse: resp,
          };
        }
        if (row.status === 'PROCESSING') {
          // Check if stale lock (older than 2 minutes)
          const createdAt = new Date(row.created_at).getTime();
          if (Date.now() - createdAt > 2 * 60 * 1000) {
            // Reclaim stale processing lock
            await dbService.query(
              `UPDATE idempotency_keys SET status = 'PROCESSING', created_at = NOW() WHERE key = $1 AND status = 'PROCESSING'`,
              [cleanKey]
            );
            return { acquired: true, isDuplicate: false };
          }
          return {
            acquired: false,
            isDuplicate: true,
            inFlight: true,
          };
        }
      }
    } catch (err) {
      if (isProductionStrict()) {
        throw new Error(`[IDEMPOTENCY ERROR] Failed to acquire durable idempotency key in production: ${err}`);
      }
      console.warn('PostgreSQL acquireIdempotencyKey fallback to memory:', err);
    }
  }

  // Local in-memory fallback (Dev / Test)
  const now = Date.now();
  const cached = memoryIdempotencyStore.get(cleanKey);
  if (cached && now - cached.timestamp < MEMORY_TTL_MS) {
    if (cached.status === 'COMPLETED' && cached.response) {
      return {
        acquired: false,
        isDuplicate: true,
        inFlight: false,
        cachedResponse: cached.response,
      };
    }
    if (cached.status === 'PROCESSING') {
      if (now - cached.timestamp > 2 * 60 * 1000) {
        // Stale in-memory lock
        memoryIdempotencyStore.set(cleanKey, { status: 'PROCESSING', timestamp: now });
        return { acquired: true, isDuplicate: false };
      }
      return {
        acquired: false,
        isDuplicate: true,
        inFlight: true,
      };
    }
  }

  memoryIdempotencyStore.set(cleanKey, { status: 'PROCESSING', timestamp: now });
  return { acquired: true, isDuplicate: false };
}

/**
 * Marks the idempotency key as completed and stores the result
 */
export async function commitIdempotencyResult(
  key: string | null | undefined,
  statusCode: number,
  responseBody: any
): Promise<void> {
  if (!key || typeof key !== 'string' || !key.trim()) return;
  const cleanKey = key.trim();
  const respData = { status: statusCode, body: responseBody };

  if (dbService.isDatabaseConfigured()) {
    try {
      const updateSql = `
        UPDATE idempotency_keys
        SET status = 'COMPLETED', response_data = $2
        WHERE key = $1
      `;
      await dbService.query(updateSql, [cleanKey, JSON.stringify(respData)]);
    } catch (err) {
      console.warn('PostgreSQL commitIdempotencyResult error:', err);
    }
  }

  memoryIdempotencyStore.set(cleanKey, {
    status: 'COMPLETED',
    response: respData,
    timestamp: Date.now(),
  });
}

/**
 * Releases or fails an idempotency key upon error
 */
export async function releaseIdempotencyKey(key: string | null | undefined): Promise<void> {
  if (!key || typeof key !== 'string' || !key.trim()) return;
  const cleanKey = key.trim();

  if (dbService.isDatabaseConfigured()) {
    try {
      await dbService.query(`DELETE FROM idempotency_keys WHERE key = $1 AND status = 'PROCESSING'`, [cleanKey]);
    } catch (err) {
      console.warn('PostgreSQL releaseIdempotencyKey error:', err);
    }
  }

  memoryIdempotencyStore.delete(cleanKey);
}
