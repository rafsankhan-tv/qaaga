import { NextRequest } from 'next/server';
import { AICatChatSchema } from '@/lib/validation';
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

    const ip = req.headers.get('x-forwarded-for') || 'ip_cat';
    const rateCheck = checkBruteForce(`cat_${ip}`, 40, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('মিউ! 🐾 একটু ধীরে মেসেজ দিন, আমি রেডি হচ্ছি!', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const jsonResult = await parseJsonWithLimit(req, 128 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    const validationResult = AICatChatSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      return createApiError(validationResult.error.issues[0]?.message || 'Invalid chat parameters', {
        status: 400,
      });
    }

    const result = await aiService.processCatChat(validationResult.data);
    return createApiSuccess(result);
  } catch (error: any) {
    return handleSecureApiError(error, 'AI Cat chat transport layer');
  }
}
