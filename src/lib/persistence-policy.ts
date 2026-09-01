/**
 * QAAGA Super Marketplace — Persistence Policy & Production Storage Guard
 * Enforces PostgreSQL as the authoritative persistent source of truth in production.
 * In strict production, volatile in-memory fallback writes are strictly forbidden.
 */

import { dbService } from '../db/database.ts';

export function isProductionStrict(): boolean {
  const isProd = process.env.NODE_ENV === 'production';
  const isDemo = process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const isTest = process.env.NODE_ENV === 'test';
  return isProd && !isDemo && !isTest;
}

export function isMemoryFallbackAllowed(): boolean {
  return !isProductionStrict();
}

/**
 * Validates that database writes are allowed.
 * In strict production, throws a 503/database-unavailable error if PostgreSQL is not active.
 */
export function assertProductionWriteAllowed(operationName = 'Database write'): void {
  if (isProductionStrict() && !dbService.isDatabaseConfigured()) {
    throw new Error(
      `[PERSISTENCE ERROR] ${operationName} failed: PostgreSQL connection is unconfigured or unavailable. In production, writes cannot fallback to volatile memory.`
    );
  }
}

/**
 * Handles repository error in accordance with production policy.
 * If in production, re-throws the error to prevent silent data loss.
 * If in dev/test/demo mode, logs a warning and allows local memory fallback.
 */
export function handleRepositoryWriteError(operationName: string, error: unknown): void {
  const errMessage = error instanceof Error ? error.message : String(error);
  if (isProductionStrict()) {
    throw new Error(`[PERSISTENCE ERROR] ${operationName} failed: ${errMessage}`);
  }
  console.warn(`[DEV/DEMO FALLBACK] ${operationName} falling back to memory:`, errMessage);
}
