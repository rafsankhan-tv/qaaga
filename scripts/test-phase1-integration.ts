/**
 * QAAGA Phase 1 - Master Architecture Specification Integration Test Suite
 * Automated tests covering 10 critical persistence domains against live PostgreSQL.
 */
import { dbService } from '../src/db/database.ts';
import { userRepository } from '../src/repositories/user.repository.ts';
import { catalogRepository } from '../src/repositories/catalog.repository.ts';
import { serviceRepository } from '../src/repositories/service.repository.ts';
import { orderRepository } from '../src/repositories/order.repository.ts';
import { reviewRepository } from '../src/repositories/review.repository.ts';
import { feedRepository } from '../src/repositories/feed.repository.ts';

interface TestResult {
  testNumber: number;
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(
  testNumber: number,
  name: string,
  fn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ testNumber, name, passed: true, message: 'PASS', durationMs });
    console.log(`[PASS] TEST ${testNumber}: ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    const msg = err?.message || String(err);
    results.push({ testNumber, name, passed: false, message: msg, durationMs });
    console.error(`[FAIL] TEST ${testNumber}: ${name} (${durationMs}ms) -> ${msg}`);
  }
}

async function main() {
  const targetUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@') : 'unconfigured';
  console.log('=================================================================');
  console.log('QAAGA PHASE 1: AUTOMATED INTEGRATION TEST SUITE (10 DOMAINS)');
  console.log(`Target: ${targetUrl}`);
  console.log('=================================================================\n');

  // Verify DB connectivity
  const health = await dbService.checkHealth();
  if (health.status !== 'healthy') {
    console.error('FATAL: Cannot connect to PostgreSQL database.', health);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // TEST 1: USERS
  // -------------------------------------------------------------
  await runTest(1, 'USERS PERSISTENCE & RETRIEVAL', async () => {
    const testUserId = `user-test-${Date.now()}`;
    const testPhone = `+88017${Math.floor(10000000 + Math.random() * 90000000)}`;

    const created = await userRepository.create({
      id: testUserId,
      fullName: 'ইমরান চৌধুরী',
      phone: testPhone,
      email: `${testUserId}@qaaga-test.com`,
      gender: 'male',
      roles: ['CUSTOMER'],
      activeRole: 'CUSTOMER',
      district: 'ঢাকা',
      area: 'গুলশান ২',
      address: 'রোড ৪২, বাসা ১০',
      isVerified: true,
      accountStatus: 'active',
      rating: 5.0,
      reviewCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (!created || created.id !== testUserId) {
      throw new Error(`Failed to create user ${testUserId}`);
    }

    const fetchedById = await userRepository.findById(testUserId);
    if (!fetchedById || fetchedById.phone !== testPhone) {
      throw new Error(`User lookup by ID failed for ${testUserId}`);
    }

    const fetchedByPhone = await userRepository.findByPhone(testPhone);
    if (!fetchedByPhone || fetchedByPhone.id !== testUserId) {
      throw new Error(`User lookup by phone failed for ${testPhone}`);
    }

    // Direct DB SQL check
    const sqlRes = await dbService.query('SELECT * FROM users WHERE id = $1', [testUserId]);
    if (sqlRes.rows.length === 0) {
      throw new Error(`User row not found directly in PostgreSQL table`);
    }
  });

  // -------------------------------------------------------------
  // TEST 2: CATEGORIES
  // -------------------------------------------------------------
  await runTest(2, 'CATEGORIES PERSISTENCE & HIERARCHY', async () => {
    const testCatId = `cat-test-${Date.now()}`;
    const category = await catalogRepository.createCategory({
      id: testCatId,
      name: 'Test Smart Security',
      nameEn: 'Test Smart Security',
      nameBn: 'স্মার্ট সিকিউরিটি সার্ভিস',
      slug: `smart-security-${Date.now()}`,
      icon: 'ShieldCheck',
      description: 'CCTV and modern home security service',
      sortOrder: 99,
      isActive: true,
    });

    if (!category || category.id !== testCatId) {
      throw new Error(`Failed to create category ${testCatId}`);
    }

    const allCategories = await catalogRepository.getCategoriesAsync();
    const found = allCategories.find((c) => c.id === testCatId);
    if (!found) {
      throw new Error(`Created category ${testCatId} not found in async list`);
    }

    const updated = await catalogRepository.updateCategory(testCatId, {
      nameBn: 'স্মার্ট সিসিটিভি ও সিকিউরিটি সার্ভিস',
    });
    if (!updated || updated.nameBn !== 'স্মার্ট সিসিটিভি ও সিকিউরিটি সার্ভিস') {
      throw new Error(`Category update failed for ${testCatId}`);
    }

    // Direct DB SQL check
    const sqlRes = await dbService.query('SELECT * FROM service_categories WHERE id = $1', [testCatId]);
    if (sqlRes.rows.length === 0) {
      throw new Error(`Category row not found directly in service_categories table`);
    }
  });

  // -------------------------------------------------------------
  // TEST 3: SERVICE REQUEST
  // -------------------------------------------------------------
  await runTest(3, 'SERVICE REQUEST LIFECYCLE & AUDIT LOG', async () => {
    const testReqId = `req-test-${Date.now()}`;
    const createdReq = await serviceRepository.createRequest({
      id: testReqId,
      customerId: 'user-customer-1',
      customerName: 'Tahsin Ahmed',
      customerPhone: '+8801819876543',
      categoryId: 'cat-ac-repair',
      categoryName: 'AC Repair',
      title: 'AC Gas Refill & General Maintenance',
      description: 'Need immediate technician for cooling maintenance.',
      budget: 2500,
      isUrgent: true,
      preferredDate: new Date().toISOString().split('T')[0],
      preferredTime: '11:00 AM',
      district: 'Dhaka',
      thana: 'Dhanmondi',
      area: 'Dhanmondi',
      address: 'Road 5, House 12',
      images: [],
      routingMode: 'ALL_ELIGIBLE',
      targetProviderIds: [],
      status: 'ADMIN_REVIEW',
      statusAuditLog: [
        {
          status: 'ADMIN_REVIEW',
          timestamp: new Date().toISOString(),
          note: 'Request submitted by customer',
          changedBy: 'Customer',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (!createdReq || createdReq.id !== testReqId) {
      throw new Error(`Failed to create service request ${testReqId}`);
    }

    const fetchedReq = await serviceRepository.findRequestById(testReqId);
    if (!fetchedReq || fetchedReq.budget !== 2500) {
      throw new Error(`Service request verification failed for ${testReqId}`);
    }

    // Update status
    const updated = await serviceRepository.updateStatus(testReqId, 'OPEN', 'Approved by Admin');
    if (!updated || updated.status !== 'OPEN') {
      throw new Error(`Status update failed for service request ${testReqId}`);
    }

    // Direct DB SQL check
    const sqlRes = await dbService.query('SELECT * FROM service_requests WHERE id = $1', [testReqId]);
    if (sqlRes.rows.length === 0 || sqlRes.rows[0].status !== 'OPEN') {
      throw new Error(`service_requests table does not reflect updated OPEN status`);
    }
  });

  // -------------------------------------------------------------
  // TEST 4: PROVIDER OFFER
  // -------------------------------------------------------------
  await runTest(4, 'PROVIDER OFFER SUBMISSION & PERSISTENCE', async () => {
    const testOfferId = `off-test-${Date.now()}`;
    const offer = await serviceRepository.createOffer({
      id: testOfferId,
      requestId: 'req-101',
      providerId: 'prov-1',
      providerName: 'Kamrul AC Care',
      providerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      providerPhone: '+8801723456789',
      providerRating: 4.9,
      providerReviewCount: 120,
      providerCompletedJobs: 135,
      providerExperience: 9,
      offeredPrice: 2200,
      serviceCharge: 800,
      partsIncluded: true,
      estimatedDuration: '2 Hours',
      earliestDate: new Date().toISOString().split('T')[0],
      earliestTime: '02:00 PM',
      offerMessage: 'Includes Jet wash and refrigerant inspection.',
      warranty: '30 Days',
      offerExpiry: new Date(Date.now() + 86400000).toISOString(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (!offer || offer.id !== testOfferId) {
      throw new Error(`Failed to create provider offer ${testOfferId}`);
    }

    const offers = await serviceRepository.listOffers('req-101');
    const foundOffer = offers.find((o) => o.id === testOfferId);
    if (!foundOffer || foundOffer.offeredPrice !== 2200) {
      throw new Error(`Provider offer not found in listOffers for req-101`);
    }

    // Direct DB SQL check
    const sqlRes = await dbService.query('SELECT * FROM service_offers WHERE id = $1', [testOfferId]);
    if (sqlRes.rows.length === 0) {
      throw new Error(`Offer not found directly in service_offers table`);
    }
  });

  // -------------------------------------------------------------
  // TEST 5: ORDER
  // -------------------------------------------------------------
  await runTest(5, 'PRODUCT ORDER CREATION & STATUS PERSISTENCE', async () => {
    const testOrderId = `ord-test-${Date.now()}`;
    const orderNumber = `ORD-TEST-${Date.now().toString(36).toUpperCase()}`;

    const order = await orderRepository.create({
      id: testOrderId,
      orderNumber,
      customerId: 'user-customer-1',
      customerName: 'Tahsin Ahmed',
      customerPhone: '+8801819876543',
      deliveryAddress: 'House 24, Road 8/A, Dhanmondi',
      district: 'ঢাকা',
      thana: 'ধানমন্ডি',
      area: 'ধানমন্ডি',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
      subtotal: 3200,
      deliveryFee: 100,
      discountAmount: 200,
      totalAmount: 3100,
      items: [
        {
          productId: 'prod-ac-filter',
          productName: 'Washable Anti-Bacterial AC Filter',
          quantity: 2,
          unitPrice: 1600,
          totalPrice: 3200,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (!order || order.id !== testOrderId) {
      throw new Error(`Failed to create order ${testOrderId}`);
    }

    const fetched = await orderRepository.findById(testOrderId);
    if (!fetched || fetched.totalAmount !== 3100) {
      throw new Error(`Order verification failed for ${testOrderId}`);
    }

    const updated = await orderRepository.updateStatus(testOrderId, 'CONFIRMED', 'Payment verified on delivery');
    if (!updated || updated.orderStatus !== 'CONFIRMED') {
      throw new Error(`Order status update failed for ${testOrderId}`);
    }

    // Direct DB SQL check
    const sqlRes = await dbService.query('SELECT * FROM orders WHERE id = $1', [testOrderId]);
    if (sqlRes.rows.length === 0 || sqlRes.rows[0].order_status !== 'CONFIRMED') {
      throw new Error(`orders table does not reflect updated CONFIRMED status`);
    }
  });

  // -------------------------------------------------------------
  // TEST 6: REVIEW
  // -------------------------------------------------------------
  await runTest(6, 'POLYMORPHIC REVIEW & AGGREGATE STATS', async () => {
    const testReviewId = `rev-test-${Date.now()}`;
    const targetId = 'prov-1';

    const review = await reviewRepository.create({
      id: testReviewId,
      userId: 'user-customer-1',
      userName: 'Tahsin Ahmed',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      targetType: 'PROVIDER',
      targetId,
      rating: 5,
      comment: 'দারুণ সার্ভিস! সময়মতো এসে খুব দক্ষভাবে কাজ শেষ করেছেন।',
      aspects: { punctuality: 5, behavior: 5, quality: 5 },
      verifiedBooking: true,
    });

    if (!review || review.id !== testReviewId) {
      throw new Error(`Failed to create review ${testReviewId}`);
    }

    const reviews = await reviewRepository.findByTarget('PROVIDER', targetId);
    const found = reviews.find((r) => r.id === testReviewId);
    if (!found || found.rating !== 5) {
      throw new Error(`Review not found in findByTarget query`);
    }

    const stats = await reviewRepository.getAggregateStats('PROVIDER', targetId);
    if (stats.totalReviews === 0 || stats.averageRating < 4) {
      throw new Error(`Aggregate review stats invalid: total=${stats.totalReviews}, avg=${stats.averageRating}`);
    }

    // Direct DB SQL check
    const sqlRes = await dbService.query('SELECT * FROM reviews WHERE id = $1', [testReviewId]);
    if (sqlRes.rows.length === 0) {
      throw new Error(`Review row not found in reviews table`);
    }
  });

  // -------------------------------------------------------------
  // TEST 7: FEED
  // -------------------------------------------------------------
  await runTest(7, 'COMMUNITY FEED POSTS, LIKES, COMMENTS & FOLLOWS', async () => {
    const testPostId = `feed-test-${Date.now()}`;
    const post = await feedRepository.createPost({
      id: testPostId,
      authorId: 'prov-1',
      authorName: 'Engr. Kamrul Hasan',
      authorRole: 'PROVIDER',
      authorBadge: 'TOP_RATED',
      authorDistrict: 'ঢাকা',
      authorThana: 'মিরপুর',
      postType: 'SERVICE_TIP',
      title: 'গরমে এসি ভালো রাখার ৫টি সহজ উপায়',
      content: 'প্রতি মাসে ফিল্টার পরিষ্কার করুন এবং গ্যাস প্রেশার নিয়মিত চেক করুন।',
      images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e'],
      tags: ['AC', 'Tips', 'Maintenance'],
      categoryKey: 'cat-ac-repair',
      isPinned: false,
    });

    if (!post || post.id !== testPostId) {
      throw new Error(`Failed to create feed post ${testPostId}`);
    }

    // Toggle Like
    const likeRes = await feedRepository.toggleLike(testPostId, 'user-customer-1');
    if (!likeRes.liked || likeRes.likesCount !== 1) {
      throw new Error(`Feed post like failed: liked=${likeRes.liked}, count=${likeRes.likesCount}`);
    }

    // Add Comment
    const comment = await feedRepository.addComment(testPostId, {
      userId: 'user-customer-1',
      userName: 'Tahsin Ahmed',
      content: 'অনেক ধন্যবাদ চমৎকার টিপস এর জন্য!',
    });
    if (!comment || !comment.id) {
      throw new Error(`Failed to add comment to feed post ${testPostId}`);
    }

    // Toggle Follow
    const testTargetId = `target-prov-${Date.now()}`;
    const followRes = await feedRepository.toggleFollow('user-customer-1', testTargetId, {
      name: 'Kamrul AC Care',
      role: 'PROVIDER',
    });
    if (!followRes.following) {
      throw new Error(`Toggle follow failed`);
    }

    // Direct DB SQL checks
    const postSql = await dbService.query('SELECT * FROM feed_posts WHERE id = $1', [testPostId]);
    if (postSql.rows.length === 0 || Number(postSql.rows[0].likes_count) !== 1) {
      throw new Error(`feed_posts table does not reflect like count of 1`);
    }

    const commentSql = await dbService.query('SELECT * FROM feed_comments WHERE post_id = $1', [testPostId]);
    if (commentSql.rows.length === 0) {
      throw new Error(`feed_comments table does not have inserted comment`);
    }
  });

  // -------------------------------------------------------------
  // TEST 8: IDEMPOTENCY
  // -------------------------------------------------------------
  await runTest(8, 'IDEMPOTENT OPERATIONS & RE-EXECUTION SAFETY', async () => {
    // 1. Re-running user creation with same phone or id should not crash or duplicate
    const existingUser = await userRepository.findById('user-admin');
    if (!existingUser) throw new Error('user-admin seed not found');

    const beforeCountRes = await dbService.query('SELECT COUNT(*) as count FROM users');
    const beforeCount = parseInt(beforeCountRes.rows[0].count, 10);

    // Call seedUsersIfEmpty again
    await userRepository.seedUsersIfEmpty();

    const afterCountRes = await dbService.query('SELECT COUNT(*) as count FROM users');
    const afterCount = parseInt(afterCountRes.rows[0].count, 10);

    if (beforeCount !== afterCount) {
      throw new Error(`seedUsersIfEmpty is not idempotent! Count grew from ${beforeCount} to ${afterCount}`);
    }

    // 2. Re-running category seeding should be idempotent
    await catalogRepository.seedCategoriesIfEmpty();
    const catCountRes = await dbService.query('SELECT COUNT(*) as count FROM service_categories');
    const catCount = parseInt(catCountRes.rows[0].count, 10);
    if (catCount === 0) {
      throw new Error('Categories count is 0 after idempotent seeding check');
    }
  });

  // -------------------------------------------------------------
  // TEST 9: TRANSACTIONS
  // -------------------------------------------------------------
  await runTest(9, 'ACID TRANSACTION ATOMICITY & ROLLBACK', async () => {
    const testRollbackId = `req-rollback-${Date.now()}`;

    // Test Rollback: Insert in transaction then throw error
    let rollbackThrew = false;
    try {
      await dbService.transaction(async (client) => {
        await client.query(
          `INSERT INTO service_requests (
            id, customer_id, customer_name, customer_phone, category_id, title,
            description, district, area, budget, status, created_at, updated_at
          ) VALUES ($1, 'user-customer-1', 'Tahsin Ahmed', '+8801819876543', 'cat-ac-repair',
                    'Intentional Rollback Test', 'Desc', 'Dhaka', 'Mirpur', 1000, 'ADMIN_REVIEW', NOW(), NOW())`,
          [testRollbackId]
        );

        // Force intentional error inside transaction
        throw new Error('INTENTIONAL_TRANSACTION_ROLLBACK');
      });
    } catch (err: any) {
      if (err.message === 'INTENTIONAL_TRANSACTION_ROLLBACK') {
        rollbackThrew = true;
      } else {
        throw err;
      }
    }

    if (!rollbackThrew) {
      throw new Error('Transaction block did not throw expected intentional error');
    }

    // Verify row does NOT exist in database (must have rolled back)
    const checkRollback = await dbService.query('SELECT * FROM service_requests WHERE id = $1', [testRollbackId]);
    if (checkRollback.rows.length > 0) {
      throw new Error(`CRITICAL: Transaction rollback failed! Uncommitted row ${testRollbackId} was persisted.`);
    }

    // Test Commit: Multi-table atomic commit
    const commitId1 = `tx-c1-${Date.now()}`;
    const commitId2 = `tx-c2-${Date.now()}`;
    await dbService.transaction(async (client) => {
      await client.query(
        `INSERT INTO service_categories (id, name_en, name_bn, slug, icon, display_order, is_active, created_at, updated_at)
         VALUES ($1, 'Tx Category 1', 'টিএক্স ক্যাটাগরি ১', $2, 'Star', 999, true, NOW(), NOW())`,
        [commitId1, `tx-cat-${Date.now()}-1`]
      );
      await client.query(
        `INSERT INTO service_categories (id, name_en, name_bn, slug, icon, display_order, is_active, created_at, updated_at)
         VALUES ($1, 'Tx Category 2', 'টিএক্স ক্যাটাগরি ২', $2, 'Star', 999, true, NOW(), NOW())`,
        [commitId2, `tx-cat-${Date.now()}-2`]
      );
    });

    // Verify both rows were committed
    const verifyCommit = await dbService.query(
      'SELECT id FROM service_categories WHERE id IN ($1, $2)',
      [commitId1, commitId2]
    );
    if (verifyCommit.rows.length !== 2) {
      throw new Error(`Transaction atomic commit failed: expected 2 rows, found ${verifyCommit.rows.length}`);
    }

    // Cleanup tx categories
    await dbService.query('DELETE FROM service_categories WHERE id IN ($1, $2)', [commitId1, commitId2]);
  });

  // -------------------------------------------------------------
  // TEST 10: CONSTRAINTS
  // -------------------------------------------------------------
  await runTest(10, 'DATABASE CONSTRAINTS INTEGRITY ENFORCEMENT', async () => {
    // 1. Test unique phone constraint on users
    let uniqueConstraintCaught = false;
    try {
      // Attempt to insert duplicate phone directly
      await dbService.query(
        `INSERT INTO users (id, full_name, phone, role, created_at, updated_at)
         VALUES ($1, 'Duplicate Phone User', '+8801644985301', 'CUSTOMER', NOW(), NOW())`,
        [`user-dup-${Date.now()}`]
      );
    } catch (err: any) {
      // Postgres unique_violation code is '23505'
      if (err.code === '23505' || err.message?.includes('duplicate key') || err.message?.includes('unique')) {
        uniqueConstraintCaught = true;
      } else {
        throw err;
      }
    }

    if (!uniqueConstraintCaught) {
      throw new Error('Database allowed duplicate user phone number without throwing unique constraint error!');
    }

    // 2. Test check constraint on orders status
    let checkConstraintCaught = false;
    try {
      await dbService.query(
        `INSERT INTO orders (
          id, order_number, customer_name, customer_phone, shipping_address,
          district, area, items, subtotal, total_amount, order_status, created_at, updated_at
        ) VALUES (
          $1, $2, 'Test', '+8801700000000', 'Address', 'Dhaka', 'Mirpur', '[]'::jsonb, 100, 100,
          'INVALID_STATUS_XYZ', NOW(), NOW()
        )`,
        [`ord-inv-${Date.now()}`, `ORD-INV-${Date.now()}`]
      );
    } catch (err: any) {
      // Postgres check_violation code is '23514'
      if (err.code === '23514' || err.message?.includes('check constraint') || err.message?.includes('violates')) {
        checkConstraintCaught = true;
      } else {
        throw err;
      }
    }

    if (!checkConstraintCaught) {
      throw new Error('Database allowed invalid order status without throwing check constraint error!');
    }
  });

  // -------------------------------------------------------------
  // FINAL SUMMARY
  // -------------------------------------------------------------
  console.log('\n=================================================================');
  console.log('INTEGRATION TEST SUMMARY:');
  console.log('=================================================================');
  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`TEST ${r.testNumber.toString().padStart(2, ' ')}: [${status}] ${r.name} (${r.durationMs}ms)`);
    if (!r.passed) {
      allPassed = false;
      console.log(`         Error: ${r.message}`);
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  console.log(`\nRESULT: ${passedCount}/${results.length} TESTS PASSED.`);

  if (!allPassed) {
    console.error('\nFAIL: One or more integration tests failed!');
    process.exit(1);
  } else {
    console.log('\nSUCCESS: ALL 10 PHASE 1 INTEGRATION TESTS PASSED!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
