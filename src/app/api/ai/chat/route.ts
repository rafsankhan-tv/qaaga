import { NextRequest } from 'next/server';
import { AIChatGenericSchema } from '@/lib/validation';
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

    const ip = req.headers.get('x-forwarded-for') || 'ip_ai';
    const rateCheck = checkBruteForce(`ai_${ip}`, 30, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত মেসেজ পাঠানো হয়েছে। কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const jsonResult = await parseJsonWithLimit(req, 128 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    const validationResult = AIChatGenericSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      return createApiError(validationResult.error.issues[0]?.message || 'Invalid chat parameters', {
        status: 400,
      });
    }

    const result = await aiService.processGenericChat(validationResult.data);
    return createApiSuccess(result);
  } catch (error: any) {
    return handleSecureApiError(error, 'Generic AI chat transport layer');
  }
}
