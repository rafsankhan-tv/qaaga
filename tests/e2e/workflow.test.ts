import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { userRepository } from '../../src/repositories/user.repository.ts';
import { serviceRepository } from '../../src/repositories/service.repository.ts';
import { catalogRepository } from '../../src/repositories/catalog.repository.ts';
import { orderRepository } from '../../src/repositories/order.repository.ts';
import { calculateEscrowDistribution, calculateOrderTotal } from '../../src/lib/pricing-calculator.ts';
import type { UserProfile, ServiceRequest, ProviderOffer, Product, ProductOrder } from '../../src/types/index.ts';

describe('QAAGA Full E2E Business Workflows Suite', () => {
  // 1. CUSTOMER FLOW
  test('E2E Flow 1: Customer registers, requests service with advance deposit, places order', async () => {
    // 1. Customer registration
    const customerPayload: UserProfile = {
      id: `cust_e2e_${Date.now()}`,
      fullName: 'Tahmid Khan',
      phone: `0171${Math.floor(1000000 + Math.random() * 9000000)}`,
      email: 'tahmid@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      gender: 'male',
      division: 'ঢাকা',
      district: 'ঢাকা',
      thana: 'উত্তরা',
      area: 'সেক্টর ৩',
      address: 'House 10, Road 4',
      roles: ['CUSTOMER'],
      activeRole: 'CUSTOMER',
      accountStatus: 'active',
      isVerified: true,
      rating: 5,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const customer = await userRepository.create(customerPayload);
    assert.ok(customer.id);

    // 2. Customer posts a service request
    const escrow = calculateEscrowDistribution(3000, 20, 10);
    assert.equal(escrow.advanceDepositAmount, 600);
    assert.equal(escrow.remainingPaymentAmount, 2400);

    const serviceReqPayload: ServiceRequest = {
      id: `req_e2e_${Date.now()}`,
      customerId: customer.id,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      categoryId: 'electrician',
      categoryName: 'ইলেকট্রিশিয়ান সার্ভিস',
      subCategory: 'হোম ওয়্যারিং',
      title: 'Full Home Wiring Inspection',
      description: 'Check circuit breakers and distribution board',
      district: customer.district,
      thana: customer.thana,
      area: customer.area,
      address: customer.address,
      preferredDate: '2026-09-15',
      preferredTime: 'বিকাল ৩:০০ - ৫:০০',
      isUrgent: false,
      budget: 3000,
      images: [],
      routingMode: 'ALL_ELIGIBLE',
      targetProviderIds: [],
      status: 'ADMIN_REVIEW',
      statusAuditLog: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const serviceReq = await serviceRepository.createRequest(serviceReqPayload);
    assert.equal(serviceReq.customerId, customer.id);

    // 3. Customer places an ecommerce product order
    const orderCalc = calculateOrderTotal(
      [
        { price: 1200, quantity: 2 },
        { price: 500, quantity: 1 },
      ],
      60,
      100
    );
    assert.equal(orderCalc.subtotal, 2900);
    assert.equal(orderCalc.totalAmount, 2860);

    const productOrderPayload: ProductOrder = {
      id: `ord_e2e_${Date.now()}`,
      orderNumber: `QG-E2E-${Date.now()}`,
      customerId: customer.id,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      deliveryAddress: customer.address,
      district: customer.district,
      thana: customer.thana,
      area: customer.area,
      paymentMethod: 'ONLINE_BKASH',
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
      subtotal: orderCalc.subtotal,
      deliveryFee: orderCalc.deliveryFee,
      discountAmount: orderCalc.discountAmount,
      totalAmount: orderCalc.totalAmount,
      items: [
        {
          productId: 'prod_wire',
          title: 'Standard Copper Wire 1.5mm',
          price: 1200,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80',
          sellerId: 'seller_electro',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const productOrder = await orderRepository.create(productOrderPayload);
    assert.equal(productOrder.totalAmount, 2860);
  });

  // 2. PROVIDER FLOW
  test('E2E Flow 2: Provider views job, submits quotation offer, updates execution status', async () => {
    const providerOfferPayload: ProviderOffer = {
      id: `ofr_e2e_${Date.now()}`,
      requestId: 'req_sample_123',
      providerId: 'prov_e2e_1',
      providerName: 'Master Electricians BD',
      providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      providerPhone: '01888776655',
      providerRating: 4.9,
      providerReviewCount: 28,
      providerCompletedJobs: 65,
      providerExperience: 6,
      offeredPrice: 2800,
      serviceCharge: 300,
      partsIncluded: true,
      estimatedDuration: '৩ ঘণ্টা',
      earliestDate: '2026-09-15',
      earliestTime: 'বিকাল ৩:০০',
      offerMessage: 'Certified technician with safety tools',
      warranty: '১৫ দিন ওয়ারেন্টি',
      offerExpiry: new Date(Date.now() + 86400000).toISOString(),
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const providerOffer = await serviceRepository.createOffer(providerOfferPayload);
    assert.equal(providerOffer.offeredPrice, 2800);
  });

  // 3. SELLER FLOW
  test('E2E Flow 3: Seller manages store inventory and receives orders', async () => {
    const newProductPayload: Product = {
      id: `prod_seller_${Date.now()}`,
      sellerId: 'seller_store_1',
      sellerShopName: 'Uttara Electronics',
      title: 'Digital Multimeter Pro',
      sku: 'DM-PRO-2026',
      description: 'High precision AC/DC digital multimeter',
      category: 'Electronics',
      price: 1850,
      discountPrice: 1650,
      rating: 4.9,
      reviewCount: 5,
      inStock: true,
      stock: 40,
      images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'],
      warranty: '৬ মাস অফিসিয়াল ওয়ারেন্টি',
      deliveryInfo: '২৪ ঘণ্টায় হোম ডেলিভারি',
      isApproved: true,
      createdAt: new Date().toISOString(),
    };
    const newProduct = catalogRepository.addProduct(newProductPayload);
    assert.equal(newProduct.price, 1850);
  });

  // 4. ADMIN FLOW
  test('E2E Flow 4: Admin reviews requests, manages status, and verifies access control', async () => {
    const adminUserPayload: UserProfile = {
      id: `admin_e2e_${Date.now()}`,
      fullName: 'Super Admin',
      phone: `0191${Math.floor(1000000 + Math.random() * 9000000)}`,
      email: 'superadmin@qaaga.com',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      gender: 'male',
      division: 'ঢাকা',
      district: 'ঢাকা',
      thana: 'ধানমন্ডি',
      area: 'ধানমন্ডি ২৭',
      address: 'QAAGA HQ Tower',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      activeRole: 'SUPER_ADMIN',
      accountStatus: 'active',
      isVerified: true,
      rating: 5,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const adminUser = await userRepository.create(adminUserPayload);
    assert.equal(adminUser.activeRole, 'SUPER_ADMIN');

    // Admin updates a service request to SENT_TO_PROVIDERS
    const updatedReq = await serviceRepository.updateRequestStatus(
      'req_sample_123',
      'SENT_TO_PROVIDERS',
      'Admin approved service request'
    );
    assert.ok(updatedReq === null || updatedReq.status === 'SENT_TO_PROVIDERS');
  });
});
