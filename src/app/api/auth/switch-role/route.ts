import { NextRequest } from 'next/server';
import {
  authenticateRequest,
  setAuthCookie,
  checkBruteForce,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  handleSecureApiError,
} from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { RoleSwitchSchema } from '@/lib/validation';
import { authService } from '@/services/business/auth.service';
import { UserRole } from '@/types';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOriginAndCSRF(req)) {
      return createApiError('Invalid request origin or CSRF check failed.', { status: 403 });
    }

    const ip = req.headers.get('x-forwarded-for') || 'ip_switch_role';
    const rateCheck = checkBruteForce(`switch_role_${ip}`, 30, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রোল পরিবর্তনের চেষ্টা। কিছুক্ষণ পর চেষ্টা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const auth = await authenticateRequest(req);
    if (!auth.authenticated || !auth.user) {
      return createApiError('Unauthorized: Session or token required', { status: 401 });
    }

    const jsonResult = await parseJsonWithLimit(req, 16 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    const validationResult = RoleSwitchSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      return createApiError(validationResult.error.issues[0]?.message || 'Invalid role specified.', {
        status: 400,
      });
    }

    const { targetRole } = validationResult.data;
    const result = await authService.switchRole(auth.user, targetRole as UserRole);

    if (!result.success) {
      return createApiError(result.message, {
        status: result.statusCode || 403,
        code: result.errorCode || 'FORBIDDEN',
      });
    }

    const response = createApiSuccess(
      {
        activeRole: targetRole,
        token: result.token,
      },
      {
        message: result.message,
      }
    );

    if (result.token) {
      setAuthCookie(response, result.token);
    }

    return response;
  } catch (error: any) {
    return handleSecureApiError(error, 'Role switch transport layer');
  }
}
