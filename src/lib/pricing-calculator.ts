/**
 * QAAGA Super Marketplace — Pricing & Escrow Calculator
 */

export interface OrderItemPrice {
  price: number;
  quantity: number;
}

export interface OrderCalculationResult {
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
}

export function calculateOrderTotal(
  items: OrderItemPrice[],
  deliveryFee = 60,
  discountAmount = 0
): OrderCalculationResult {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

  return {
    subtotal,
    deliveryFee,
    discountAmount,
    totalAmount,
  };
}

export interface EscrowDistribution {
  totalBudget: number;
  advanceDepositPercentage: number;
  advanceDepositAmount: number;
  remainingPaymentAmount: number;
  platformCommissionPercentage: number;
  platformCommissionAmount: number;
  providerNetEarnings: number;
}

export function calculateEscrowDistribution(
  totalBudget: number,
  advanceDepositPercent = 20,
  commissionPercent = 10
): EscrowDistribution {
  const advanceDepositAmount = Math.round((totalBudget * advanceDepositPercent) / 100);
  const remainingPaymentAmount = Math.max(0, totalBudget - advanceDepositAmount);
  const platformCommissionAmount = Math.round((totalBudget * commissionPercent) / 100);
  const providerNetEarnings = Math.max(0, totalBudget - platformCommissionAmount);

  return {
    totalBudget,
    advanceDepositPercentage: advanceDepositPercent,
    advanceDepositAmount,
    remainingPaymentAmount,
    platformCommissionPercentage: commissionPercent,
    platformCommissionAmount,
    providerNetEarnings,
  };
}
