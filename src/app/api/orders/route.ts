import { NextRequest } from 'next/server';
import { OrderCheckoutSchema } from '@/lib/validation';
import {
  checkBruteForce,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  handleSecureApiError,
  extractAuthTokenFromRequest,
  verifyAuthToken,
} from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { orderService } from '@/services/business/order.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const token = extractAuthTokenFromRequest(req);
    let authenticatedUserId: string | null = null;
    let isSuperAdmin = false;

    if (token) {
      const payload = verifyAuthToken(token);
      if (payload) {
        authenticatedUserId = payload.userId;
        isSuperAdmin = payload.roles.includes('SUPER_ADMIN');
      }
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (orderId) {
      const order = await orderService.getOrderById(orderId, authenticatedUserId || undefined, isSuperAdmin);
      if (!order) {
        return createApiError('অর্ডারটি পাওয়া যায়নি।', { status: 404 });
      }
      return createApiSuccess({ order });
    }

    if (authenticatedUserId && !isSuperAdmin) {
      const orders = await orderService.listUserOrders(authenticatedUserId);
      return createApiSuccess({ orders, total: orders.length });
    }

    const result = await orderService.listAllOrders(limit, page);
    return createApiSuccess(
      { orders: result.orders },
      {
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNextPage: page * limit < result.total,
          hasPrevPage: page > 1,
        },
      }
    );
  } catch (error: any) {
    return handleSecureApiError(error, 'Listing orders');
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Origin / CSRF Validation (Mobile & Same-Origin friendly)
    if (!validateOriginAndCSRF(req)) {
      return createApiError('Invalid request origin or CSRF check failed.', { status: 403 });
    }

    // 2. IP Rate Limiting (20 orders per 10 minutes per IP)
    const ip = req.headers.get('x-forwarded-for') || 'ip_order';
    const rateCheck = checkBruteForce(`order_${ip}`, 25, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত অর্ডার রিকোয়েস্ট তৈরি করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    // 3. Request Size Limit (Max 256KB for order payload)
    const jsonResult = await parseJsonWithLimit(req, 256 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    // 4. Strict Zod Validation
    const validationResult = OrderCheckoutSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((i) => i.message).join(', ');
      return createApiError(errorMsg, { status: 400, code: 'VALIDATION_ERROR' });
    }

    // 5. Check Auth Token for Customer ID Association
    const token = extractAuthTokenFromRequest(req);
    let authenticatedUserId: string | null = null;
    if (token) {
      const userPayload = verifyAuthToken(token);
      if (userPayload) {
        authenticatedUserId = userPayload.userId;
      }
    }

    // 6. Invoke Business Logic Service Layer
    const result = await orderService.createOrder(validationResult.data, authenticatedUserId);

    if (!result.success) {
      return createApiError(result.message, {
        status: result.statusCode || 400,
        code: result.errorCode,
      });
    }

    return createApiSuccess(
      { order: result.order },
      {
        message: result.message,
        status: result.statusCode || 201,
      }
    );
  } catch (error: any) {
    return handleSecureApiError(error, 'Order checkout transport layer');
  }
}
