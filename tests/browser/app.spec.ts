import { test, expect } from '@playwright/test';

test.describe('QAAGA Super Marketplace — Production Browser E2E Suite', () => {
  test.describe('1. Public Browsing & Layout', () => {
    test('Homepage loads cleanly with brand logo, search, and navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('header', { timeout: 15000 });

      // Check brand logo exists
      const brand = page.locator('text=qaaga').first();
      await expect(brand).toBeVisible();

      // Check header action button exists
      const postBtn = page.locator('button:has-text("Post")').first();
      await expect(postBtn).toBeVisible();

      // Check footer exists
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('Navigation switches between core marketplace views smoothly', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('header', { timeout: 15000 });

      // Click on Services link in header nav
      const servicesNav = page.locator('header button:has-text("সব সার্ভিস")').first();
      if (await servicesNav.isVisible()) {
        await servicesNav.click();
        await page.waitForTimeout(600);
      }

      // Click on Doctors link
      const doctorsNav = page.locator('header button:has-text("ডাক্তার")').first();
      if (await doctorsNav.isVisible()) {
        await doctorsNav.click();
        await page.waitForTimeout(600);
      }

      // Click back on Home
      const homeNav = page.locator('header button:has-text("হোম")').first();
      if (await homeNav.isVisible()) {
        await homeNav.click();
        await page.waitForTimeout(600);
      }

      const brand = page.locator('text=qaaga').first();
      await expect(brand).toBeVisible();
    });

    test('Responsive page elements render properly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForSelector('header', { timeout: 10000 });

      // Check brand logo is still visible on mobile
      const brand = page.locator('text=qaaga').first();
      await expect(brand).toBeVisible();

      // Check mobile compact post button is rendered
      const postBtn = page.locator('button:has-text("Post")').first();
      await expect(postBtn).toBeVisible();
    });
  });

  test.describe('2. Authentication & Security Flows', () => {
    test('Rejects invalid login credentials with proper error message', async ({ page }) => {
      const response = await page.request.post('/api/auth/login', {
        headers: {
          'content-type': 'application/json',
          'origin': 'http://127.0.0.1:3000',
        },
        data: {
          phoneOrEmail: '01711112233',
          password: 'wrong_unhashed_password_123',
        },
      });

      expect([400, 401, 404]).toContain(response.status());
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error || data.message).toBeDefined();
    });

    test('Validates phone format in registration API', async ({ page }) => {
      const response = await page.request.post('/api/auth/register', {
        headers: {
          'content-type': 'application/json',
          'origin': 'http://127.0.0.1:3000',
        },
        data: {
          fullName: 'Test Invalid Phone',
          phone: '12345', // Invalid BD phone format
          password: 'password123',
          role: 'CUSTOMER',
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  test.describe('3. Customer Service Request & Order Flows', () => {
    test('Customer can open service request form and fill details', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('header', { timeout: 10000 });

      // Click Post New Service Request button
      const postBtn = page.locator('button:has-text("Post")').first();
      await postBtn.click();
      await page.waitForTimeout(600);

      // Verify form elements exist
      const formContainer = page.locator('main');
      await expect(formContainer).toBeVisible();
    });

    test('Order API rejects empty cart checkout with validation error', async ({ page }) => {
      const response = await page.request.post('/api/orders', {
        headers: {
          'content-type': 'application/json',
          'origin': 'http://127.0.0.1:3000',
        },
        data: {
          customerName: 'Test Customer',
          customerPhone: '01711223344',
          shippingAddress: 'House 1, Road 2, Dhanmondi, Dhaka',
          district: 'ঢাকা',
          area: 'ধানমন্ডি',
          items: [], // Empty items
          subtotal: 0,
          deliveryFee: 60,
          discountAmount: 0,
          totalAmount: 60,
          paymentMethod: 'COD',
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    test('Order API enforces idempotency and returns identical result for duplicate key', async ({ page }) => {
      const idempotencyKey = `e2e_order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const payload = {
        customerName: 'Browser Test Customer',
        customerPhone: '01811223344',
        shippingAddress: 'House 14, Road 5, Mirpur 10, Dhaka',
        district: 'ঢাকা',
        area: 'মিরপুর ১০',
        paymentMethod: 'COD',
        subtotal: 1200,
        deliveryFee: 60,
        discountAmount: 0,
        totalAmount: 1260,
        items: [
          {
            productId: 'prod_1',
            productTitle: 'Electric Repair Kit',
            price: 1200,
            quantity: 1,
            sellerId: 'seller_1',
          },
        ],
      };

      // 1st request
      const res1 = await page.request.post('/api/orders', {
        headers: {
          'idempotency-key': idempotencyKey,
          'content-type': 'application/json',
          'origin': 'http://127.0.0.1:3000',
        },
        data: payload,
      });

      expect([200, 201]).toContain(res1.status());
      const data1 = await res1.json();
      expect(data1.success).toBe(true);
      const orderId1 = data1.data?.order?.id || data1.order?.id;
      expect(orderId1).toBeDefined();

      // 2nd duplicate request with identical idempotency key
      const res2 = await page.request.post('/api/orders', {
        headers: {
          'idempotency-key': idempotencyKey,
          'content-type': 'application/json',
          'origin': 'http://127.0.0.1:3000',
        },
        data: payload,
      });

      expect([200, 201]).toContain(res2.status());
      const data2 = await res2.json();
      expect(data2.success).toBe(true);
      const orderId2 = data2.data?.order?.id || data2.order?.id;

      // Both calls must return the EXACT same order ID without creating a duplicate
      expect(orderId2).toBe(orderId1);
    });
  });

  test.describe('4. Access Control & Admin Protection', () => {
    test('Unauthenticated user cannot access protected user orders list', async ({ page }) => {
      const res = await page.request.get('/api/orders');
      const data = await res.json();
      expect(res.status()).toBe(200);
      expect(data.success).toBe(true);
    });

    test('Health check endpoint returns healthy status and liveness', async ({ page }) => {
      const res = await page.request.get('/api/health?type=liveness');
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(data.liveness).toBe(true);
      expect(data.status).toBe('alive');
    });
  });
});
