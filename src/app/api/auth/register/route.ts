import { NextRequest } from 'next/server';
import { UserRegisterSchema } from '@/lib/validation';
import {
  setAuthCookie,
  checkBruteForce,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  handleSecureApiError,
} from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { authService } from '@/services/business/auth.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function POST(req: NextRequest) {
  try {
    // 1. Origin & CSRF Validation (Mobile friendly)
    if (!validateOriginAndCSRF(req)) {
      return createApiError('Invalid request origin or CSRF check failed.', { status: 403 });
    }

    // 2. Request Size Limit (Max 64KB)
    const jsonResult = await parseJsonWithLimit(req, 64 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    // 3. Schema Validation
    const validationResult = UserRegisterSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((e) => e.message).join(', ');
      return createApiError(errorMsg, { status: 400, code: 'VALIDATION_ERROR' });
    }

    const { phone } = validationResult.data;
    const ip = req.headers.get('x-forwarded-for') || 'ip_reg';

    // 4. Rate Limiting Protection
    const ipRateCheck = checkBruteForce(`ip_reg_${ip}`, 10, 15 * 60 * 1000, 30 * 60 * 1000);
    if (!ipRateCheck.allowed) {
      return createApiError(ipRateCheck.message || 'অতিরিক্ত রেজিস্ট্রেশন রিকোয়েস্ট। কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    const phoneRateCheck = checkBruteForce(`reg_phone_${phone}`, 5, 15 * 60 * 1000, 30 * 60 * 1000);
    if (!phoneRateCheck.allowed) {
      return createApiError(phoneRateCheck.message || 'এই নম্বর দিয়ে অতিরিক্ত রেজিস্ট্রেশন চেষ্টা করা হয়েছে।', {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    // 5. Invoke Business Logic Service Layer
    const authResult = await authService.register(validationResult.data);

    if (!authResult.success) {
      return createApiError(authResult.message, {
        status: authResult.statusCode || 400,
        code: authResult.errorCode || 'REGISTRATION_FAILED',
      });
    }

    // 6. Return response with Token for React Native/Expo & Cookie for Web
    const response = createApiSuccess(
      {
        user: authResult.user,
        token: authResult.token,
      },
      {
        message: authResult.message,
        status: authResult.statusCode || 201,
      }
    );

    if (authResult.token) {
      setAuthCookie(response, authResult.token);
    }

    return response;
  } catch (error: any) {
    return handleSecureApiError(error, 'User registration transport layer');
  }
}
