import { NextRequest, NextResponse } from 'next/server';
import { serviceRegistry } from '../../../lib/serviceRegistry';
import {
  checkBruteForce,
  sanitizeString,
  safeJsonResponse,
  handleSecureApiError,
} from '@/lib/auth-security';
import { ServicesQuerySchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'ip_svc';
    const rateCheck = checkBruteForce(`svc_get_${ip}`, 100, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return safeJsonResponse(
        { success: false, message: 'Too many requests. Please try again shortly.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoryGroup = searchParams.get('categoryGroup');
    const search = searchParams.get('search');

    const validationResult = ServicesQuerySchema.safeParse({ categoryGroup, search });
    if (!validationResult.success) {
      return safeJsonResponse(
        { success: false, message: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const cleanSearch = search ? sanitizeString(search).toLowerCase() : null;
    const cleanCategoryGroup = categoryGroup ? sanitizeString(categoryGroup) : null;

    let modules = cleanSearch
      ? serviceRegistry.searchModules(cleanSearch)
      : serviceRegistry.getActiveModules();

    if (cleanCategoryGroup) {
      modules = modules.filter((s) => s.categoryGroup === cleanCategoryGroup);
    }

    const response = safeJsonResponse({
      success: true,
      total: modules.length,
      filters: { categoryGroup: cleanCategoryGroup, search: cleanSearch },
      data: modules,
    });

    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error: any) {
    return handleSecureApiError(error, 'Fetching marketplace services');
  }
}
