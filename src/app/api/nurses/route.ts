import { NextRequest } from 'next/server';
import { NurseQuerySchema } from '@/lib/validation';
import { checkBruteForce, handleSecureApiError } from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { catalogService } from '@/services/business/catalog.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_nurses';
    const rateCheck = checkBruteForce(`nurses_get_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = {
      area: searchParams.get('area') || undefined,
      shiftType: searchParams.get('shiftType') || undefined,
    };

    const queryResult = NurseQuerySchema.safeParse(rawQuery);
    if (!queryResult.success) {
      return createApiError('Invalid query parameters', { status: 400 });
    }

    const { area, shiftType } = queryResult.data;

    const nurses = catalogService.getNurses({ area, shiftType });
    return createApiSuccess({
      nurses,
      total: nurses.length,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Nurses catalog transport layer');
  }
}

