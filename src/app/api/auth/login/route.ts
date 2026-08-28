import { NextRequest } from 'next/server';
import { UserLoginSchema } from '@/lib/validation';
import {
  setAuthCookie,
  checkBruteForce,
  recordFailedAttempt,
  resetFailedAttempts,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  handleSecureApiError,
  sanitizeString,
} from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { authService } from '@/services/business/auth.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function POST(req: NextRequest) {
  try {
    // 1. CSRF / Origin Validation (permits Mobile & Same-Origin requests)
    if (!validateOriginAndCSRF(req)) {
      return createApiError('Invalid request origin or CSRF check failed.', { status: 403 });
    }

    // 2. Request Size Limit (Max 64KB)
    const jsonResult = await parseJsonWithLimit(req, 64 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    // 3. Zod Input Validation
    const validationResult = UserLoginSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((e) => e.message).join(', ');
      return createApiError(errorMsg, { status: 400, code: 'VALIDATION_ERROR' });
    }

    const { phoneOrEmail } = validationResult.data;
    const cleanIdentifier = sanitizeString(phoneOrEmail).toLowerCase();
    const ip = req.headers.get('x-forwarded-for') || 'ip_login';

    // 4. Rate Limiting Protection (Mobile + Web IP & Account throttler)
    const ipRateCheck = checkBruteForce(`ip_login_${ip}`, 20, 10 * 60 * 1000, 15 * 60 * 1000);
    if (!ipRateCheck.allowed) {
      return createApiError(ipRateCheck.message || 'অতিরিক্ত লগইন চেষ্টা। কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        extraMeta: { retryAfterSeconds: ipRateCheck.retryAfterSeconds },
      });
    }

    const accountRateCheck = checkBruteForce(`acc_${cleanIdentifier}`, 6, 10 * 60 * 1000, 15 * 60 * 1000);
    if (!accountRateCheck.allowed) {
      return createApiError(accountRateCheck.message || 'অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে।', {
        status: 429,
        code: 'ACCOUNT_LOCKED',
        extraMeta: { retryAfterSeconds: accountRateCheck.retryAfterSeconds },
      });
    }

    // 5. Invoke Business Logic Service Layer
    const authResult = await authService.login(validationResult.data);

    if (!authResult.success) {
      const fail = recordFailedAttempt(`acc_${cleanIdentifier}`);
      return createApiError(authResult.message, {
        status: authResult.statusCode || 401,
        code: authResult.errorCode || 'UNAUTHORIZED',
        extraMeta: { remainingAttempts: fail.remainingAttempts },
      });
    }

    // Reset rate limiter on successful authentication
    resetFailedAttempts(`acc_${cleanIdentifier}`);

    // 6. Return standard Multi-Platform Response + Cookie for Web & Token for React Native/Expo
    const response = createApiSuccess(
      {
        user: authResult.user,
        token: authResult.token,
      },
      {
        message: authResult.message,
        status: authResult.statusCode || 200,
      }
    );

    if (authResult.token) {
      setAuthCookie(response, authResult.token);
    }

    return response;
  } catch (error: any) {
    return handleSecureApiError(error, 'User login transport layer');
  }
}
