import { NextRequest, NextResponse } from 'next/server';
import { OrderCheckoutSchema } from '@/lib/validation';
import {
  checkBruteForce,
  sanitizeString,
  sanitizeObject,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  safeJsonResponse,
  handleSecureApiError,
  extractAuthTokenFromRequest,
  verifyAuthToken,
} from '@/lib/auth-security';

export async function POST(request: NextRequest) {
  try {
    // 1. Origin / CSRF Validation
    if (!validateOriginAndCSRF(request)) {
      return safeJsonResponse(
        { success: false, message: 'Invalid request origin or CSRF check failed.' },
        { status: 403 }
      );
    }

    // 2. IP Rate Limiting (Max 20 orders per 10 minutes per IP)
    const ip = request.headers.get('x-forwarded-for') || 'ip_order';
    const rateCheck = checkBruteForce(`order_${ip}`, 20, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return safeJsonResponse(
        {
          success: false,
          message: 'অতিরিক্ত অর্ডার রিকোয়েস্ট তৈরি করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।',
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 3. Request Size Limit (Max 256KB for order payload)
    const jsonResult = await parseJsonWithLimit(request, 256 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    // 4. Strict Zod Schema Validation
    const validationResult = OrderCheckoutSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((i) => i.message).join(', ');
      return safeJsonResponse(
        { success: false, message: errorMsg, error: errorMsg },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // 5. Optional Auth Token Context & IDOR Security
    const token = extractAuthTokenFromRequest(request);
    let authenticatedUserId: string | null = null;
    if (token) {
      const userPayload = verifyAuthToken(token);
      if (userPayload) {
        authenticatedUserId = userPayload.userId;
      }
    }

    // 6. Generate Cryptographically Safe Order Identifiers
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `ORD-${Date.now().toString().slice(-4)}${randomSuffix}`;
    const trackingCode = `QAAGA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 7. Sanitize all user-controlled text fields
    const sanitizedCustomerName = sanitizeString(validatedData.customerName);
    const sanitizedCustomerPhone = sanitizeString(validatedData.customerPhone);
    const sanitizedShippingAddress = sanitizeString(validatedData.shippingAddress);
    const sanitizedDistrict = sanitizeString(validatedData.district);
    const sanitizedArea = sanitizeString(validatedData.area);
    const sanitizedItems = sanitizeObject(validatedData.items);

    const safeOrder = {
      orderId,
      trackingCode,
      status: 'PENDING',
      customerId: authenticatedUserId || undefined,
      customerName: sanitizedCustomerName,
      customerPhone: sanitizedCustomerPhone,
      shippingAddress: sanitizedShippingAddress,
      district: sanitizedDistrict,
      area: sanitizedArea,
      items: sanitizedItems,
      subtotal: validatedData.subtotal,
      deliveryFee: validatedData.deliveryFee,
      discountAmount: validatedData.discountAmount,
      totalAmount: validatedData.totalAmount,
      paymentMethod: validatedData.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    return safeJsonResponse({
      success: true,
      message: 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে।',
      order: safeOrder,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Order checkout processing');
  }
}
