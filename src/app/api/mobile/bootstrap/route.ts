import { NextRequest } from 'next/server';
import {
  checkBruteForce,
  extractAuthTokenFromRequest,
  verifyAuthToken,
  handleSecureApiError,
} from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { mobileService } from '@/services/business/mobile.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_mobile_boot';
    const rateCheck = checkBruteForce(`mobile_boot_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const token = extractAuthTokenFromRequest(req);
    let userId: string | null = null;

    if (token) {
      const payload = verifyAuthToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    const bootstrapData = await mobileService.getMobileBootstrap(userId);
    return createApiSuccess(bootstrapData);
  } catch (error: any) {
    return handleSecureApiError(error, 'Mobile bootstrap transport layer');
  }
}

