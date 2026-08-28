import { NextRequest } from 'next/server';
import { authenticateRequest, checkBruteForce, ROLE_PERMISSIONS, handleSecureApiError } from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { authService } from '@/services/business/auth.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_me';
    const rateCheck = checkBruteForce(`me_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const auth = await authenticateRequest(req);
    if (!auth.authenticated || !auth.user) {
      return createApiError('Unauthorized: Please log in with valid credentials or Bearer token.', {
        status: 401,
        code: 'UNAUTHORIZED',
      });
    }

    const user = await authService.getUserProfile(auth.user.userId);
    if (!user) {
      return createApiError('User session is invalid or user not found', { status: 404 });
    }

    const activeRole = auth.user.activeRole || user.activeRole || 'CUSTOMER';
    const permissions = ROLE_PERMISSIONS[activeRole] || [];

    return createApiSuccess({
      authenticated: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        roles: user.roles,
        activeRole: activeRole,
        avatarUrl: user.avatarUrl,
        district: user.district,
        area: user.area,
        isVerified: user.isVerified,
      },
      permissions,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Fetch session profile');
  }
}
