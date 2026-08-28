import { NextRequest } from 'next/server';
import { ServiceRequestSchema } from '@/lib/validation';
import {
  checkBruteForce,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  handleSecureApiError,
  extractAuthTokenFromRequest,
  verifyAuthToken,
} from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { serviceRequestService } from '@/services/business/serviceRequest.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const status = searchParams.get('status') || undefined;
    const district = searchParams.get('district') || undefined;

    const token = extractAuthTokenFromRequest(req);
    let customerId: string | undefined = undefined;
    if (token) {
      const payload = verifyAuthToken(token);
      if (payload && !payload.roles.includes('SUPER_ADMIN')) {
        customerId = payload.userId;
      }
    }

    const requests = await serviceRequestService.listRequests({
      categoryId,
      status,
      district,
      customerId,
    });

    return createApiSuccess({
      requests,
      total: requests.length,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'List service requests transport layer');
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOriginAndCSRF(req)) {
      return createApiError('Invalid request origin or CSRF check failed.', { status: 403 });
    }

    const ip = req.headers.get('x-forwarded-for') || 'ip_srv_req';
    const rateCheck = checkBruteForce(`srv_${ip}`, 20, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। কিছুক্ষণ পর চেষ্টা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const jsonResult = await parseJsonWithLimit(req, 128 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    const validationResult = ServiceRequestSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((i) => i.message).join(', ');
      return createApiError(errorMsg, { status: 400, code: 'VALIDATION_ERROR' });
    }

    const token = extractAuthTokenFromRequest(req);
    let authenticatedUserId: string | null = null;
    if (token) {
      const payload = verifyAuthToken(token);
      if (payload) {
        authenticatedUserId = payload.userId;
      }
    }

    const result = await serviceRequestService.createServiceRequest(
      validationResult.data,
      authenticatedUserId
    );

    if (!result.success) {
      return createApiError(result.message, {
        status: result.statusCode || 400,
        code: result.errorCode,
      });
    }

    return createApiSuccess(
      { request: result.request },
      {
        message: result.message,
        status: result.statusCode || 201,
      }
    );
  } catch (error: any) {
    return handleSecureApiError(error, 'Service request transport layer');
  }
}
