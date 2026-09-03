import { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkBruteForce, handleSecureApiError } from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { feedRepository } from '@/repositories/feed.repository';

const interactionSchema = z.object({
  action: z.enum(['like', 'comment', 'bookmark', 'follow']),
  postId: z.string().optional(),
  userId: z.string().min(1, 'User ID is required'),
  userName: z.string().optional(),
  userAvatar: z.string().optional(),
  userRole: z.string().optional(),
  commentText: z.string().optional(),
  targetId: z.string().optional(),
  targetMeta: z
    .object({
      name: z.string().optional(),
      avatar: z.string().optional(),
      role: z.string().optional(),
      badge: z.string().optional(),
      category: z.string().optional(),
      rating: z.number().optional(),
    })
    .optional(),
});

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_feed_interaction';
    const rateCheck = checkBruteForce(`feed_interact_${ip}`, 60, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const body = await req.json();
    const validation = interactionSchema.safeParse(body);
    if (!validation.success) {
      return createApiError('তথ্য সঠিক নয়।', {
        status: 400,
        validationErrors: validation.error.flatten().fieldErrors as any,
      });
    }

    const { action, postId, userId, userName, userAvatar, userRole, commentText, targetId, targetMeta } = validation.data;

    if (action === 'like') {
      if (!postId) return createApiError('Post ID আবশ্যক।', { status: 400 });
      const result = await feedRepository.toggleLike(postId, userId);
      return createApiSuccess(result);
    }

    if (action === 'comment') {
      if (!postId || !commentText?.trim()) {
        return createApiError('Post ID এবং কমেন্ট টেক্সট আবশ্যক।', { status: 400 });
      }
      const comment = await feedRepository.addComment(postId, {
        userId,
        userName: userName || 'ব্যবহারকারী',
        userAvatar,
        userRole,
        content: commentText.trim(),
      });
      return createApiSuccess({ comment });
    }

    if (action === 'bookmark') {
      if (!postId) return createApiError('Post ID আবশ্যক।', { status: 400 });
      const result = await feedRepository.toggleBookmark(postId, userId);
      return createApiSuccess(result);
    }

    if (action === 'follow') {
      if (!targetId) return createApiError('Target ID আবশ্যক।', { status: 400 });
      const result = await feedRepository.toggleFollow(userId, targetId, targetMeta);
      return createApiSuccess(result);
    }

    return createApiError('অজ্ঞাত অ্যাকশন।', { status: 400 });
  } catch (error: any) {
    return handleSecureApiError(error, 'Feed interaction transport layer');
  }
}
