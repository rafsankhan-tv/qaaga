import { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkBruteForce, handleSecureApiError, extractAuthTokenFromRequest, verifyAuthToken } from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { catalogService } from '@/services/business/catalog.service';

const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Category name is required'),
  banglaName: z.string().optional(),
  slug: z.string().optional(),
  iconName: z.string().default('Wrench'),
  description: z.string().default(''),
  defaultAdvancePercent: z.number().min(0).max(100).default(20),
  minPrice: z.number().min(0).default(500),
  subcategories: z.array(z.string()).default([]),
  bannerImage: z.string().default(''),
  isFeatured: z.boolean().default(false),
  categoryType: z.enum(['SERVICE', 'DOCTOR', 'NURSE', 'CAREGIVER', 'HOTEL', 'PRODUCT', 'EBOOK', 'USED', 'JOB']).default('SERVICE'),
});

const updateCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  banglaName: z.string().optional(),
  slug: z.string().optional(),
  iconName: z.string().optional(),
  description: z.string().optional(),
  defaultAdvancePercent: z.number().min(0).max(100).optional(),
  minPrice: z.number().min(0).optional(),
  subcategories: z.array(z.string()).optional(),
  bannerImage: z.string().optional(),
  isFeatured: z.boolean().optional(),
  categoryType: z.enum(['SERVICE', 'DOCTOR', 'NURSE', 'CAREGIVER', 'HOTEL', 'PRODUCT', 'EBOOK', 'USED', 'JOB']).optional(),
});

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_categories';
    const rateCheck = checkBruteForce(`categories_get_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const categories = await catalogService.getCategoriesAsync();
    return createApiSuccess({
      categories,
      total: categories.length,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Categories fetch transport layer');
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_categories_post';
    const rateCheck = checkBruteForce(`categories_post_${ip}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const body = await req.json();
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return createApiError('ক্যাটাগরি ডাটা সঠিক নয়।', {
        status: 400,
        validationErrors: validation.error.flatten().fieldErrors as any,
      });
    }

    const created = await catalogService.createCategory({
      ...validation.data,
      slug: validation.data.slug || validation.data.id,
    });
    return createApiSuccess({ category: created }, { status: 201 });
  } catch (error: any) {
    return handleSecureApiError(error, 'Category creation transport layer');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = updateCategorySchema.safeParse(body);
    if (!validation.success) {
      return createApiError('আপডেট ডাটা সঠিক নয়।', {
        status: 400,
        validationErrors: validation.error.flatten().fieldErrors as any,
      });
    }

    const { id, ...updates } = validation.data;
    const updated = await catalogService.updateCategory(id, updates);
    if (!updated) {
      return createApiError('ক্যাটাগরি পাওয়া যায়নি।', { status: 404 });
    }
    return createApiSuccess({ category: updated });
  } catch (error: any) {
    return handleSecureApiError(error, 'Category update transport layer');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return createApiError('ক্যাটাগরি আইডি আবশ্যক।', { status: 400 });
    }

    await catalogService.deleteCategory(id);
    return createApiSuccess({ success: true, id });
  } catch (error: any) {
    return handleSecureApiError(error, 'Category deletion transport layer');
  }
}


