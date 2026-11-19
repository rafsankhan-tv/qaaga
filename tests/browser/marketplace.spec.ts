import { test, expect, type Page } from '@playwright/test';

const SUPABASE_REST = /\/rest\/v1\/(?:public_)?properties(?:\?|$)/;
const FIXTURE_TITLE = 'QAAGA Playwright Test Apartment in Gulshan';
const FIXTURE_IMAGE = '/assets/aistudio/Screenshot_2026-11-04_at_2.55.29_AM_bd5ef49c.png';

const listingFixture = {
  id: 'qaaga-playwright-gulshan-fixture',
  host_email: 'playwright-host@example.test',
  host_name: 'QAAGA Test Host',
  title: FIXTURE_TITLE,
  description: 'Automated browser fixture. This is not a production listing.',
  property_type: 'Apartment',
  room_type: 'Entire place',
  category: 'stay',
  city: 'Dhaka',
  area: 'Gulshan',
  two_night_price_usd: 200,
  price_daily: 100,
  currency: 'USD',
  max_guests: 4,
  bedrooms: '2 bedrooms',
  bathrooms: 1,
  beds: 2,
  rating: 4.9,
  reviews_count: 0,
  guest_favorite: false,
  in_popular_kl: false,
  is_featured: false,
  status: 'active',
  image: FIXTURE_IMAGE,
  gallery: [FIXTURE_IMAGE],
  amenities: ['Wi-Fi', 'Air conditioning'],
};

async function mockPublicListingRead(page: Page) {
  await page.route(SUPABASE_REST, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Content-Range': '0-0/1' },
      body: JSON.stringify([listingFixture]),
    });
  });
}

test.describe('QAAGA public marketplace', () => {
  test('home and Dhaka room routes render without legacy Malaysia copy', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto('/');
    await expect(page).toHaveTitle(/QAAGA/);
    await expect(page.getByRole('button', { name: 'Create new listing' }).first()).toBeVisible();

    const homeHtml = await page.locator('body').innerText();
    expect(homeHtml).not.toContain('Kuala Lumpur');
    expect(homeHtml).not.toContain('Bukit Bintang');

    await page.goto('/rooms');
    await expect(page).toHaveTitle(/Rooms & Stays in Dhaka/);
    await expect(page.getByRole('heading', { name: 'Stays in Dhaka' })).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('desktop destination search, weekend calendar, guest counter and submit interaction work', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await page.getByTestId('search-where-segment').click();
    const destinationInput = page.getByPlaceholder('Search destinations in Dhaka');
    await expect(destinationInput).toBeVisible();
    await destinationInput.fill('Gulshan');
    const gulshanOption = page.getByTestId('destination-option-gulshan');
    await expect(gulshanOption).toBeVisible();
    await gulshanOption.click();
    await expect(destinationInput).toHaveCount(0);

    await page.getByTestId('search-when-segment').click();
    const weekendPreset = page.getByRole('button', { name: 'This weekend' });
    await expect(weekendPreset).toBeVisible();
    await expect(weekendPreset).toBeEnabled();
    await expect(page.getByTestId('calendar-preset-one-night')).toBeVisible();
    await expect(page.getByTestId('calendar-preset-15-nights')).toBeVisible();
    await expect(page.getByTestId('calendar-preset-30-nights')).toBeVisible();
    const weekendRange = await page.getByTestId('calendar-preset-weekend').evaluate((element) => ({
      checkIn: element.getAttribute('data-check-in') || '',
      checkOut: element.getAttribute('data-check-out') || '',
    }));
    const dhakaToday = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    expect(weekendRange.checkIn >= dhakaToday).toBe(true);
    expect(weekendRange.checkOut > weekendRange.checkIn).toBe(true);
    await weekendPreset.click();

    await expect(page.getByText('Guests & Travelers')).toBeVisible();
    await page.getByRole('button', { name: 'Increase Adults' }).click();
    await expect(page.getByTestId('guest-summary')).toHaveText('2 guests');

    await page.getByRole('button', { name: 'Search' }).last().click();
    await expect(page).toHaveURL(/where=Gulshan/);
    await expect(page).toHaveURL(/checkIn=/);
    await expect(page).toHaveURL(/checkOut=/);
    await expect(page).toHaveURL(/adults=2/);
    await expect(page.getByRole('heading', { name: /Search results/ })).toBeVisible();
  });

  test('mobile search sheet supports destination, date, guest tabs and escape dismissal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(350);

    const compactSearch = page.getByTestId('compact-search-pill');
    await expect(compactSearch).toBeVisible();
    await compactSearch.click();
    await expect(page.getByText('Search QAAGA Stays')).toBeVisible();

    await page.getByRole('button', { name: /Where/ }).last().click();
    const destinationInput = page.getByPlaceholder('Search destinations in Dhaka');
    await expect(destinationInput).toBeVisible();
    await destinationInput.fill('Banani');
    await page.getByRole('button', { name: /^Banani/ }).click();

    await page.getByRole('button', { name: /When/ }).last().click();
    await expect(page.getByRole('button', { name: 'This weekend' })).toBeVisible();
    await page.getByRole('button', { name: 'This weekend' }).click();

    await expect(page.getByText('Guests & Travelers')).toBeVisible();
    await page.getByRole('button', { name: 'Increase Children' }).click();
    await expect(page.getByTestId('guest-summary')).toHaveText('2 guests');

    await page.keyboard.press('Escape');
    await expect(page.getByText('Search QAAGA Stays')).toHaveCount(0);
  });

  test('listing card hover response and detail modal work using an isolated fixture', async ({ page }) => {
    await mockPublicListingRead(page);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/properties');

    const detailButton = page.getByRole('button', {
      name: 'View details for ' + FIXTURE_TITLE,
    });
    await expect(detailButton).toBeVisible();

    const card = page.locator('article').filter({ has: detailButton }).first();
    const image = card.locator('img').first();
    const beforeY = (await card.boundingBox())?.y;
    expect(beforeY).not.toBeUndefined();
    await card.hover();
    await expect.poll(async () => (await card.boundingBox())?.y ?? beforeY!).toBeLessThan(beforeY!);

    await detailButton.click();
    await expect(page.getByRole('heading', { name: FIXTURE_TITLE })).toBeVisible();
    await expect(page.getByText('What this place offers')).toBeVisible();
    await page.getByRole('button', { name: 'Close modal' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('sticky navigation stays at the top after scrolling and respects reduced motion', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 850 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(100);

    const stickyHeader = page.locator('.sticky.top-0').first();
    await expect(stickyHeader).toBeVisible();
    const box = await stickyHeader.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(box!.y)).toBeLessThanOrEqual(2);

    const reducedMotionState = await page.evaluate(() => ({
      lenisPresent: Boolean((window as Window & { __lenis?: unknown }).__lenis),
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    }));
    expect(reducedMotionState.lenisPresent).toBe(false);
    expect(reducedMotionState.scrollBehavior).toBe('auto');
  });
});

test.describe('QAAGA API and access-control smoke tests', () => {
  test('health, public listings and branding endpoints respond with safe empty states', async ({ request }) => {
    const health = await request.get('/api/health');
    expect(health.status()).toBe(200);
    expect((await health.json()).status).toBe('ok');

    const listings = await request.get('/api/listings');
    expect(listings.status()).toBe(200);
    const listingData = await listings.json();
    expect(Array.isArray(listingData.listings)).toBe(true);
    expect(['ok', 'empty']).toContain(listingData.status);

    const branding = await request.get('/api/branding');
    expect(branding.status()).toBe(200);
    expect((await branding.json()).branding).toBeTruthy();
  });

  test('booking, messaging, review, upload and branding writes reject unauthenticated requests', async ({ request }) => {
    const responses = await Promise.all([
      request.get('/api/bookings'),
      request.get('/api/messages'),
      request.post('/api/bookings', { data: { listingId: 'unauthorized', checkInDate: '2099-01-01', checkOutDate: '2099-01-02', guests: 1 } }),
      request.post('/api/messages', { data: { threadId: 'unauthorized', text: 'not allowed' } }),
      request.post('/api/reviews', { data: { listingId: 'unauthorized', rating: 5, comment: 'not allowed' } }),
      request.post('/api/upload', { data: { file: 'not an upload' } }),
      request.put('/api/branding', { data: { altText: 'unauthorized change' } }),
    ]);

    for (const response of responses) {
      expect(response.status()).toBe(401);
    }
  });

  test('host and customer dashboard routes render without throwing', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    for (const path of ['/host/dashboard', '/user/dashboard', '/admin/dashboard']) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('body')).not.toBeEmpty();
    }

    expect(pageErrors).toEqual([]);
  });
});
