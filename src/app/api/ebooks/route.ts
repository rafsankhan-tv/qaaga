import { NextRequest } from 'next/server';
import { EbookQuerySchema } from '@/lib/validation';
import { checkBruteForce, handleSecureApiError } from '@/lib/auth-security';
 import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { ebookService } from '@/services/business/ebook.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_ebooks';
    const rateCheck = checkBruteForce(`ebooks_get_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = {
      id: searchParams.get('id') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const queryResult = EbookQuerySchema.safeParse(rawQuery);
    if (!queryResult.success) {
      return createApiError('Invalid query parameters', { status: 400 });
    }

    const { id, category, search } = queryResult.data;

    if (id) {
      const ebook = ebookService.getEbookById(id);
      if (!ebook) {
        return createApiError('বইটি পাওয়া যায়নি।', { status: 404 });
      }
      return createApiSuccess({ ebook });
    }

    const ebooks = ebookService.listEbooks(category, search);
    return createApiSuccess({
      ebooks,
      total: ebooks.length,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Ebooks catalog transport layer');
  }
}

