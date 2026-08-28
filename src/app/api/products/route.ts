import { NextRequest } from 'next/server';
import { ProductQuerySchema, ProductCreateSchema } from '@/lib/validation';
import {
  checkBruteForce,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  extractAuthTokenFromRequest,
  verifyAuthToken,
  hasRequiredRole,
  handleSecureApiError,
} from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { catalogService } from '@/services/business/catalog.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_products';
    const rateCheck = checkBruteForce(`products_get_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = {
      id: searchParams.get('id') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      sellerId: searchParams.get('sellerId') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const queryResult = ProductQuerySchema.safeParse(rawQuery);
    if (!queryResult.success) {
      return createApiError('Invalid query parameters', { status: 400 });
    }

    const { id, category, search, sellerId } = queryResult.data;

    if (id) {
      const product = catalogService.getProductById(id);
      if (!product) {
        return createApiError('পণ্যটি পাওয়া যায়নি।', { status: 404 });
      }
      return createApiSuccess({ product });
    }

    const products = catalogService.getProducts({ category, search, sellerId });
    return createApiSuccess({
      products,
      total: products.length,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Products catalog transport layer');
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateOriginAndCSRF(req)) {
      return createApiError('Invalid request origin or CSRF check failed.', { status: 403 });
    }

    const ip = req.headers.get('x-forwarded-for') || 'ip_product_create';
    const rateCheck = checkBruteForce(`prod_create_${ip}`, 30, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const token = extractAuthTokenFromRequest(req);
    if (!token) {
      return createApiError('লগইন করা আবশ্যক।', { status: 401 });
    }

    const payload = verifyAuthToken(token);
    if (!payload) {
      return createApiError('লগইন সেশন মেয়াদোত্তীর্ণ বা অকার্যকর। পুনরায় লগইন করুন।', { status: 401 });
    }

    if (!hasRequiredRole(payload.roles, ['SELLER', 'ADMIN', 'SUPER_ADMIN'])) {
      return createApiError('অনুমোদন নেই। শুধুমাত্র অনুমোদিত বিক্রেতা বা অ্যাডমিন পণ্য যোগ করতে পারেন।', {
        status: 403,
      });
    }

    const jsonResult = await parseJsonWithLimit(req, 512 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    const validationResult = ProductCreateSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      return createApiError(validationResult.error.issues[0]?.message || 'Invalid product data', {
        status: 400,
        code: 'VALIDATION_ERROR',
      });
    }

    const productInput = validationResult.data;
    const randomSku = `SKU-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newProduct = catalogService.createProduct({
      title: productInput.title,
      category: productInput.category,
      price: productInput.price,
      discountPrice: productInput.discountPrice,
      stock: productInput.stock,
      sku: randomSku,
      warranty: '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি',
      deliveryInfo: 'সারাদেশে হোম ডেলিভারি ২-৩ দিন',
      rating: 5.0,
      reviewCount: 0,
      salesCount: 0,
      isApproved: true,
      description: productInput.description,
      images: productInput.images,
      sellerId: productInput.sellerId || payload.userId,
      sellerShopName: productInput.sellerName || 'Verified Shop',
      inStock: productInput.stock > 0,
      isFeatured: false,
    });

    return createApiSuccess({
      message: 'পণ্য সফলভাবে তালিকাভুক্ত হয়েছে।',
      product: newProduct,
    }, { status: 201 });
  } catch (error: any) {
    return handleSecureApiError(error, 'Product creation transport layer');
  }
}

