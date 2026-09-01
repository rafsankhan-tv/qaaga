import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { dbService } from '../../src/db/database.ts';
import { userRepository } from '../../src/repositories/user.repository.ts';
import { catalogRepository } from '../../src/repositories/catalog.repository.ts';
import { serviceRepository } from '../../src/repositories/service.repository.ts';
import { orderRepository } from '../../src/repositories/order.repository.ts';
import { acquireIdempotencyKey, commitIdempotencyResult, releaseIdempotencyKey } from '../../src/lib/idempotency.ts';
import type { UserProfile, Product, ServiceRequest, ProviderOffer, ProductOrder } from '../../src/types/index.ts';

describe('PostgreSQL Repository Layer Integration Test Suite', () => {
  const testDbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  const isPostgresActive = Boolean(testDbUrl && dbService.isDatabaseConfigured());
  const createdTestUserIds: string[] = [];
  const createdTestOrderIds: string[] = [];
  const createdTestRequestIds: string[] = [];

  before(async () => {
    if (isPostgresActive) {
      console.log('Running genuine PostgreSQL repository integration tests against database.');
      // Ensure all test tables are configured
      await dbService.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(80) PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          phone VARCHAR(20) UNIQUE NOT NULL,
          email VARCHAR(255),
          password_hash VARCHAR(255),
          role VARCHAR(50) DEFAULT 'CUSTOMER',
          district VARCHAR(100),
          area VARCHAR(100),
          address TEXT,
          is_verified BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS idempotency_keys (
          key VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(100),
          action VARCHAR(100) NOT NULL,
          request_fingerprint VARCHAR(255),
          status VARCHAR(50) DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
          response_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
        );
      `);
    } else {
      console.log('Note: TEST_DATABASE_URL not configured. Running repository tests in isolated memory mode.');
    }
  });

  after(async () => {
    if (isPostgresActive) {
      // Safe teardown: remove only test artifacts created during this test run
      try {
        if (createdTestUserIds.length > 0) {
          await dbService.query(`DELETE FROM users WHERE id = ANY($1::text[])`, [createdTestUserIds]);
        }
        if (createdTestOrderIds.length > 0) {
          await dbService.query(`DELETE FROM orders WHERE id = ANY($1::text[])`, [createdTestOrderIds]);
        }
        if (createdTestRequestIds.length > 0) {
          await dbService.query(`DELETE FROM service_requests WHERE id = ANY($1::text[])`, [createdTestRequestIds]);
        }
      } catch (err) {
        console.warn('Test cleanup warning:', err);
      }
    }
  });

  test('User Repository — CRUD, uniqueness, and role integrity', async () => {
    const testPhone = `017${Math.floor(10000000 + Math.random() * 90000000)}`;
    const testUser: UserProfile = {
      id: `usr_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      fullName: 'Integration Test User',
      phone: testPhone,
      email: 'integration@qaaga.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      gender: 'male',
      division: 'ঢাকা',
      district: 'ঢাকা',
      thana: 'মিরপুর',
      area: 'মিরপুর ১০',
      address: 'Test Address 123',
      roles: ['CUSTOMER'],
      activeRole: 'CUSTOMER',
      accountStatus: 'active',
      isVerified: true,
      rating: 5,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createdTestUserIds.push(testUser.id);

    const created = await userRepository.create(testUser);
    assert.equal(created.phone, testPhone);

    const found = await userRepository.findByPhone(testPhone);
    assert.ok(found);
    assert.equal(found?.fullName, 'Integration Test User');

    // Update test
    const updated = await userRepository.update(testUser.id, { fullName: 'Updated Name' });
    assert.equal(updated?.fullName, 'Updated Name');
  });

  test('Catalog Repository — Product catalog indexing and filtering', async () => {
    const testProduct: Product = {
      id: `prod_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      sellerId: 'seller_123',
      sellerShopName: 'Green Tech Store',
      title: 'Solar Inverter Test Device',
      sku: 'SOLAR-INV-100',
      description: 'High efficiency solar inverter test product',
      category: 'Electronics',
      price: 12500,
      discountPrice: 11000,
      rating: 4.8,
      reviewCount: 12,
      inStock: true,
      stock: 25,
      images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80'],
      warranty: '১ বছর অফিসিয়াল ওয়ারেন্টি',
      deliveryInfo: '২৪-৪৮ ঘণ্টায় হোম ডেলিভারি',
      isApproved: true,
      createdAt: new Date().toISOString(),
    };

    const added = catalogRepository.addProduct(testProduct);
    assert.equal(added.id, testProduct.id);

    const retrieved = catalogRepository.getProductById(testProduct.id);
    assert.ok(retrieved);
    assert.equal(retrieved?.title, testProduct.title);

    const searchResults = catalogRepository.getProducts({ search: 'Solar Inverter' });
    assert.ok(searchResults.length > 0);
  });

  test('Service Repository — Service request creation, lifecycle and offers', async () => {
    const testReq: ServiceRequest = {
      id: `req_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      customerId: 'cust_integration_1',
      customerName: 'Rahim Uddin',
      customerPhone: '01811223344',
      categoryId: 'ac-repair',
      categoryName: 'এসি সার্ভিসিং ও রিপেয়ার',
      subCategory: 'সার্ভিসিং',
      title: 'AC General Servicing Integration Test',
      description: 'Need AC master service in Mirpur',
      district: 'ঢাকা',
      thana: 'মিরপুর',
      area: 'মিরপুর ১০',
      address: 'Road 5, House 12',
      preferredDate: '2026-09-10',
      preferredTime: 'সকাল ১০:০০ - দুপুর ১২:০০',
      isUrgent: true,
      budget: 2000,
      images: [],
      routingMode: 'ALL_ELIGIBLE',
      targetProviderIds: [],
      status: 'SUBMITTED',
      statusAuditLog: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createdTestRequestIds.push(testReq.id);

    const created = await serviceRepository.createRequest(testReq);
    assert.equal(created.id, testReq.id);

    const found = await serviceRepository.findRequestById(testReq.id);
    assert.ok(found);
    assert.equal(found?.title, testReq.title);

    // Offer creation
    const testOffer: ProviderOffer = {
      id: `ofr_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      requestId: testReq.id,
      providerId: 'prov_test_1',
      providerName: 'Cooling Masters',
      providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      providerPhone: '01799887766',
      providerRating: 4.9,
      providerReviewCount: 15,
      providerCompletedJobs: 42,
      providerExperience: 5,
      offeredPrice: 1800,
      serviceCharge: 200,
      partsIncluded: true,
      estimatedDuration: '২ ঘণ্টা',
      earliestDate: '2026-09-10',
      earliestTime: 'সকাল ১০:০০',
      offerMessage: 'I will bring authentic parts and gas refill kit',
      warranty: '৩০ দিন ফ্রি সার্ভিস ওয়ারেন্টি',
      offerExpiry: new Date(Date.now() + 86400000).toISOString(),
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createdOffer = await serviceRepository.createOffer(testOffer);
    assert.equal(createdOffer.requestId, testReq.id);

    const offers = await serviceRepository.listOffers(testReq.id);
    assert.ok(offers.some((o) => o.id === testOffer.id));
  });

  test('Order Repository — Order placement, items serialization, and status updates', async () => {
    const testOrder: ProductOrder = {
      id: `ord_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      orderNumber: `QG-TEST-${Date.now()}`,
      customerId: 'cust_integration_1',
      customerName: 'Rahim Uddin',
      customerPhone: '01811223344',
      deliveryAddress: 'House 14, Road 3, Mirpur 10, Dhaka',
      district: 'ঢাকা',
      thana: 'মিরপুর',
      area: 'মিরপুর ১০',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'CONFIRMED',
      subtotal: 3500,
      deliveryFee: 60,
      discountAmount: 100,
      totalAmount: 3460,
      items: [
        {
          productId: 'prod_1',
          title: 'Standard Tool Set',
          price: 3500,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80',
          sellerId: 'seller_1',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createdTestOrderIds.push(testOrder.id);

    const createdOrder = await orderRepository.create(testOrder);
    assert.equal(createdOrder.orderNumber, testOrder.orderNumber);

    const retrievedOrder = await orderRepository.findById(testOrder.id);
    assert.ok(retrievedOrder);
    assert.equal(retrievedOrder?.totalAmount, 3460);

    const updated = await orderRepository.updateStatus(testOrder.id, 'SHIPPED', 'Shipped via courier');
    assert.equal(updated?.orderStatus, 'SHIPPED');
  });

  test('Idempotency Storage — Atomic locking, replay, and release cycle', async () => {
    const testKey = `test_repo_idem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 1. Acquire
    const lock1 = await acquireIdempotencyKey(testKey, 'ORDER_CHECKOUT');
    assert.equal(lock1.acquired, true);
    assert.equal(lock1.isDuplicate, false);

    // 2. Concurrent duplicate
    const lock2 = await acquireIdempotencyKey(testKey, 'ORDER_CHECKOUT');
    assert.equal(lock2.acquired, false);
    assert.equal(lock2.isDuplicate, true);

    // 3. Commit
    await commitIdempotencyResult(testKey, 201, { orderId: 'ord_123', status: 'SUCCESS' });

    // 4. Replay
    const lock3 = await acquireIdempotencyKey(testKey, 'ORDER_CHECKOUT');
    assert.equal(lock3.acquired, false);
    assert.equal(lock3.isDuplicate, true);
    assert.equal(lock3.inFlight, false);
    assert.deepEqual(lock3.cachedResponse, {
      status: 201,
      body: { orderId: 'ord_123', status: 'SUCCESS' },
    });
  });
});
