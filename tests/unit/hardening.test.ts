import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironment } from '../../src/lib/env-validator.ts';
import { isProductionStrict, assertProductionWriteAllowed } from '../../src/lib/persistence-policy.ts';
import { acquireIdempotencyKey, commitIdempotencyResult } from '../../src/lib/idempotency.ts';
import { rateLimiter } from '../../src/lib/rate-limiter.ts';

describe('Production Hardening & Reliability Tests', () => {
  test('Environment Validator catches missing production configuration', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalDbUrl = process.env.DATABASE_URL;
    const originalJwt = process.env.JWT_SECRET;

    try {
      (process.env as any).NODE_ENV = 'production';
      delete process.env.DATABASE_URL;
      delete process.env.JWT_SECRET;
      delete process.env.DEMO_MODE;

      const check = validateEnvironment();
      assert.equal(check.isProduction, true);
      assert.equal(check.isValid, false);
      assert.ok(check.missingKeys.includes('DATABASE_URL'));
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
      if (originalDbUrl) process.env.DATABASE_URL = originalDbUrl;
      if (originalJwt) process.env.JWT_SECRET = originalJwt;
    }
  });

  test('Persistence Policy blocks memory fallback writes in strict production when DB unconfigured', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalDemo = process.env.DEMO_MODE;

    try {
      (process.env as any).NODE_ENV = 'production';
      delete process.env.DEMO_MODE;

      assert.equal(isProductionStrict(), true);

      // In production with no active DB, write assertion must fail
      assert.throws(() => {
        assertProductionWriteAllowed('Test write');
      }, /PERSISTENCE ERROR/);
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
      if (originalDemo) process.env.DEMO_MODE = originalDemo;
    }
  });

  test('Idempotency Engine prevents concurrent duplicate requests', async () => {
    const testKey = `test_idem_${Date.now()}_${Math.random()}`;

    // 1st request acquires the lock
    const firstAttempt = await acquireIdempotencyKey(testKey, 'order_checkout');
    assert.equal(firstAttempt.acquired, true);
    assert.equal(firstAttempt.isDuplicate, false);

    // 2nd simultaneous request gets rejected as duplicate in-flight
    const secondAttempt = await acquireIdempotencyKey(testKey, 'order_checkout');
    assert.equal(secondAttempt.acquired, false);
    assert.equal(secondAttempt.isDuplicate, true);
    assert.equal(secondAttempt.inFlight, true);

    // Commit response
    await commitIdempotencyResult(testKey, 200, { orderId: 'ord_123', status: 'SUCCESS' });

    // 3rd subsequent request receives cached response
    const thirdAttempt = await acquireIdempotencyKey(testKey, 'order_checkout');
    assert.equal(thirdAttempt.acquired, false);
    assert.equal(thirdAttempt.isDuplicate, true);
    assert.equal(thirdAttempt.inFlight, false);
    assert.deepEqual(thirdAttempt.cachedResponse, {
      status: 200,
      body: { orderId: 'ord_123', status: 'SUCCESS' },
    });
  });

  test('Concurrent duplicate requests with identical idempotency key allow exactly one acquisition', async () => {
    const testKey = `test_concurrent_${Date.now()}_${Math.random()}`;

    // Send 5 concurrent requests with the identical key simultaneously
    const results = await Promise.all([
      acquireIdempotencyKey(testKey, 'payment_verify'),
      acquireIdempotencyKey(testKey, 'payment_verify'),
      acquireIdempotencyKey(testKey, 'payment_verify'),
      acquireIdempotencyKey(testKey, 'payment_verify'),
      acquireIdempotencyKey(testKey, 'payment_verify'),
    ]);

    const acquiredCount = results.filter((r) => r.acquired === true).length;
    const rejectedCount = results.filter((r) => r.isDuplicate === true).length;

    assert.equal(acquiredCount, 1, 'Only one concurrent request must acquire the lock');
    assert.equal(rejectedCount, 4, 'All subsequent concurrent requests must be flagged as duplicate');
  });

  test('Distributed Rate Limiter enforces sliding window limits', async () => {
    const testId = `user_${Date.now()}`;
    const opts = { limit: 3, windowSeconds: 2, prefix: 'test_rl' };

    const r1 = await rateLimiter.limit(testId, opts);
    assert.equal(r1.allowed, true);
    assert.equal(r1.remaining, 2);

    const r2 = await rateLimiter.limit(testId, opts);
    assert.equal(r2.allowed, true);
    assert.equal(r2.remaining, 1);

    const r3 = await rateLimiter.limit(testId, opts);
    assert.equal(r3.allowed, true);
    assert.equal(r3.remaining, 0);

    const r4 = await rateLimiter.limit(testId, opts);
    assert.equal(r4.allowed, false);
    assert.equal(r4.remaining, 0);
  });
});
