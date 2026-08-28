import { NextRequest } from 'next/server';
import { ServicesQuerySchema } from '@/lib/validation';
import { checkBruteForce, handleSecureApiError } from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { catalogService } from '@/services/business/catalog.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_services';
    const rateCheck = checkBruteForce(`services_get_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = {
      categoryGroup: searchParams.get('categoryGroup') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const queryResult = ServicesQuerySchema.safeParse(rawQuery);
    if (!queryResult.success) {
      return createApiError('Invalid query parameters', { status: 400 });
    }

    const { categoryGroup, search } = queryResult.data;
    const modules = catalogService.getServiceModules(search, categoryGroup);

    return createApiSuccess({
      services: modules,
      total: modules.length,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Services catalog transport layer');
  }
}

