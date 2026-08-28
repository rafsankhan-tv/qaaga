import { NextRequest } from 'next/server';
import { PaymentVerifySchema } from '@/lib/validation';
import {
  checkBruteForce,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  handleSecureApiError,
} from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { paymentService } from '@/services/business/payment.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOriginAndCSRF(req)) {
      return createApiError('Invalid request origin or CSRF check failed.', { status: 403 });
    }

    const ip = req.headers.get('x-forwarded-for') || 'ip_pay';
    const rateCheck = checkBruteForce(`pay_${ip}`, 30, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত পেমেন্ট রিকোয়েস্ট তৈরি হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const jsonResult = await parseJsonWithLimit(req, 64 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    const validationResult = PaymentVerifySchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((i) => i.message).join(', ');
      return createApiError(errorMsg, { status: 400, code: 'VALIDATION_ERROR' });
    }

    // Business Logic Service
    const result = await paymentService.verifyPayment(validationResult.data);

    if (!result.success) {
      return createApiError(result.message, {
        status: result.statusCode || 400,
        code: result.errorCode,
      });
    }

    return createApiSuccess(result.data, {
      message: result.message,
      status: result.statusCode || 200,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Payment verification transport layer');
  }
}
