import { NextRequest, NextResponse } from 'next/server';
import { serviceRegistry } from '../../../lib/serviceRegistry';
import {
  checkBruteForce,
  safeJsonResponse,
  handleSecureApiError,
} from '@/lib/auth-security';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'ip_cat';
    const rateCheck = checkBruteForce(`cat_get_${ip}`, 120, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return safeJsonResponse(
        { success: false, message: 'Too many requests. Please try again shortly.' },
        { status: 429 }
      );
    }

    const modules = serviceRegistry.getActiveModules();
    const response = safeJsonResponse({
      success: true,
      total: modules.length,
      data: modules,
    });

    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    return response;
  } catch (error: any) {
    return handleSecureApiError(error, 'Fetching marketplace categories');
  }
}
