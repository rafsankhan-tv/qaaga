import { NextRequest } from 'next/server';
import { checkBruteForce, handleSecureApiError } from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { catalogService } from '@/services/business/catalog.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_categories';
    const rateCheck = checkBruteForce(`categories_get_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const categories = catalogService.getCategories();
    return createApiSuccess({
      categories,
      total: categories.length,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Categories fetch transport layer');
  }
}

