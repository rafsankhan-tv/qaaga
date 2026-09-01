import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  checkBruteForce,
  recordFailedAttempt,
  checkIdempotencyKey,
  saveIdempotencyResult,
  sanitizeString,
  sanitizeObject,
  signAuthToken,
  verifyAuthToken,
} from '../../src/lib/auth-security.ts';

describe('Security & Auth Utilities', () => {
  it('sanitizes malicious script tags from strings', () => {
    const malicious = '<script>alert("hack")</script>Hello <b>World</b>';
    const cleaned = sanitizeString(malicious);
    assert.strictEqual(cleaned.includes('<script>'), false);
    assert.strictEqual(cleaned.includes('</script>'), false);
    assert.strictEqual(cleaned, 'Hello World');
  });

  it('sanitizes nested object values recursively', () => {
    const dirtyObj = {
      name: '<script>evil()</script>Rahim',
      details: {
        address: 'Dhaka <img src="x" onerror="alert(1)"> City',
      },
    };
    const cleanObj = sanitizeObject(dirtyObj);
    assert.strictEqual(cleanObj.name, 'Rahim');
    assert.strictEqual(cleanObj.details.address.includes('<img'), false);
  });

  it('handles rate-limiting and blocks after threshold', () => {
    const testKey = `test_rate_${Date.now()}`;
    const limit = 3;
    const lockoutMs = 10000;

    // 1st failed attempt
    const r1 = recordFailedAttempt(testKey, limit, lockoutMs);
    assert.strictEqual(r1.allowed, true);

    // 2nd failed attempt
    const r2 = recordFailedAttempt(testKey, limit, lockoutMs);
    assert.strictEqual(r2.allowed, true);

    // 3rd failed attempt (reaches limit 3 -> locks)
    const r3 = recordFailedAttempt(testKey, limit, lockoutMs);
    assert.strictEqual(r3.allowed, false);
    assert.ok(r3.retryAfterSeconds! > 0);

    // Subsequent passive check is blocked
    const check = checkBruteForce(testKey, limit);
    assert.strictEqual(check.allowed, false);
  });

  it('manages idempotency keys and prevents double submission', () => {
    const key = `idem_${Date.now()}_abc`;

    // First check should not be duplicate
    const check1 = checkIdempotencyKey(key);
    assert.strictEqual(check1.isDuplicate, false);

    // Save successful result
    saveIdempotencyResult(key, 201, { orderId: 'ORD-999' });

    // Second check should detect duplicate and return cached body
    const check2 = checkIdempotencyKey(key);
    assert.strictEqual(check2.isDuplicate, true);
    assert.strictEqual(check2.cachedResponse?.status, 201);
    assert.strictEqual(check2.cachedResponse?.body.orderId, 'ORD-999');
  });

  it('generates and verifies JWT auth tokens properly', () => {
    const userPayload = {
      userId: 'user_12345',
      fullName: 'Customer Test',
      roles: ['CUSTOMER' as const],
      activeRole: 'CUSTOMER' as const,
      phone: '01700000000',
    };

    const token = signAuthToken(userPayload);
    assert.ok(token && typeof token === 'string');

    const decoded = verifyAuthToken(token);
    assert.ok(decoded);
    assert.strictEqual(decoded.userId, 'user_12345');
    assert.strictEqual(decoded.phone, '01700000000');
  });
});
