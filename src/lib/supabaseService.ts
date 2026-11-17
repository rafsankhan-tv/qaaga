import { getSupabase } from './supabaseClient';
import {
  BookingRecord,
  GuestProfile,
  HostThread,
  ListingReview,
  QaagaListing,
} from '@/data/listings';

/* ========================================================================= */
/* 0. REQUEST DEDUPLICATION & SHORT-TTL RESPONSE CACHE                       */
/* ========================================================================= */
export type FetchStatus = 'ok' | 'empty' | 'error';

export interface ServiceResult<T> {
  data: T;
  status: FetchStatus;
  error?: string;
}

const inFlightRequests = new Map<string, Promise<any>>();
const responseCache = new Map<string, { data: any; timestamp: number }>();

async function dedupFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 15000
): Promise<T> {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data as T;
  }

  const existingPromise = inFlightRequests.get(key);
  if (existingPromise) {
    return existingPromise as Promise<T>;
  }

  const promise = fetcher()
    .then((result) => {
      // Only cache non-error results (or short cache when result isn't an explicit error)
      const isErrorResult =
        result &&
        typeof result === 'object' &&
        'status' in (result as any) &&
        (result as any).status === 'error';
      if (!isErrorResult) {
        responseCache.set(key, { data: result, timestamp: Date.now() });
      }
      return result;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, promise);
  return promise;
}

export function invalidateServiceCache(prefix?: string): void {
  if (!prefix) {
    responseCache.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) {
      responseCache.delete(key);
    }
  }
}

/**
 * Normalizes DB column naming (snake_case) to QaagaListing (camelCase)
 */
function mapDbListingToModel(row: any): QaagaListing {
  return {
    id: String(row.id),
    hostEmail: row.host_email || undefined,
    title: row.title || 'Untitled Listing',
    area: row.area || 'Kuala Lumpur',
    city: row.city || 'Dhaka',
    subType: row.sub_type || row.property_type || 'Apartment',
    category: row.category || 'stay',
    twoNightPriceUsd:
      Number(row.two_night_price_usd) ||
      (Number(row.price_daily) ? Number(row.price_daily) * 2 : 120),
    rating: String(row.rating || '5.0'),
    reviewsCount: Number(row.reviews_count) || 0,
    guestFavorite: Boolean(row.guest_favorite ?? row.is_featured),
    image: row.image || '/assets/kl-ui/kl-1.jpg',
    gallery:
      Array.isArray(row.gallery) && row.gallery.length > 0
        ? row.gallery
        : [row.image || '/assets/kl-ui/kl-1.jpg'],
    maxGuests: Number(row.max_guests) || 2,
    bedrooms: row.bedrooms || '1 bedroom',
    hostName: row.host_name || 'Host',
    hostYears: Number(row.host_years) || 1,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    description: row.description || '',
    inPopularKL: Boolean(row.in_popular_kl),
  };
}

/**
 * Normalizes QaagaListing to DB row (snake_case)
 */
function mapModelToDbListing(model: QaagaListing): Record<string, any> {
  const normalizedType = String(model.subType || '').toLowerCase();
  const propertyType =
    normalizedType.includes('room') ? 'Private Room' :
    normalizedType.includes('studio') ? 'Studio' :
    normalizedType.includes('villa') ? 'Villa' :
    normalizedType.includes('condo') ? 'Sky Condo' :
    normalizedType.includes('suite') ? 'Suite' :
    normalizedType.includes('penthouse') ? 'Penthouse' : 'Apartment';

  return {
    id: model.id,
    host_email: model.hostEmail,
    host_name: model.hostName || 'Host',
    title: model.title,
    description: model.description || '',
    property_type: propertyType,
    room_type: propertyType === 'Private Room' ? 'Private room' : 'Entire place',
    category: model.category,
    city: model.city || 'Dhaka',
    area: model.area,
    two_night_price_usd: model.twoNightPriceUsd,
    price_daily: model.twoNightPriceUsd / 2,
    currency: 'USD',
    max_guests: model.maxGuests || 2,
    bedrooms: model.bedrooms || '1 bedroom',
    bathrooms: 1,
    beds: 1,
    rating: Number(model.rating) || 0,
    reviews_count: model.reviewsCount || 0,
    guest_favorite: Boolean(model.guestFavorite),
    in_popular_kl: Boolean(model.inPopularKL),
    is_featured: Boolean(model.guestFavorite),
    status: 'pending_approval',
    image: model.image,
    gallery: model.gallery?.length ? model.gallery : [model.image],
    amenities: model.amenities || [],
    updated_at: new Date().toISOString(),
  };
}

/* ========================================================================= */
/* 1. LISTINGS DATABASE OPERATIONS (REAL SUPABASE, ZERO FAKE FALLBACKS)      */
/* ========================================================================= */
export async function fetchListingsWithStatus(): Promise<ServiceResult<QaagaListing[]>> {
  return dedupFetch('listings:all', async () => {
    const supabase = getSupabase();
    if (!supabase) {
      return { data: [], status: 'error', error: 'Supabase client is not configured.' };
    }

    try {
      const [listingsRes, propsRes] = await Promise.all([
        supabase.from('listings').select('*').order('created_at', { ascending: false }),
        supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      const mergedMap = new Map<string, QaagaListing>();

      if (!listingsRes.error && Array.isArray(listingsRes.data)) {
        for (const row of listingsRes.data) {
          if (row.is_active === false) continue;
          const mapped = mapDbListingToModel(row);
          mergedMap.set(mapped.id, mapped);
        }
      }

      if (!propsRes.error && Array.isArray(propsRes.data)) {
        for (const row of propsRes.data) {
          const mapped = mapDbListingToModel(row);
          if (!mergedMap.has(mapped.id)) {
            mergedMap.set(mapped.id, mapped);
          }
        }
      }

      if (listingsRes.error && propsRes.error) {
        return {
          data: [],
          status: 'error',
          error: listingsRes.error.message || propsRes.error.message,
        };
      }

      const items = Array.from(mergedMap.values());
      return {
        data: items,
        status: items.length > 0 ? 'ok' : 'empty',
      };
    } catch (err: any) {
      return {
        data: [],
        status: 'error',
        error: err?.message || 'Unable to reach Supabase listings table.',
      };
    }
  });
}

export async function getListingsFromDatabase(): Promise<QaagaListing[]> {
  const res = await fetchListingsWithStatus();
  return res.data;
}

export async function getListingByIdFromDatabase(id: string): Promise<QaagaListing | null> {
  const res = await fetchListingsWithStatus();
  return res.data.find((item) => item.id === id) || null;
}

export async function insertListingToDatabase(
  listing: QaagaListing
): Promise<QaagaListing> {
  invalidateServiceCache('listings:');
  invalidateServiceCache('host_props:');
  invalidateServiceCache('admin:stats');
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const userEmail = authData.user?.email?.trim().toLowerCase();
  if (authError || !userEmail) throw new Error('Please sign in before publishing a listing.');
  if (!listing.hostEmail || listing.hostEmail.trim().toLowerCase() !== userEmail) {
    throw new Error('The listing host must match the signed-in account.');
  }

  const payload = mapModelToDbListing(listing);
  const { data, error } = await supabase
    .from('properties')
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Unable to submit this listing for review.');
  }

  return mapDbListingToModel(data);
}

export async function deleteListingFromDatabase(id: string): Promise<boolean> {
  invalidateServiceCache('listings:');
  invalidateServiceCache('host_props:');
  invalidateServiceCache('admin:stats');
  const supabase = getSupabase();
  if (!supabase) return false;

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return false;

  const { error } = await supabase.from('properties').delete().eq('id', id);
  return !error;
}

/* ========================================================================= */
/* 2. BOOKINGS DATABASE OPERATIONS (REAL SUPABASE)                           */
/* ========================================================================= */
export async function fetchBookingsWithStatus(
  guestEmail?: string
): Promise<ServiceResult<BookingRecord[]>> {
  const cacheKey = `bookings:${guestEmail ? guestEmail.trim().toLowerCase() : 'all'}`;
  return dedupFetch(cacheKey, async () => {
    const supabase = getSupabase();
    if (!supabase) {
      return { data: [], status: 'error', error: 'Supabase client unavailable.' };
    }

    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (guestEmail && guestEmail.trim()) {
        query = query.eq('guest_email', guestEmail.trim().toLowerCase());
      }
      const { data, error } = await query;
      if (error) {
        return { data: [], status: 'error', error: error.message };
      }
      if (!Array.isArray(data) || data.length === 0) {
        return { data: [], status: 'empty' };
      }

      const mapped: BookingRecord[] = data.map((row: any) => ({
        id: row.id,
        confirmationCode: row.confirmation_code,
        listingId: row.listing_id || row.property_id,
        title: row.title,
        area: row.area,
        image: row.image || '/assets/kl-ui/kl-1.jpg',
        checkInLabel: row.check_in_label,
        nights: Number(row.nights) || 2,
        guests: Number(row.guests) || 1,
        totalUsd: Number(row.total_usd) || 100,
        hostName: row.host_name || 'Host',
        status: row.status || 'Confirmed',
      }));
      return { data: mapped, status: 'ok' };
    } catch (err: any) {
      return { data: [], status: 'error', error: err?.message || 'Failed to fetch bookings.' };
    }
  });
}

export async function getBookingsFromDatabase(
  guestEmail?: string
): Promise<BookingRecord[]> {
  const res = await fetchBookingsWithStatus(guestEmail);
  return res.data;
}

export async function insertBookingToDatabase(
  booking: BookingRecord,
  guestEmail: string,
  guestName: string,
  hostEmail: string
): Promise<BookingRecord> {
  invalidateServiceCache('bookings:');
  invalidateServiceCache('host_bookings:');
  invalidateServiceCache('admin:stats');
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const authenticatedEmail = authData.user?.email?.trim().toLowerCase();
  const normalizedGuestEmail = guestEmail.trim().toLowerCase();
  const normalizedHostEmail = hostEmail.trim().toLowerCase();

  if (authError || !authenticatedEmail || authenticatedEmail !== normalizedGuestEmail) {
    throw new Error('Please sign in with your verified email before booking.');
  }
  if (!normalizedHostEmail || !booking.checkInDate || !booking.checkOutDate) {
    throw new Error('A valid host and check-in/check-out date are required.');
  }

  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  if (
    Number.isNaN(checkIn.getTime()) ||
    Number.isNaN(checkOut.getTime()) ||
    checkOut <= checkIn
  ) {
    throw new Error('The selected booking dates are invalid.');
  }

  const payload = {
    id: booking.id,
    confirmation_code: booking.confirmationCode,
    property_id: booking.listingId,
    listing_id: booking.listingId,
    customer_email: authenticatedEmail,
    guest_email: authenticatedEmail,
    customer_name: guestName.trim(),
    guest_name: guestName.trim(),
    title: booking.title,
    area: booking.area,
    image: booking.image,
    host_email: normalizedHostEmail,
    host_name: booking.hostName,
    check_in: booking.checkInDate,
    check_out: booking.checkOutDate,
    check_in_label: booking.checkInLabel,
    nights: booking.nights,
    guests: booking.guests,
    adults: booking.guests,
    total_usd: booking.totalUsd,
    currency: 'USD',
    status: 'Pending',
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Your booking request could not be saved.');
  }

  return {
    ...booking,
    id: data.id,
    status: data.status,
    checkInDate: data.check_in,
    checkOutDate: data.check_out,
  };
}

export async function cancelBookingInDatabase(
  id: string,
  reason?: string
): Promise<boolean> {
  invalidateServiceCache('bookings:');
  invalidateServiceCache('host_bookings:');
  invalidateServiceCache('admin:stats');
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const updatePayload: Record<string, any> = {
      status: 'Cancelled',
      updated_at: new Date().toISOString(),
    };
    if (reason) {
      updatePayload.cancellation_reason = reason;
      updatePayload.cancelled_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/* ========================================================================= */
/* 3. REVIEWS DATABASE OPERATIONS                                            */
/* ========================================================================= */
export async function getReviewsFromDatabase(
  listingId: string
): Promise<ListingReview[]> {
  return dedupFetch(`reviews:${listingId}`, async () => {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((r: any) => ({
          id: String(r.id),
          author: r.author,
          date: new Date(r.created_at).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          }),
          rating: Number(r.rating) || 5,
          comment: r.comment,
        }));
      }
    } catch (err) {
      console.warn('Notice: Supabase reviews query error:', err);
    }

    return [];
  });
}

export async function insertReviewToDatabase(
  listingId: string,
  review: { author: string; rating: number; comment: string }
): Promise<ListingReview> {
  invalidateServiceCache('reviews:' + listingId);
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const authorEmail = authData.user?.email?.trim().toLowerCase();
  if (authError || !authorEmail) throw new Error('Sign in before submitting a review.');

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      property_id: listingId,
      listing_id: listingId,
      author: review.author.trim(),
      author_email: authorEmail,
      rating: review.rating,
      comment: review.comment.trim(),
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Your review could not be saved.');
  }

  return {
    id: String(data.id),
    author: data.author,
    date: new Date(data.created_at).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    rating: Number(data.rating),
    comment: data.comment,
  };
}

/* ========================================================================= */
/* 4. MESSAGES & INBOX OPERATIONS                                            */
/* ========================================================================= */
export async function fetchThreadsWithStatus(): Promise<ServiceResult<HostThread[]>> {
  return dedupFetch('threads:all', async () => {
    const supabase = getSupabase();
    if (!supabase) {
      return { data: [], status: 'error', error: 'Supabase unavailable.' };
    }

    try {
      const { data: threadsData, error } = await supabase
        .from('threads')
        .select('*, messages(*)')
        .order('updated_at', { ascending: false });

      if (error) {
        return { data: [], status: 'error', error: error.message };
      }

      if (!Array.isArray(threadsData) || threadsData.length === 0) {
        return { data: [], status: 'empty' };
      }

      const mapped: HostThread[] = threadsData.map((t: any) => ({
        id: t.id,
        hostName: t.host_name,
        listingTitle: t.listing_title,
        listingImage: t.listing_image || '/assets/kl-ui/kl-1.jpg',
        unread: Boolean(t.unread),
        messages: Array.isArray(t.messages)
          ? t.messages.map((m: any) => ({
              id: m.id,
              sender: m.sender as 'host' | 'guest',
              text: m.text,
              time: m.time,
            }))
          : [],
      }));
      return { data: mapped, status: 'ok' };
    } catch (err: any) {
      return { data: [], status: 'error', error: err?.message || 'Threads query error.' };
    }
  });
}

export async function createThreadInDatabase(input: {
  propertyId: string;
  hostEmail: string;
  hostName: string;
  listingTitle: string;
  listingImage: string;
}): Promise<HostThread> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const guestEmail = authData.user?.email?.trim().toLowerCase();
  const hostEmail = input.hostEmail.trim().toLowerCase();
  if (authError || !guestEmail) throw new Error('Please sign in before messaging a host.');
  if (!hostEmail || hostEmail === guestEmail) throw new Error('A valid host account is required.');

  const threadId = `thread-${crypto.randomUUID()}`;
  const { data, error } = await supabase.from('threads').insert({
    id: threadId,
    property_id: input.propertyId,
    host_email: hostEmail,
    guest_email: guestEmail,
    host_name: input.hostName,
    listing_title: input.listingTitle,
    listing_image: input.listingImage,
    unread: false,
  }).select().single();

  if (error || !data) throw new Error(error?.message || 'Unable to start this conversation.');

  invalidateServiceCache('threads:');
  return {
    id: data.id,
    hostName: data.host_name,
    listingTitle: data.listing_title,
    listingImage: data.listing_image,
    unread: Boolean(data.unread),
    messages: [],
  };
}

export async function getThreadsFromDatabase(): Promise<HostThread[]> {
  const res = await fetchThreadsWithStatus();
  return res.data;
}

export async function sendMessageToDatabase(
  threadId: string,
  message: { sender: 'host' | 'guest'; text: string; time: string }
): Promise<boolean> {
  invalidateServiceCache('threads:');
  const supabase = getSupabase();
  if (!supabase || !message.text.trim()) return false;

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const senderEmail = authData.user?.email?.trim().toLowerCase();
  if (authError || !senderEmail) return false;

  const { data: thread, error: threadError } = await supabase
    .from('threads')
    .select('id,host_email,guest_email')
    .eq('id', threadId)
    .single();

  if (threadError || !thread) return false;
  const senderRole =
    thread.host_email?.toLowerCase() === senderEmail ? 'host' :
    thread.guest_email?.toLowerCase() === senderEmail ? 'guest' : null;
  if (!senderRole) return false;

  const { error: messageError } = await supabase.from('messages').insert({
    thread_id: threadId,
    sender: senderRole,
    sender_email: senderEmail,
    text: message.text.trim(),
    time: message.time,
  });
  if (messageError) return false;

  const { error: threadUpdateError } = await supabase
    .from('threads')
    .update({
      last_message: message.text.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', threadId);

  return !threadUpdateError;
}

/* ========================================================================= */
/* 5. STORAGE FILE UPLOAD (SUPABASE STORAGE)                                 */
/* ========================================================================= */
export async function uploadFileToSupabaseStorage(
  file: File,
  bucket: 'qaaga-listings' | 'qaaga-branding' | 'qaaga-avatars' = 'qaaga-listings'
): Promise<{ url: string; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { url: '', error: 'Supabase Storage is not configured.' };

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (authError || !userId) return { url: '', error: 'Sign in before uploading a file.' };

  if (!file.size || file.size > 10 * 1024 * 1024) {
    return { url: '', error: 'File must be smaller than 10 MB.' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!allowedTypes.includes(file.type)) {
    return { url: '', error: 'Only JPG, PNG, WebP or AVIF images are supported.' };
  }

  try {
    const extension = file.type.split('/')[1].replace('jpeg', 'jpg');
    const filePath = userId + '/' + crypto.randomUUID() + '.' + extension;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '31536000',
        upsert: false,
        contentType: file.type,
      });

    if (error || !data) {
      return { url: '', error: error?.message || 'Supabase Storage upload failed.' };
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: publicData.publicUrl };
  } catch (error: any) {
    return { url: '', error: error?.message || 'Supabase Storage upload failed.' };
  }
}

/* ========================================================================= */
/* 5B. SUPABASE BRANDING (LOGO & FAVICON) UPLOAD & CLOUD PERSISTENCE        */
/* ========================================================================= */
export async function uploadBrandingAssetToSupabase(
  file: File,
  type: 'logo' | 'favicon'
): Promise<{ url: string; storageType: 'supabase-storage' | 'optimized-base64'; error?: string }> {
  const supabase = getSupabase();

  if (supabase) {
    const bucketsToTry = ['qaaga-branding', 'branding', 'public-assets', 'public'];
    const fileExt = (file.name.split('.').pop() || (type === 'favicon' ? 'ico' : 'png')).toLowerCase();
    const cleanFileName = `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    for (const b of bucketsToTry) {
      try {
        const { data, error } = await supabase.storage
          .from(b)
          .upload(cleanFileName, file, {
            cacheControl: '31536000',
            upsert: true,
            contentType: file.type || (fileExt === 'svg' ? 'image/svg+xml' : 'image/png'),
          });

        if (!error && data) {
          const { data: pubData } = supabase.storage.from(b).getPublicUrl(cleanFileName);
          if (pubData?.publicUrl) {
            return {
              url: pubData.publicUrl,
              storageType: 'supabase-storage',
            };
          }
        }
      } catch {
        // Try next bucket
      }
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: String(reader.result || ''),
        storageType: 'optimized-base64',
      });
    };
    reader.onerror = () => {
      resolve({
        url: '',
        storageType: 'optimized-base64',
        error: 'Failed to read branding image file',
      });
    };
    reader.readAsDataURL(file);
  });
}

export async function saveBrandingToSupabase(branding: any): Promise<any> {
  invalidateServiceCache('branding:');
  const supabase = getSupabase();
  if (!supabase) return branding;

  try {
    const payload = {
      id: 'default_branding',
      logo_url: branding.logoUrl,
      favicon_url: branding.faviconUrl,
      alt_text: branding.altText || 'qaaga.com',
      fallback_text: branding.fallbackText || 'qaaga',
      fallback_domain: branding.fallbackDomain || '.com',
      show_text_when_removed: Boolean(branding.showTextWhenRemoved),
      size: branding.size || 'md',
      blend_multiply: Boolean(branding.blendMultiply),
      revision: Number(branding.revision) || Date.now(),
      updated_at: branding.updatedAt || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('site_branding')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (!error && data) {
      return {
        logoUrl: data.logo_url ?? null,
        faviconUrl: data.favicon_url ?? null,
        altText: data.alt_text || 'qaaga.com',
        fallbackText: data.fallback_text || 'qaaga',
        fallbackDomain: data.fallback_domain || '.com',
        showTextWhenRemoved: Boolean(data.show_text_when_removed),
        size: data.size || 'md',
        blendMultiply: Boolean(data.blend_multiply),
        revision: Number(data.revision) || branding.revision,
        updatedAt: data.updated_at || branding.updatedAt,
      };
    }
  } catch (err) {
    console.warn('Notice: Remote Supabase branding save notice:', err);
  }

  return branding;
}

export async function getBrandingFromSupabase(): Promise<any | null> {
  return dedupFetch('branding:default', async () => {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('site_branding')
        .select('*')
        .eq('id', 'default_branding')
        .maybeSingle();

      if (!error && data) {
        return {
          logoUrl: data.logo_url ?? null,
          faviconUrl: data.favicon_url ?? null,
          altText: data.alt_text || 'qaaga.com',
          fallbackText: data.fallback_text || 'qaaga',
          fallbackDomain: data.fallback_domain || '.com',
          showTextWhenRemoved: Boolean(data.show_text_when_removed),
          size: data.size || 'md',
          blendMultiply: Boolean(data.blend_multiply),
          revision: Number(data.revision) || 1,
          updatedAt: data.updated_at || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Notice: Remote Supabase branding query error:', err);
    }

    return null;
  });
}

/* ========================================================================= */
/* 6. REALTIME CHANNEL SUBSCRIPTION                                          */
/* ========================================================================= */
export function subscribeToSupabaseTable(
  tableName: 'listings' | 'properties' | 'bookings' | 'reviews' | 'threads' | 'messages' | 'site_branding' | 'profiles',
  onPayload: (payload: any) => void
): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel(`realtime_${tableName}_${Math.random().toString(36).substring(7)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload) => {
          invalidateServiceCache(`${tableName}:`);
          onPayload(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn(`Supabase Realtime subscribe notice for ${tableName}:`, err);
    return () => {};
  }
}

/* ========================================================================= */
/* 7. USER PROFILES & AUTH DATABASE OPERATIONS                               */
/* ========================================================================= */
export async function getUserProfileFromDatabase(email: string): Promise<GuestProfile | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  return dedupFetch(`profile:${cleanEmail}`, async () => {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (!error && data) {
        return {
          fullName: data.full_name || 'Verified Member',
          email: data.email,
          city: data.city || 'Kuala Lumpur',
          verified: Boolean(data.verified),
          role: data.role || 'guest',
          identity_status: data.identity_status || (data.verified ? 'verified' : 'unverified'),
          phone: data.phone || undefined,
          avatarUrl: data.avatar_url || '',
          bio: data.bio || '',
          joinedDate: data.created_at
            ? new Date(data.created_at).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })
            : undefined,
          status: data.status || 'active',
        };
      }
    } catch (err) {
      console.warn('Notice: Remote Supabase profile query error:', err);
    }

    return null;
  });
}

export async function saveUserProfileToDatabase(profile: GuestProfile): Promise<GuestProfile> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const authenticatedEmail = authData.user?.email?.trim().toLowerCase();
  const requestedEmail = profile.email.trim().toLowerCase();
  if (authError || !authenticatedEmail || requestedEmail !== authenticatedEmail) {
    throw new Error('You can only update the profile for your signed-in account.');
  }

  const { data: existing, error: readError } = await supabase
    .from('profiles')
    .select('role,status,identity_status')
    .eq('email', authenticatedEmail)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  const isTrustedAdmin = authData.user.app_metadata?.role === 'admin';
  const role = isTrustedAdmin && existing?.role === 'admin'
    ? 'admin'
    : existing?.role === 'host' && profile.role === 'host'
      ? 'host'
      : profile.role === 'host' ? 'host' : 'guest';
  const verified = Boolean(authData.user.email_confirmed_at);

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        email: authenticatedEmail,
        full_name: profile.fullName.trim(),
        city: profile.city?.trim() || 'Dhaka',
        phone: profile.phone?.trim() || null,
        avatar_url: profile.avatarUrl || null,
        bio: profile.bio?.trim() || null,
        role,
        status: existing?.status || 'active',
        verified,
        identity_status: existing?.identity_status || 'unverified',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )
    .select('full_name,email,city,phone,avatar_url,bio,role,status,verified,identity_status,created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Profile could not be saved.');
  }

  invalidateServiceCache('profile:' + authenticatedEmail);
  invalidateServiceCache('users:all');

  return {
    fullName: data.full_name || 'Member',
    email: data.email,
    city: data.city || 'Dhaka',
    phone: data.phone || undefined,
    avatarUrl: data.avatar_url || undefined,
    bio: data.bio || undefined,
    role: data.role,
    status: data.status,
    verified: Boolean(data.verified),
    identity_status: data.identity_status,
    joinedDate: data.created_at
      ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : profile.joinedDate,
  };
}

export async function fetchUsersWithStatus(): Promise<ServiceResult<GuestProfile[]>> {
  return dedupFetch('users:all', async () => {
    const supabase = getSupabase();
    if (!supabase) {
      return { data: [], status: 'error', error: 'Supabase client unavailable.' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], status: 'error', error: error.message };
      }

      if (!Array.isArray(data) || data.length === 0) {
        return { data: [], status: 'empty' };
      }

      const mapped: GuestProfile[] = data.map((d) => ({
        fullName: d.full_name || 'Member',
        email: d.email,
        city: d.city || 'Kuala Lumpur',
        verified: Boolean(d.verified),
        role: d.role || 'guest',
        identity_status: d.identity_status || (d.verified ? 'verified' : 'unverified'),
        phone: d.phone || undefined,
        avatarUrl: d.avatar_url || '',
        bio: d.bio || '',
        joinedDate: d.created_at
          ? new Date(d.created_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })
          : undefined,
        status: d.status || 'active',
      }));
      return { data: mapped, status: 'ok' };
    } catch (err: any) {
      return { data: [], status: 'error', error: err?.message || 'Users query failed.' };
    }
  });
}

export async function getAllUsersFromDatabase(): Promise<GuestProfile[]> {
  const res = await fetchUsersWithStatus();
  return res.data;
}

export async function updateUserRoleInDatabase(
  email: string,
  role: 'customer' | 'guest' | 'host' | 'admin',
  status: 'active' | 'suspended' = 'active'
): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  invalidateServiceCache(`profile:${cleanEmail}`);
  invalidateServiceCache('users:all');
  invalidateServiceCache('admin:stats');
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role, status, updated_at: new Date().toISOString() })
      .eq('email', cleanEmail);
    return !error;
  } catch (err) {
    console.warn('Notice: Remote Supabase update user role exception:', err);
    return false;
  }
}

/* ========================================================================= */
/* 8. PROPERTY ADVANCED OPERATIONS & AVAILABILITY                            */
/* ========================================================================= */
export interface PropertyRecord extends QaagaListing {
  hostEmail?: string;
  propertyType?: string;
  roomType?: string;
  priceDaily?: number;
  priceWeekly?: number;
  priceMonthly?: number;
  status?: 'active' | 'inactive' | 'pending_approval' | 'rejected';
  isFeatured?: boolean;
  facilities?: Record<string, boolean>;
  createdAt?: string;
}

export async function getPropertiesByHost(hostEmail: string): Promise<PropertyRecord[]> {
  const cleanEmail = hostEmail.trim().toLowerCase();
  return dedupFetch(`host_props:${cleanEmail}`, async () => {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('host_email', cleanEmail)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((row) => ({
          ...mapDbListingToModel(row),
          hostEmail: row.host_email,
          propertyType: row.property_type,
          roomType: row.room_type,
          priceDaily: Number(row.price_daily) || Math.round((Number(row.two_night_price_usd) || 120) / 2),
          priceWeekly: Number(row.price_weekly) || undefined,
          priceMonthly: Number(row.price_monthly) || undefined,
          status: row.status || 'active',
          isFeatured: Boolean(row.is_featured),
          facilities: row.facilities || {},
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.warn('Notice: Properties by host query error:', err);
    }
    return [];
  });
}

export async function updatePropertyStatus(
  id: string,
  status: 'active' | 'inactive' | 'pending_approval' | 'rejected'
): Promise<boolean> {
  invalidateServiceCache('listings:');
  invalidateServiceCache('host_props:');
  invalidateServiceCache('admin:stats');
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('properties')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function checkPropertyAvailability(
  propertyId: string,
  checkInDate: string,
  checkOutDate: string
): Promise<{ isAvailable: boolean; conflictReason?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { isAvailable: true };

  try {
    const { data: bookings, error: bookingErr } = await supabase
      .from('bookings')
      .select('id, check_in, check_out, status')
      .eq('property_id', propertyId)
      .in('status', ['Confirmed', 'Accepted', 'Pending']);

    if (!bookingErr && Array.isArray(bookings)) {
      const inTime = new Date(checkInDate).getTime();
      const outTime = new Date(checkOutDate).getTime();

      for (const b of bookings) {
        if (!b.check_in || !b.check_out) continue;
        const bIn = new Date(b.check_in).getTime();
        const bOut = new Date(b.check_out).getTime();
        if (inTime < bOut && outTime > bIn) {
          return {
            isAvailable: false,
            conflictReason: `Dates conflict with existing reservation (${b.check_in} to ${b.check_out})`,
          };
        }
      }
    }

    const { data: blocked, error: blockErr } = await supabase
      .from('property_availability')
      .select('date, is_available')
      .eq('property_id', propertyId)
      .eq('is_available', false)
      .gte('date', checkInDate)
      .lte('date', checkOutDate);

    if (!blockErr && Array.isArray(blocked) && blocked.length > 0) {
      return {
        isAvailable: false,
        conflictReason: 'Selected dates include dates manually blocked by the host.',
      };
    }

    return { isAvailable: true };
  } catch {
    return { isAvailable: true };
  }
}

/* ========================================================================= */
/* 9. HOST INCOMING BOOKINGS & STATUS MANAGEMENT                            */
/* ========================================================================= */
export async function getBookingsForHost(hostEmail: string): Promise<any[]> {
  const cleanEmail = hostEmail.trim().toLowerCase();
  return dedupFetch(`host_bookings:${cleanEmail}`, async () => {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .or(`host_email.eq.${cleanEmail},host_name.ilike.%${cleanEmail}%`)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((b) => ({
          id: b.id,
          confirmationCode: b.confirmation_code,
          propertyId: b.property_id || b.listing_id,
          title: b.title,
          area: b.area,
          image: b.image,
          customerEmail: b.customer_email || b.guest_email,
          customerName: b.customer_name || b.guest_name,
          customerPhone: b.customer_phone,
          checkIn: b.check_in,
          checkOut: b.check_out,
          checkInLabel: b.check_in_label,
          nights: Number(b.nights) || 1,
          guests: Number(b.guests) || 1,
          totalUsd: Number(b.total_usd) || 100,
          status: b.status || 'Pending',
          cancellationReason: b.cancellation_reason,
          createdAt: b.created_at,
        }));
      }
    } catch (err) {
      console.warn('Notice: Host bookings fetch error:', err);
    }
    return [];
  });
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'Pending' | 'Confirmed' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Completed',
  reason?: string,
  cancelledBy?: string
): Promise<boolean> {
  invalidateServiceCache('bookings:');
  invalidateServiceCache('host_bookings:');
  invalidateServiceCache('admin:stats');
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const payload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (reason) payload.cancellation_reason = reason;
    if (cancelledBy) {
      payload.cancelled_by = cancelledBy;
      payload.cancelled_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('bookings')
      .update(payload)
      .eq('id', bookingId);

    return !error;
  } catch {
    return false;
  }
}

/* ========================================================================= */
/* 10. PAYMENT RECORDS & PROOF UPLOADS (Direct Guest-to-Host)                */
/* ========================================================================= */
export interface PaymentProofRecord {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionReference: string;
  proofImageUrl: string;
  payerName: string;
  payerEmail: string;
  status: 'pending_review' | 'verified' | 'rejected';
  hostNotes?: string;
  adminNotes?: string;
  createdAt: string;
}

export async function submitPaymentProof(data: {
  bookingId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  transactionReference: string;
  proofImageUrl: string;
  payerName: string;
  payerEmail: string;
}): Promise<PaymentProofRecord | null> {
  invalidateServiceCache('payments:');
  invalidateServiceCache('admin:stats');
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data: inserted, error } = await supabase
      .from('payment_records')
      .insert({
        booking_id: data.bookingId,
        amount: data.amount,
        currency: data.currency || 'USD',
        payment_method: data.paymentMethod,
        transaction_reference: data.transactionReference,
        proof_image_url: data.proofImageUrl,
        payer_name: data.payerName,
        payer_email: data.payerEmail,
        status: 'pending_review',
      })
      .select()
      .single();

    if (!error && inserted) {
      return {
        id: inserted.id,
        bookingId: inserted.booking_id,
        amount: Number(inserted.amount),
        currency: inserted.currency,
        paymentMethod: inserted.payment_method,
        transactionReference: inserted.transaction_reference,
        proofImageUrl: inserted.proof_image_url,
        payerName: inserted.payer_name,
        payerEmail: inserted.payer_email,
        status: inserted.status,
        createdAt: inserted.created_at,
      };
    }
  } catch (err) {
    console.warn('Notice: Supabase payment record insert error:', err);
  }

  return null;
}

export async function getPaymentProofs(bookingId?: string): Promise<PaymentProofRecord[]> {
  return dedupFetch(`payments:${bookingId || 'all'}`, async () => {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      let query = supabase
        .from('payment_records')
        .select('*')
        .order('created_at', { ascending: false });
      if (bookingId) query = query.eq('booking_id', bookingId);
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data.map((p) => ({
          id: p.id,
          bookingId: p.booking_id,
          amount: Number(p.amount),
          currency: p.currency || 'USD',
          paymentMethod: p.payment_method,
          transactionReference: p.transaction_reference,
          proofImageUrl: p.proof_image_url,
          payerName: p.payer_name,
          payerEmail: p.payer_email,
          status: p.status,
          hostNotes: p.host_notes,
          adminNotes: p.admin_notes,
          createdAt: p.created_at,
        }));
      }
    } catch (err) {
      console.warn('Notice: Payment records query error:', err);
    }

    return [];
  });
}

export async function updatePaymentProofStatus(
  id: string,
  status: 'pending_review' | 'verified' | 'rejected',
  notes?: string
): Promise<boolean> {
  invalidateServiceCache('payments:');
  invalidateServiceCache('admin:stats');
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('payment_records')
      .update({
        status,
        admin_notes: notes,
        verified_at: status === 'verified' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/* ========================================================================= */
/* 11. IDENTITY VERIFICATION SYSTEM                                          */
/* ========================================================================= */
export interface IdentityVerificationRecord {
  id: string;
  userEmail: string;
  userName: string;
  documentType: 'passport' | 'national_id' | 'driving_license';
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export async function submitIdentityVerification(data: {
  userEmail: string;
  userName: string;
  documentType: 'passport' | 'national_id' | 'driving_license';
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl?: string;
}): Promise<IdentityVerificationRecord | null> {
  const cleanEmail = data.userEmail.trim().toLowerCase();
  invalidateServiceCache(`idv:${cleanEmail}`);
  invalidateServiceCache('idv:all');
  invalidateServiceCache('admin:stats');
  const supabase = getSupabase();
  if (!supabase) return null;

  const now = new Date().toISOString();

  try {
    const { data: inserted, error } = await supabase
      .from('identity_verifications')
      .insert({
        user_email: cleanEmail,
        user_name: data.userName,
        document_type: data.documentType,
        document_front_url: data.documentFrontUrl,
        document_back_url: data.documentBackUrl || null,
        selfie_url: data.selfieUrl || null,
        status: 'pending',
      })
      .select()
      .single();

    if (!error && inserted) {
      await supabase
        .from('profiles')
        .update({ identity_status: 'pending', updated_at: now })
        .eq('email', cleanEmail);

      return {
        id: inserted.id,
        userEmail: inserted.user_email,
        userName: inserted.user_name,
        documentType: inserted.document_type,
        documentFrontUrl: inserted.document_front_url,
        documentBackUrl: inserted.document_back_url,
        selfieUrl: inserted.selfie_url,
        status: inserted.status,
        createdAt: inserted.created_at,
      };
    }
  } catch (err) {
    console.warn('Notice: Supabase identity verification submit error:', err);
  }

  return null;
}

export async function getIdentityVerifications(
  userEmail?: string
): Promise<IdentityVerificationRecord[]> {
  const cleanEmail = userEmail ? userEmail.trim().toLowerCase() : 'all';
  return dedupFetch(`idv:${cleanEmail}`, async () => {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      let query = supabase
        .from('identity_verifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (userEmail) query = query.eq('user_email', cleanEmail);
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data.map((v) => ({
          id: v.id,
          userEmail: v.user_email,
          userName: v.user_name,
          documentType: v.document_type,
          documentFrontUrl: v.document_front_url,
          documentBackUrl: v.document_back_url,
          selfieUrl: v.selfie_url,
          status: v.status,
          rejectionReason: v.rejection_reason,
          reviewedBy: v.reviewed_by,
          reviewedAt: v.reviewed_at,
          createdAt: v.created_at,
        }));
      }
    } catch (err) {
      console.warn('Notice: Identity verifications query error:', err);
    }

    return [];
  });
}

export async function updateIdentityVerificationStatus(
  id: string,
  userEmail: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string,
  reviewedBy: string = 'Super Admin'
): Promise<boolean> {
  const cleanEmail = userEmail.trim().toLowerCase();
  invalidateServiceCache(`idv:${cleanEmail}`);
  invalidateServiceCache('idv:all');
  invalidateServiceCache(`profile:${cleanEmail}`);
  invalidateServiceCache('admin:stats');
  const supabase = getSupabase();
  if (!supabase) return false;

  const now = new Date().toISOString();

  try {
    await supabase
      .from('identity_verifications')
      .update({
        status,
        rejection_reason: rejectionReason || null,
        reviewed_by: reviewedBy,
        reviewed_at: now,
        updated_at: now,
      })
      .eq('id', id);

    await supabase
      .from('profiles')
      .update({
        identity_status: status === 'approved' ? 'verified' : 'rejected',
        verified: status === 'approved',
        updated_at: now,
      })
      .eq('email', cleanEmail);

    return true;
  } catch {
    return false;
  }
}

/* ========================================================================= */
/* 12. REALTIME ADMIN PLATFORM STATISTICS (ZERO HARDCODED CONSTANTS)         */
/* ========================================================================= */
export interface AdminPlatformStats {
  totalUsers: number;
  totalHosts: number;
  totalProperties: number;
  activeProperties: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalGrossRevenueUsd: number;
  pendingVerifications: number;
  pendingPayments: number;
}

export async function getAdminPlatformStats(): Promise<AdminPlatformStats> {
  return dedupFetch('admin:stats', async () => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        totalUsers: 0,
        totalHosts: 0,
        totalProperties: 0,
        activeProperties: 0,
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        totalGrossRevenueUsd: 0,
        pendingVerifications: 0,
        pendingPayments: 0,
      };
    }

    try {
      const [
        { count: userCount },
        { count: hostCount },
        { data: props },
        { data: listingsData },
        { data: allBookings },
        { count: pendingIdCount },
        { count: pendingPayCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'host'),
        supabase.from('properties').select('id, status'),
        supabase.from('listings').select('id, is_active'),
        supabase.from('bookings').select('id, total_usd, status'),
        supabase
          .from('identity_verifications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('payment_records')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending_review'),
      ]);

      const properties = Array.isArray(props) ? props : [];
      const listingsRows = Array.isArray(listingsData) ? listingsData : [];
      const bookingsList = Array.isArray(allBookings) ? allBookings : [];

      const totalProps = properties.length + listingsRows.length;
      const activeProps =
        properties.filter((p) => p.status === 'active').length +
        listingsRows.filter((l) => l.is_active !== false).length;
      const confirmed = bookingsList.filter(
        (b) => b.status === 'Confirmed' || b.status === 'Accepted'
      ).length;
      const pending = bookingsList.filter((b) => b.status === 'Pending').length;
      const totalRevenue = bookingsList
        .filter((b) => b.status !== 'Cancelled' && b.status !== 'Rejected')
        .reduce((sum, b) => sum + (Number(b.total_usd) || 0), 0);

      return {
        totalUsers: userCount || 0,
        totalHosts: hostCount || 0,
        totalProperties: totalProps,
        activeProperties: activeProps,
        totalBookings: bookingsList.length,
        confirmedBookings: confirmed,
        pendingBookings: pending,
        totalGrossRevenueUsd: totalRevenue,
        pendingVerifications: pendingIdCount || 0,
        pendingPayments: pendingPayCount || 0,
      };
    } catch (err) {
      console.warn('Notice: Calculating dynamic platform stats error:', err);
      return {
        totalUsers: 0,
        totalHosts: 0,
        totalProperties: 0,
        activeProperties: 0,
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        totalGrossRevenueUsd: 0,
        pendingVerifications: 0,
        pendingPayments: 0,
      };
    }
  });
}

/* ========================================================================= */
/* 13. NOTIFICATIONS MANAGEMENT                                              */
/* ========================================================================= */
export async function getNotificationsFromDatabase(
  recipientEmail: string
): Promise<any[]> {
  const cleanEmail = recipientEmail.trim().toLowerCase();
  return dedupFetch(`notifications:${cleanEmail}`, async () => {
    const supabase = getSupabase();
    if (!supabase || !cleanEmail) return [];

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_email', cleanEmail)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map((n) => ({
          id: n.id,
          title: n.title,
          desc: n.message,
          time: new Date(n.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          read: Boolean(n.read),
          link: n.link,
          type: n.type,
        }));
      }
    } catch (err) {
      console.warn('Notice: Notifications query error:', err);
    }
    return [];
  });
}

export async function createNotificationInDatabase(
  recipientEmail: string,
  title: string,
  message: string,
  type: string = 'system',
  link?: string
): Promise<boolean> {
  const cleanEmail = recipientEmail.trim().toLowerCase();
  invalidateServiceCache(`notifications:${cleanEmail}`);
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('notifications').insert({
      recipient_email: cleanEmail,
      title,
      message,
      type,
      link,
    });
    return !error;
  } catch {
    return false;
  }
}
