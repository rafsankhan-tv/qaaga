import { NextRequest } from 'next/server';
import { SuchiChatSchema } from '@/lib/validation';
import {
  checkBruteForce,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  handleSecureApiError,
} from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { aiService } from '@/services/business/ai.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOriginAndCSRF(req)) {
      return createApiError('Invalid request origin or CSRF check failed.', { status: 403 });
    }

    const ip = req.headers.get('x-forwarded-for') || 'ip_suchi';
    const rateCheck = checkBruteForce(`suchi_${ip}`, 30, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত বার্তা পাঠানো হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    // Support image payload up to 4MB
    const jsonResult = await parseJsonWithLimit(req, 4 * 1024 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    const validationResult = SuchiChatSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      return createApiError(validationResult.error.issues[0]?.message || 'Invalid chat parameters', {
        status: 400,
      });
    }

    const result = await aiService.processSuchiChat(validationResult.data);
    return createApiSuccess(result);
  } catch (error: any) {
    return handleSecureApiError(error, 'Suchi AI chat transport layer');
  }
}
