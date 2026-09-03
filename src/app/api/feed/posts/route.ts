import { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkBruteForce, handleSecureApiError, extractAuthTokenFromRequest, verifyAuthToken } from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { feedRepository } from '@/repositories/feed.repository';

const createFeedPostSchema = z.object({
  id: z.string().optional(),
  authorId: z.string().min(1),
  authorName: z.string().min(1),
  authorAvatar: z.string().optional(),
  authorRole: z.enum(['CUSTOMER', 'PROVIDER', 'SELLER', 'DOCTOR', 'NURSE', 'CAREGIVER', 'ADMIN']).default('CUSTOMER'),
  authorBadge: z.string().optional(),
  authorRating: z.number().optional(),
  authorDistrict: z.string().default('ঢাকা'),
  authorThana: z.string().optional(),
  postType: z.enum(['UPDATE', 'OFFER', 'HEALTH_TIP', 'SERVICE_TIP', 'JOB_CIRCULAR', 'PRODUCT_LAUNCH']).default('UPDATE'),
  title: z.string().optional(),
  content: z.string().min(3, 'কমপক্ষে ৩ অক্ষরের পোস্ট লিখুন'),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  categoryKey: z.string().default('general'),
  isPinned: z.boolean().default(false),
  actionCta: z.any().optional(),
});

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') || 'all';
    const categoryKey = searchParams.get('categoryKey') || undefined;
    const authorId = searchParams.get('authorId') || undefined;
    const currentUserId = searchParams.get('currentUserId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const posts = await feedRepository.getPosts({
      tab,
      categoryKey,
      authorId,
      currentUserId,
      limit,
      offset,
    });

    return createApiSuccess({
      posts,
      total: posts.length,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Feed posts fetch transport layer');
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_feed_post';
    const rateCheck = checkBruteForce(`feed_create_${ip}`, 20, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const body = await req.json();
    const validation = createFeedPostSchema.safeParse(body);
    if (!validation.success) {
      return createApiError('ফিড পোস্ট ডাটা সঠিক নয়।', {
        status: 400,
        validationErrors: validation.error.flatten().fieldErrors as any,
      });
    }

    const createdPost = await feedRepository.createPost(validation.data as any);
    return createApiSuccess({ post: createdPost }, { status: 201 });
  } catch (error: any) {
    return handleSecureApiError(error, 'Feed post creation transport layer');
  }
}
