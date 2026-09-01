import { NextRequest } from 'next/server';
import { PaymentVerifySchema } from '@/lib/validation';
import {
  checkBruteForce,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  handleSecureApiError,
} from '@/lib/auth-security';
import { acquireIdempotencyKey, commitIdempotencyResult, releaseIdempotencyKey } from '@/lib/idempotency';
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

    const idempotencyKey = req.headers.get('idempotency-key') || req.headers.get('x-idempotency-key');
    if (idempotencyKey) {
      const lock = await acquireIdempotencyKey(idempotencyKey, 'PAYMENT_VERIFY');
      if (lock.isDuplicate) {
        if (lock.inFlight) {
          return createApiError('পেমেন্টটি বর্তমানে ভেরিফাই করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।', {
            status: 409,
            code: 'REQUEST_IN_FLIGHT',
          });
        }
        if (lock.cachedResponse) {
          return createApiSuccess(lock.cachedResponse.body, { status: lock.cachedResponse.status });
        }
      }
    }

    const jsonResult = await parseJsonWithLimit(req, 64 * 1024);
    if (!jsonResult.success) {
      if (idempotencyKey) await releaseIdempotencyKey(idempotencyKey);
      return jsonResult.errorResponse!;
    }

    const validationResult = PaymentVerifySchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      if (idempotencyKey) await releaseIdempotencyKey(idempotencyKey);
      const errorMsg = validationResult.error.issues.map((i) => i.message).join(', ');
      return createApiError(errorMsg, { status: 400, code: 'VALIDATION_ERROR' });
    }

    // Business Logic Service
    const result = await paymentService.verifyPayment(validationResult.data);

    if (!result.success) {
      if (idempotencyKey) await releaseIdempotencyKey(idempotencyKey);
      return createApiError(result.message, {
        status: result.statusCode || 400,
        code: result.errorCode,
      });
    }

    if (idempotencyKey && result.success) {
      await commitIdempotencyResult(idempotencyKey, result.statusCode || 200, result.data);
    }

    return createApiSuccess(result.data, {
      message: result.message,
      status: result.statusCode || 200,
    });
  } catch (error: any) {
    const idempotencyKey = req.headers.get('idempotency-key') || req.headers.get('x-idempotency-key');
    if (idempotencyKey) {
      await releaseIdempotencyKey(idempotencyKey);
    }
    return handleSecureApiError(error, 'Payment verification transport layer');
  }
}
