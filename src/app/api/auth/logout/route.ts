import { NextRequest } from 'next/server';
import { clearAuthCookie, validateOriginAndCSRF } from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function POST(req: NextRequest) {
  if (!validateOriginAndCSRF(req)) {
    return createApiError('Invalid request origin or CSRF check failed.', { status: 403 });
  }

  const response = createApiSuccess(
    { loggedOut: true },
    { message: 'সফলভাবে লগআউট করা হয়েছে।' }
  );

  clearAuthCookie(response);
  return response;
}
