import { dbService } from '../db/database.ts';
import {
  assertProductionWriteAllowed,
  handleRepositoryWriteError,
} from '../lib/persistence-policy.ts';
import { SEED_FEED_POSTS, SEED_FOLLOWS } from '../data/mockFeedData.ts';
import type { FeedPost, FeedComment, UserFollow } from '../types/index.ts';

export interface FeedQueryOptions {
  tab?: string; // 'all' | 'health' | 'service' | 'hotel' | 'jobs' | 'following'
  categoryKey?: string;
  authorId?: string;
  currentUserId?: string;
  limit?: number;
  offset?: number;
}

export class FeedRepository {
  async seedFeedIfEmpty(): Promise<void> {
    if (!dbService.isDatabaseConfigured()) return;
    try {
      const check = await dbService.query(`SELECT COUNT(*) as count FROM feed_posts`);
      const count = parseInt(check.rows[0]?.count || '0', 10);
      if (count === 0) {
        for (const post of SEED_FEED_POSTS) {
          await dbService.query(
            `INSERT INTO feed_posts (
              id, author_id, author_name, author_avatar, author_role, author_badge,
              author_rating, author_district, author_thana, post_type, title,
              content, images, tags, category_key, likes_count, shares_count,
              is_pinned, action_cta, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
            ON CONFLICT (id) DO NOTHING`,
            [
              post.id,
              post.authorId,
              post.authorName,
              post.authorAvatar || '',
              post.authorRole || 'CUSTOMER',
              post.authorBadge || null,
              post.authorRating || 5.0,
              post.authorDistrict || 'ঢাকা',
              post.authorThana || null,
              post.postType || 'UPDATE',
              post.title || '',
              post.content,
              JSON.stringify(post.images || []),
              JSON.stringify(post.tags || []),
              post.categoryKey || 'general',
              post.likesCount || 0,
              post.sharesCount || 0,
              Boolean(post.isPinned),
              post.actionCta ? JSON.stringify(post.actionCta) : null,
              post.createdAt || new Date().toISOString(),
              post.createdAt || new Date().toISOString(),
            ]
          );

          if (post.likedBy && Array.isArray(post.likedBy)) {
            for (const userId of post.likedBy) {
              const likeId = `like-${post.id}-${userId}`;
              await dbService.query(
                `INSERT INTO feed_likes (id, post_id, user_id, created_at)
                 VALUES ($1, $2, $3, NOW())
                 ON CONFLICT (post_id, user_id) DO NOTHING`,
                [likeId, post.id, userId]
              );
            }
          }

          if (post.comments && Array.isArray(post.comments)) {
            for (const comment of post.comments) {
              await dbService.query(
                `INSERT INTO feed_comments (id, post_id, user_id, user_name, user_avatar, user_role, content, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (id) DO NOTHING`,
                [
                  comment.id,
                  post.id,
                  comment.userId,
                  comment.userName,
                  comment.userAvatar || '',
                  comment.userRole || 'CUSTOMER',
                  comment.text,
                  comment.createdAt || new Date().toISOString(),
                ]
              );
            }
          }
        }

        for (const follow of SEED_FOLLOWS) {
          await dbService.query(
            `INSERT INTO user_follows (
              id, follower_id, target_id, target_name, target_avatar,
              target_role, target_badge, target_category, target_rating, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (follower_id, target_id) DO NOTHING`,
            [
              follow.id,
              follow.followerId,
              follow.targetId,
              follow.targetName,
              follow.targetAvatar || '',
              follow.targetRole,
              follow.targetBadge || '',
              follow.targetCategory || '',
              follow.targetRating || 5.0,
              follow.createdAt || new Date().toISOString(),
            ]
          );
        }
      }
    } catch (err) {
      console.warn('PostgreSQL seedFeedIfEmpty warning:', err);
    }
  }

  async getPosts(options?: FeedQueryOptions): Promise<FeedPost[]> {
    if (dbService.isDatabaseConfigured()) {
      try {
        await this.seedFeedIfEmpty();

        const whereClauses: string[] = ['1=1'];
        const params: any[] = [];
        let pIdx = 1;

        if (options?.tab && options.tab !== 'all') {
          if (options.tab === 'following' && options.currentUserId) {
            whereClauses.push(`author_id IN (SELECT target_id FROM user_follows WHERE follower_id = $${pIdx++})`);
            params.push(options.currentUserId);
          } else if (options.tab === 'health') {
            whereClauses.push(`(category_key = 'doctor' OR category_key = 'nurse' OR category_key = 'caregiver')`);
          } else if (options.tab === 'service') {
            whereClauses.push(`category_key = 'service'`);
          } else if (options.tab === 'hotel') {
            whereClauses.push(`category_key = 'hotel'`);
          } else if (options.tab === 'jobs') {
            whereClauses.push(`category_key = 'jobs'`);
          }
        }

        if (options?.categoryKey) {
          whereClauses.push(`category_key = $${pIdx++}`);
          params.push(options.categoryKey);
        }

        if (options?.authorId) {
          whereClauses.push(`author_id = $${pIdx++}`);
          params.push(options.authorId);
        }

        const limit = options?.limit || 50;
        const offset = options?.offset || 0;

        const sql = `
          SELECT * FROM feed_posts
          WHERE ${whereClauses.join(' AND ')}
          ORDER BY is_pinned DESC, created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;

        const res = await dbService.query(sql, params);
        if (res.rows.length > 0) {
          const postIds = res.rows.map((r) => r.id);

          // Batch fetch comments
          const commentsRes = await dbService.query(
            `SELECT * FROM feed_comments WHERE post_id = ANY($1) ORDER BY created_at ASC`,
            [postIds]
          );

          // Batch fetch likes
          const likesRes = await dbService.query(
            `SELECT post_id, user_id FROM feed_likes WHERE post_id = ANY($1)`,
            [postIds]
          );

          const commentsByPost: Record<string, FeedComment[]> = {};
          commentsRes.rows.forEach((row) => {
            if (!commentsByPost[row.post_id]) commentsByPost[row.post_id] = [];
            commentsByPost[row.post_id].push({
              id: row.id,
              postId: row.post_id,
              userId: row.user_id,
              userName: row.user_name,
              userAvatar: row.user_avatar,
              userRole: row.user_role as any,
              text: row.content,
              createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
            });
          });

          const likesByPost: Record<string, string[]> = {};
          likesRes.rows.forEach((row) => {
            if (!likesByPost[row.post_id]) likesByPost[row.post_id] = [];
            likesByPost[row.post_id].push(row.user_id);
          });

          return res.rows.map((row) => ({
            id: row.id,
            authorId: row.author_id,
            authorName: row.author_name,
            authorAvatar: row.author_avatar,
            authorRole: row.author_role as any,
            authorBadge: row.author_badge,
            authorRating: Number(row.author_rating || 5.0),
            authorDistrict: row.author_district,
            authorThana: row.author_thana,
            postType: row.post_type as any,
            title: row.title || undefined,
            content: row.content,
            images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
            tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
            categoryKey: row.category_key,
            likesCount: Number(row.likes_count || (likesByPost[row.id] ? likesByPost[row.id].length : 0)),
            likedBy: likesByPost[row.id] || [],
            comments: commentsByPost[row.id] || [],
            sharesCount: Number(row.shares_count || 0),
            isPinned: Boolean(row.is_pinned),
            actionCta: typeof row.action_cta === 'string' ? JSON.parse(row.action_cta) : row.action_cta,
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
            updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('PostgreSQL getPosts warning:', err);
      }
    }
    return SEED_FEED_POSTS;
  }

  async createPost(post: Partial<FeedPost>): Promise<FeedPost> {
    assertProductionWriteAllowed('Create feed post');
    const id = post.id || `feed-post-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const newPost: FeedPost = {
      id,
      authorId: post.authorId || 'user-customer-1',
      authorName: post.authorName || 'Anonymous',
      authorAvatar: post.authorAvatar || '',
      authorRole: post.authorRole || 'CUSTOMER',
      authorBadge: post.authorBadge,
      authorRating: post.authorRating || 5.0,
      authorDistrict: post.authorDistrict || 'ঢাকা',
      authorThana: post.authorThana,
      postType: post.postType || 'UPDATE',
      title: post.title,
      content: post.content || '',
      images: post.images || [],
      tags: post.tags || [],
      categoryKey: post.categoryKey || 'general',
      likesCount: 0,
      likedBy: [],
      comments: [],
      sharesCount: 0,
      isPinned: Boolean(post.isPinned),
      actionCta: post.actionCta,
      createdAt: now,
      updatedAt: now,
    };

    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `
          INSERT INTO feed_posts (
            id, author_id, author_name, author_avatar, author_role, author_badge,
            author_rating, author_district, author_thana, post_type, title,
            content, images, tags, category_key, likes_count, shares_count,
            is_pinned, action_cta, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 0, 0, $16, $17, NOW(), NOW())
          RETURNING *
        `;
        const params = [
          newPost.id,
          newPost.authorId,
          newPost.authorName,
          newPost.authorAvatar,
          newPost.authorRole,
          newPost.authorBadge || null,
          newPost.authorRating,
          newPost.authorDistrict,
          newPost.authorThana || null,
          newPost.postType,
          newPost.title || null,
          newPost.content,
          JSON.stringify(newPost.images),
          JSON.stringify(newPost.tags),
          newPost.categoryKey,
          newPost.isPinned,
          newPost.actionCta ? JSON.stringify(newPost.actionCta) : null,
        ];
        await dbService.query(sql, params);
      } catch (err) {
        handleRepositoryWriteError('Create feed post in PostgreSQL', err);
      }
    }

    return newPost;
  }

  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    assertProductionWriteAllowed('Toggle feed like');
    let liked = false;
    let likesCount = 0;

    if (dbService.isDatabaseConfigured()) {
      try {
        const existing = await dbService.query(
          `SELECT id FROM feed_likes WHERE post_id = $1 AND user_id = $2 LIMIT 1`,
          [postId, userId]
        );

        if (existing.rows.length > 0) {
          await dbService.query(`DELETE FROM feed_likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
          const updateRes = await dbService.query(
            `UPDATE feed_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1 RETURNING likes_count`,
            [postId]
          );
          liked = false;
          likesCount = updateRes.rows[0]?.likes_count || 0;
        } else {
          const likeId = `like-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          await dbService.query(
            `INSERT INTO feed_likes (id, post_id, user_id, created_at) VALUES ($1, $2, $3, NOW())`,
            [likeId, postId, userId]
          );
          const updateRes = await dbService.query(
            `UPDATE feed_posts SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count`,
            [postId]
          );
          liked = true;
          likesCount = updateRes.rows[0]?.likes_count || 1;
        }
      } catch (err) {
        handleRepositoryWriteError('Toggle like in PostgreSQL', err);
      }
    }

    return { liked, likesCount };
  }

  async addComment(
    postId: string,
    comment: { userId: string; userName: string; userAvatar?: string; userRole?: string; content: string }
  ): Promise<FeedComment> {
    assertProductionWriteAllowed('Add feed comment');
    const id = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const newComment: FeedComment = {
      id,
      postId,
      userId: comment.userId,
      userName: comment.userName,
      userAvatar: comment.userAvatar || '',
      userRole: (comment.userRole as any) || 'CUSTOMER',
      text: comment.content,
      createdAt: now,
    };

    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `
          INSERT INTO feed_comments (id, post_id, user_id, user_name, user_avatar, user_role, content, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          RETURNING *
        `;
        const params = [
          newComment.id,
          postId,
          comment.userId,
          comment.userName,
          comment.userAvatar || '',
          comment.userRole || 'CUSTOMER',
          comment.content,
        ];
        await dbService.query(sql, params);
      } catch (err) {
        handleRepositoryWriteError('Add comment in PostgreSQL', err);
      }
    }

    return newComment;
  }

  async toggleBookmark(postId: string, userId: string): Promise<{ bookmarked: boolean }> {
    assertProductionWriteAllowed('Toggle feed bookmark');
    let bookmarked = false;

    if (dbService.isDatabaseConfigured()) {
      try {
        const existing = await dbService.query(
          `SELECT id FROM feed_bookmarks WHERE post_id = $1 AND user_id = $2 LIMIT 1`,
          [postId, userId]
        );

        if (existing.rows.length > 0) {
          await dbService.query(`DELETE FROM feed_bookmarks WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
          bookmarked = false;
        } else {
          const id = `bm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          await dbService.query(
            `INSERT INTO feed_bookmarks (id, post_id, user_id, created_at) VALUES ($1, $2, $3, NOW())`,
            [id, postId, userId]
          );
          bookmarked = true;
        }
      } catch (err) {
        handleRepositoryWriteError('Toggle bookmark in PostgreSQL', err);
      }
    }

    return { bookmarked };
  }

  async toggleFollow(
    followerId: string,
    targetId: string,
    targetMeta?: { name?: string; avatar?: string; role?: string; badge?: string; category?: string; rating?: number }
  ): Promise<{ following: boolean }> {
    assertProductionWriteAllowed('Toggle user follow');
    let following = false;

    if (dbService.isDatabaseConfigured()) {
      try {
        const existing = await dbService.query(
          `SELECT id FROM user_follows WHERE follower_id = $1 AND target_id = $2 LIMIT 1`,
          [followerId, targetId]
        );

        if (existing.rows.length > 0) {
          await dbService.query(`DELETE FROM user_follows WHERE follower_id = $1 AND target_id = $2`, [followerId, targetId]);
          following = false;
        } else {
          const id = `flw-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          await dbService.query(
            `INSERT INTO user_follows (
              id, follower_id, target_id, target_name, target_avatar,
              target_role, target_badge, target_category, target_rating, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
            [
              id,
              followerId,
              targetId,
              targetMeta?.name || 'User',
              targetMeta?.avatar || '',
              targetMeta?.role || 'PROVIDER',
              targetMeta?.badge || '',
              targetMeta?.category || '',
              targetMeta?.rating || 5.0,
            ]
          );
          following = true;
        }
      } catch (err) {
        handleRepositoryWriteError('Toggle follow in PostgreSQL', err);
      }
    }

    return { following };
  }

  async getUserFollows(userId: string): Promise<UserFollow[]> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `SELECT * FROM user_follows WHERE follower_id = $1 ORDER BY created_at DESC`;
        const res = await dbService.query(sql, [userId]);
        return res.rows.map((row) => ({
          id: row.id,
          followerId: row.follower_id,
          targetId: row.target_id,
          targetName: row.target_name,
          targetAvatar: row.target_avatar,
          targetRole: row.target_role,
          targetBadge: row.target_badge,
          targetCategory: row.target_category,
          targetRating: Number(row.target_rating || 5.0),
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        }));
      } catch (err) {
        console.warn('PostgreSQL getUserFollows warning:', err);
      }
    }
    return SEED_FOLLOWS.filter((f) => f.followerId === userId);
  }

  async getUserBookmarks(userId: string): Promise<string[]> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `SELECT post_id FROM feed_bookmarks WHERE user_id = $1`;
        const res = await dbService.query(sql, [userId]);
        return res.rows.map((r) => r.post_id);
      } catch (err) {
        console.warn('PostgreSQL getUserBookmarks warning:', err);
      }
    }
    return [];
  }
}

export const feedRepository = new FeedRepository();
