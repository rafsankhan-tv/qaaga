import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  checkBruteForce,
  handleSecureApiError,
  extractAuthTokenFromRequest,
  verifyAuthToken,
} from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { reviewRepository } from '@/repositories/review.repository';
import type { ReviewTargetType } from '@/types';

const reviewSubmissionSchema = z.object({
  targetType: z.enum(['PRODUCT', 'SERVICE', 'SELLER', 'DOCTOR', 'NURSE', 'HOTEL', 'EBOOK']),
  targetId: z.string().min(1, 'Target ID is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, 'কমপক্ষে ৩ অক্ষরের রিভিউ লিখুন').max(1000, 'সর্বোচ্চ ১০০০ অক্ষর'),
  userName: z.string().min(1).optional(),
  userAvatar: z.string().optional(),
});

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get('targetType') as ReviewTargetType;
    const targetId = searchParams.get('targetId');

    if (!targetType || !targetId) {
      return createApiError('targetType এবং targetId প্যারামিটার আবশ্যক।', { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || 'ip_reviews';
    const rateCheck = checkBruteForce(`reviews_get_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
      });
    }

    const [reviews, stats] = await Promise.all([
      reviewRepository.findByTarget(targetType, targetId),
      reviewRepository.getAggregateStats(targetType, targetId),
    ]);

    return createApiSuccess({
      reviews,
      stats,
      total: reviews.length,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Reviews fetch transport layer');
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_reviews_post';
    const rateCheck = checkBruteForce(`reviews_post_${ip}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const token = extractAuthTokenFromRequest(req);
    let userId: string | undefined = undefined;
    let authUserName: string | undefined = undefined;

    if (token) {
      const payload = verifyAuthToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    const body = await req.json();
    const validation = reviewSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return createApiError('রিভিউ এর তথ্য সঠিক নয়।', {
        status: 400,
        validationErrors: validation.error.flatten().fieldErrors as any,
      });
    }

    const { targetType, targetId, rating, comment, userName, userAvatar } = validation.data;
    const finalUserId = userId || (body.userId as string | undefined);

    // Duplicate review protection
    if (finalUserId) {
      const alreadyReviewed = await reviewRepository.hasUserReviewed(finalUserId, targetType, targetId);
      if (alreadyReviewed) {
        return createApiError('আপনি ইতিমধ্যে এই বিষয়ে একটি রিভিউ প্রদান করেছেন।', {
          status: 409,
        });
      }
    }

    const review = await reviewRepository.create({
      targetType,
      targetId,
      userId: finalUserId,
      userName: userName || authUserName || 'সন্তুষ্ট গ্রাহক',
      userAvatar: userAvatar || '',
      rating,
      comment,
    });

    const stats = await reviewRepository.getAggregateStats(targetType, targetId);

    return createApiSuccess(
      {
        review,
        stats,
        message: 'রিভিউ সফলভাবে জমা হয়েছে।',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return handleSecureApiError(error, 'Review creation transport layer');
  }
}
