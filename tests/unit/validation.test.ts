import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  UserRegisterSchema,
  UserLoginSchema,
  ServiceRequestSchema,
  OrderCheckoutSchema,
  PaymentVerifySchema,
} from '../../src/lib/validation.ts';

describe('Validation Schemas (Zod)', () => {
  it('validates correct registration payload', () => {
    const validData = {
      phone: '01712345678',
      password: 'password123',
      fullName: 'হাসান আহমেদ',
      role: 'CUSTOMER' as const,
      district: 'ঢাকা',
    };
    const result = UserRegisterSchema.safeParse(validData);
    assert.strictEqual(result.success, true);
  });

  it('rejects invalid Bangladeshi phone number format', () => {
    const invalidData = {
      phone: '12345',
      password: 'password123',
      fullName: 'হাসান আহমেদ',
    };
    const result = UserRegisterSchema.safeParse(invalidData);
    assert.strictEqual(result.success, false);
  });

  it('validates correct login payload with phone or email', () => {
    const validLogin = {
      phoneOrEmail: '01812345678',
      password: 'mypassword',
    };
    const result = UserLoginSchema.safeParse(validLogin);
    assert.strictEqual(result.success, true);
  });

  it('validates correct service request creation', () => {
    const validServiceReq = {
      categoryId: 'cat_electrician',
      title: 'ফ্যান ও লাইট ওয়্যারিং',
      description: 'আমার নতুন ফ্ল্যাটে ৩টি সিলিং ফ্যান ও ১০টি এলইডি লাইট বসাতে হবে।',
      customerName: 'করিম উল্লাহ',
      customerPhone: '01711223344',
      district: 'ঢাকা',
      area: 'মিরপুর ১০',
      address: 'হাউজ ১২, রোড ৫, মিরপুর ১০',
      budget: 1500,
      isUrgent: false,
    };
    const result = ServiceRequestSchema.safeParse(validServiceReq);
    assert.strictEqual(result.success, true);
  });

  it('validates product order checkout schema', () => {
    const validOrder = {
      customerName: 'তানভীর রহমান',
      customerPhone: '01912345678',
      shippingAddress: 'হাউজ ৪২, রোড ৭, সেক্টর ৪, উত্তরা',
      district: 'ঢাকা',
      area: 'উত্তরা',
      paymentMethod: 'COD' as const,
      items: [
        {
          productId: 'prod_1',
          productTitle: 'সিলিং ফ্যান ৫৬ ইঞ্চি',
          quantity: 2,
          price: 3200,
        },
      ],
      subtotal: 6400,
      deliveryFee: 60,
      discountAmount: 0,
      totalAmount: 6460,
    };
    const result = OrderCheckoutSchema.safeParse(validOrder);
    assert.strictEqual(result.success, true);
  });

  it('validates payment verification payload', () => {
    const validPayment = {
      orderId: 'ORD-123456',
      transactionId: 'TXN987654321',
      senderPhone: '01899887766',
      method: 'bKash' as const,
      amount: 6460,
    };
    const result = PaymentVerifySchema.safeParse(validPayment);
    assert.strictEqual(result.success, true);
  });
});

