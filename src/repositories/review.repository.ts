import { dbService } from '../db/database.ts';
import {
  assertProductionWriteAllowed,
  handleRepositoryWriteError,
} from '../lib/persistence-policy.ts';
import type { ReviewTargetType, AppReview } from '../types/index.ts';

export interface CreateReviewInput {
  id?: string;
  targetType: ReviewTargetType;
  targetId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  isVerifiedPurchase?: boolean;
}

/**
 * Data Access Layer (Repository Pattern) - Review Repository
 * Backed by PostgreSQL `reviews` table with safe ACID transactions and rating aggregates.
 */
export class ReviewRepository {
  async findByTarget(targetType: ReviewTargetType, targetId: string): Promise<AppReview[]> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `
          SELECT * FROM reviews 
          WHERE target_type = $1 AND target_id = $2 
          ORDER BY is_verified_purchase DESC, created_at DESC 
          LIMIT 100
        `;
        const res = await dbService.query(sql, [targetType, targetId]);
        return res.rows.map((row) => ({
          id: row.id,
          targetType: row.target_type as ReviewTargetType,
          targetId: row.target_id,
          userId: row.user_id,
          userName: row.user_name,
          userAvatar: row.user_avatar,
          rating: Number(row.rating),
          comment: row.comment,
          isVerifiedPurchase: Boolean(row.is_verified_purchase),
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        }));
      } catch (err) {
        console.warn('PostgreSQL findByTarget reviews warning:', err);
      }
    }
    return [];
  }

  async hasUserReviewed(userId: string, targetType: ReviewTargetType, targetId: string): Promise<boolean> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `SELECT id FROM reviews WHERE user_id = $1 AND target_type = $2 AND target_id = $3 LIMIT 1`;
        const res = await dbService.query(sql, [userId, targetType, targetId]);
        return res.rows.length > 0;
      } catch (err) {
        console.warn('PostgreSQL hasUserReviewed warning:', err);
      }
    }
    return false;
  }

  async checkVerifiedPurchase(userId: string, targetType: ReviewTargetType, targetId: string): Promise<boolean> {
    if (!dbService.isDatabaseConfigured() || !userId) return false;
    try {
      if (targetType === 'PRODUCT') {
        const sql = `
          SELECT id FROM orders 
          WHERE customer_id = $1 
            AND payment_status IN ('PAID', 'COD', 'COMPLETED') 
            AND items::text LIKE $2 
          LIMIT 1
        `;
        const res = await dbService.query(sql, [userId, `%"id":"${targetId}"%`]);
        return res.rows.length > 0;
      }
      if (targetType === 'SERVICE') {
        const sql = `
          SELECT id FROM service_requests 
          WHERE customer_id = $1 
            AND (id = $2 OR category_id = $2) 
            AND status IN ('COMPLETED', 'ACCEPTED') 
          LIMIT 1
        `;
        const res = await dbService.query(sql, [userId, targetId]);
        return res.rows.length > 0;
      }
      return false;
    } catch {
      return false;
    }
  }

  async create(input: CreateReviewInput): Promise<AppReview> {
    assertProductionWriteAllowed('Submit review');
    const id = input.id || `rev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    let isVerified = Boolean(input.isVerifiedPurchase);

    if (input.userId && !isVerified) {
      isVerified = await this.checkVerifiedPurchase(input.userId, input.targetType, input.targetId);
    }

    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `
          INSERT INTO reviews (
            id, target_type, target_id, user_id, user_name, user_avatar,
            rating, comment, is_verified_purchase, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          RETURNING *
        `;
        const params = [
          id,
          input.targetType,
          input.targetId,
          input.userId || null,
          input.userName,
          input.userAvatar || null,
          input.rating,
          input.comment,
          isVerified,
        ];
        await dbService.query(sql, params);
      } catch (err) {
        handleRepositoryWriteError('Submit review to PostgreSQL', err);
      }
    }

    return {
      id,
      targetType: input.targetType,
      targetId: input.targetId,
      userId: input.userId,
      userName: input.userName,
      userAvatar: input.userAvatar,
      rating: input.rating,
      comment: input.comment,
      isVerifiedPurchase: isVerified,
      createdAt: new Date().toISOString(),
    };
  }

  async getAggregateStats(targetType: ReviewTargetType, targetId: string): Promise<{ averageRating: number; totalReviews: number }> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `
          SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as count 
          FROM reviews 
          WHERE target_type = $1 AND target_id = $2
        `;
        const res = await dbService.query(sql, [targetType, targetId]);
        if (res.rows.length > 0) {
          return {
            averageRating: parseFloat(Number(res.rows[0].avg_rating).toFixed(1)),
            totalReviews: parseInt(res.rows[0].count, 10),
          };
        }
      } catch (err) {
        console.warn('PostgreSQL getAggregateStats warning:', err);
      }
    }
    return { averageRating: 5.0, totalReviews: 0 };
  }
}

export const reviewRepository = new ReviewRepository();
