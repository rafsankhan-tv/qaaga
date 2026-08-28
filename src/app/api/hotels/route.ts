import { NextRequest } from 'next/server';
import { HotelQuerySchema } from '@/lib/validation';
import { checkBruteForce, handleSecureApiError } from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { catalogService } from '@/services/business/catalog.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_hotels';
    const rateCheck = checkBruteForce(`hotels_get_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = {
      location: searchParams.get('location') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const queryResult = HotelQuerySchema.safeParse(rawQuery);
    if (!queryResult.success) {
      return createApiError('Invalid query parameters', { status: 400 });
    }

    const { location, search } = queryResult.data;

    const hotels = catalogService.getHotels({ location, search });
    return createApiSuccess({
      hotels,
      total: hotels.length,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Hotels catalog transport layer');
  }
}

