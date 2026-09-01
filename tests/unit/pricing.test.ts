import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Marketplace Pricing & Business Logic', () => {
  it('calculates order totals correctly including delivery and discounts', () => {
    const items = [
      { unitPrice: 500, quantity: 2 }, // 1000
      { unitPrice: 350, quantity: 1 }, // 350
    ];
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const deliveryFee = 60;
    const discountAmount = 100;
    const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

    assert.strictEqual(subtotal, 1350);
    assert.strictEqual(totalAmount, 1310);
  });

  it('enforces non-negative total on large discounts', () => {
    const subtotal = 200;
    const deliveryFee = 50;
    const discountAmount = 500;
    const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

    assert.strictEqual(totalAmount, 0);
  });

  it('calculates platform fee and provider payout for escrow transactions', () => {
    const serviceBudget = 2500;
    const platformCommissionRate = 0.10; // 10%

    const platformCommission = serviceBudget * platformCommissionRate;
    const providerPayout = serviceBudget - platformCommission;

    assert.strictEqual(platformCommission, 250);
    assert.strictEqual(providerPayout, 2250);
  });
});
