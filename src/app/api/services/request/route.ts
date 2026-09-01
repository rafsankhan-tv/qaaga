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
import { acquireIdempotencyKey, commitIdempotencyResult, releaseIdempotencyKey } from '@/lib/idempotency';
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

    const idempotencyKey = req.headers.get('idempotency-key') || req.headers.get('x-idempotency-key');
    if (idempotencyKey) {
      const lock = await acquireIdempotencyKey(idempotencyKey, 'SERVICE_REQUEST');
      if (lock.isDuplicate) {
        if (lock.inFlight) {
          return createApiError('সার্ভিস রিকোয়েস্টটি বর্তমানে প্রসেস করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।', {
            status: 409,
            code: 'REQUEST_IN_FLIGHT',
          });
        }
        if (lock.cachedResponse) {
          return createApiSuccess(lock.cachedResponse.body, { status: lock.cachedResponse.status });
        }
      }
    }

    const jsonResult = await parseJsonWithLimit(req, 128 * 1024);
    if (!jsonResult.success) {
      if (idempotencyKey) await releaseIdempotencyKey(idempotencyKey);
      return jsonResult.errorResponse!;
    }

    const validationResult = ServiceRequestSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      if (idempotencyKey) await releaseIdempotencyKey(idempotencyKey);
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
      if (idempotencyKey) await releaseIdempotencyKey(idempotencyKey);
      return createApiError(result.message, {
        status: result.statusCode || 400,
        code: result.errorCode,
      });
    }

    if (idempotencyKey && result.success) {
      await commitIdempotencyResult(idempotencyKey, result.statusCode || 201, { request: result.request });
    }

    return createApiSuccess(
      { request: result.request },
      {
        message: result.message,
        status: result.statusCode || 201,
      }
    );
  } catch (error: any) {
    const idempotencyKey = req.headers.get('idempotency-key') || req.headers.get('x-idempotency-key');
    if (idempotencyKey) {
      await releaseIdempotencyKey(idempotencyKey);
    }
    return handleSecureApiError(error, 'Service request transport layer');
  }
}
