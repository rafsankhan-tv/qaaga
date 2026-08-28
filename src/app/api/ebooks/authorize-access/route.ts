import { NextRequest } from 'next/server';
import { EbookAuthorizeSchema } from '@/lib/validation';
import {
  authenticateRequest,
  checkBruteForce,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  handleSecureApiError,
} from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { ebookService } from '@/services/business/ebook.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOriginAndCSRF(req)) {
      return createApiError('Invalid request origin or CSRF check failed.', { status: 403 });
    }

    const ip = req.headers.get('x-forwarded-for') || 'ip_ebook_auth';
    const rateCheck = checkBruteForce(`ebook_auth_${ip}`, 30, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। কিছুক্ষণ পর চেষ্টা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const auth = await authenticateRequest(req);
    const sessionUserId = auth.authenticated && auth.user ? auth.user.userId : undefined;
    const isSuperAdmin = auth.user?.roles.includes('SUPER_ADMIN') || false;

    const jsonResult = await parseJsonWithLimit(req, 32 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    const validationResult = EbookAuthorizeSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      return createApiError(validationResult.error.issues[0]?.message || 'Invalid parameters', {
        status: 400,
      });
    }

    // Business Logic Service
    const result = await ebookService.authorizeAccess(validationResult.data, sessionUserId, isSuperAdmin);

    if (!result.authorized) {
      return createApiError(result.message || 'Access denied', {
        status: result.statusCode || 403,
      });
    }

    return createApiSuccess({
      authorized: true,
      secureReaderToken: result.secureReaderToken,
      expiresIn: result.expiresIn,
      readerUrl: result.readerUrl,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Ebook authorization transport layer');
  }
}
