import { NextRequest } from 'next/server';
import { CalculateFeeSchema } from '@/lib/validation';
import {
  checkBruteForce,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  handleSecureApiError,
} from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOriginAndCSRF(req)) {
      return createApiError('Invalid request origin or CSRF check failed.', { status: 403 });
    }

    const ip = req.headers.get('x-forwarded-for') || 'ip_fee';
    const rateCheck = checkBruteForce(`fee_${ip}`, 60, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const jsonResult = await parseJsonWithLimit(req, 16 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    const validationResult = CalculateFeeSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      return createApiError(validationResult.error.issues[0]?.message || 'ভুল ইনপুট দেওয়া হয়েছে', {
        status: 400,
        code: 'VALIDATION_ERROR',
      });
    }

    const { basePrice, isUrgent } = validationResult.data;
    const price = Number(basePrice) || 0;

    // Default 20% advance booking deposit
    const advanceRate = 0.2;
    const urgentSurcharge = isUrgent ? Math.round(price * 0.15) : 0;
    const totalPrice = price + urgentSurcharge;
    const advanceAmount = Math.round(totalPrice * advanceRate);
    const remainingAmount = totalPrice - advanceAmount;

    // Platform commission breakdown (e.g., 10% platform share)
    const platformCommission = Math.round(totalPrice * 0.1);

    return createApiSuccess({
      totalPrice,
      advanceAmount,
      remainingAmount,
      urgentSurcharge,
      platformCommission,
      currency: 'BDT',
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Calculate fee transport layer');
  }
}

