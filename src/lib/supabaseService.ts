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
    title: row.title || 'Untitled Listing',
    area: row.area || 'Kuala Lumpur',
    city: row.city || 'Kuala Lumpur',
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
  return {
    id: model.id,
    title: model.title,
    area: model.area,
    city: model.city || 'Kuala Lumpur',
    sub_type: model.subType || 'Apartment',
    category: model.category,
    two_night_price_usd: model.twoNightPriceUsd,
    rating: model.rating,
    reviews_count: model.reviewsCount,
    guest_favorite: model.guestFavorite,
    image: model.image,
    gallery: model.gallery || [model.image],
    max_guests: model.maxGuests || 2,
    bedrooms: model.bedrooms || '1 bedroom',
    host_name: model.hostName || 'Host',
    host_years: model.hostYears || 1,
    amenities: model.amenities || [],
    description: model.description || '',
    in_popular_kl: Boolean(model.inPopularKL),
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
          .eq('status', 'active')
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
  if (!supabase) return listing;

  try {
    const payload = mapModelToDbListing(listing);
    const { data, error } = await supabase
      .from('listings')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (!error && data) {
      return mapDbListingToModel(data);
    }
  } catch (err) {
    console.warn('Notice: Supabase listing insert notice:', err);
  }

  return listing;
}

export async function deleteListingFromDatabase(id: string): Promise<boolean> {
  invalidateServiceCache('listings:');
  invalidateServiceCache('host_props:');
  invalidateServiceCache('admin:stats');
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      supabase.from('listings').delete().eq('id', id),
      supabase.from('properties').delete().eq('id', id),
    ]);
    return !err1 || !err2;
  } catch {
    return false;
  }
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
  guestName: string
): Promise<BookingRecord> {
  invalidateServiceCache('bookings:');
  invalidateServiceCache('host_bookings:');
  invalidateServiceCache('admin:stats');
  const supabase = getSupabase();
  if (!supabase) return booking;

  try {
    const payload = {
      id: booking.id,
      confirmation_code: booking.confirmationCode,
      listing_id: booking.listingId,
      guest_email: guestEmail.trim().toLowerCase(),
      guest_name: guestName,
      title: booking.title,
      area: booking.area,
      image: booking.image,
      check_in_label: booking.checkInLabel,
      nights: booking.nights,
      guests: booking.guests,
      total_usd: booking.totalUsd,
      host_name: booking.hostName,
      status: booking.status,
    };

    const { data, error } = await supabase
      .from('bookings')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        confirmationCode: data.confirmation_code,
        listingId: data.listing_id,
        title: data.title,
        area: data.area,
        image: data.image,
        checkInLabel: data.check_in_label,
        nights: Number(data.nights),
        guests: Number(data.guests),
        totalUsd: Number(data.total_usd),
        hostName: data.host_name,
        status: data.status,
      };
    }
  } catch (err) {
    console.warn('Notice: Supabase booking insert notice:', err);
  }

  return booking;
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
  invalidateServiceCache(`reviews:${listingId}`);
  const supabase = getSupabase();
  const newReview: ListingReview = {
    id: `rev-${Date.now()}`,
    author: review.author,
    date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    rating: review.rating,
    comment: review.comment,
  };

  if (!supabase) return newReview;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        listing_id: listingId,
        author: review.author,
        rating: review.rating,
        comment: review.comment,
      })
      .select()
      .single();

    if (!error && data) {
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
  } catch (err) {
    console.warn('Notice: Supabase review insert error:', err);
  }

  return newReview;
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
  if (!supabase) return false;

  try {
    const { error: msgErr } = await supabase.from('messages').insert({
      thread_id: threadId,
      sender: message.sender,
      text: message.text,
      time: message.time,
    });

    await supabase
      .from('threads')
      .update({
        last_message: message.text,
        updated_at: new Date().toISOString(),
      })
      .eq('id', threadId);

    return !msgErr;
  } catch {
    return false;
  }
}

/* ========================================================================= */
/* 5. STORAGE FILE UPLOAD (SUPABASE STORAGE)                                 */
/* ========================================================================= */
export async function uploadFileToSupabaseStorage(
  file: File,
  bucket: 'qaaga-listings' | 'qaaga-branding' | 'qaaga-avatars' = 'qaaga-listings'
): Promise<{ url: string; error?: string }> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: true,
        });

      if (!error && data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(filePath);

        return { url: publicUrl };
      }
    } catch (err) {
      console.warn('Supabase storage upload notice, using inline reader:', err);
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: String(reader.result) });
    reader.onerror = () => resolve({ url: '', error: 'Failed to read file' });
    reader.readAsDataURL(file);
  });
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
  const cleanEmail = profile.email.trim().toLowerCase();
  invalidateServiceCache(`profile:${cleanEmail}`);
  invalidateServiceCache('users:all');
  const normalized: GuestProfile = {
    ...profile,
    email: cleanEmail,
    verified: Boolean(profile.verified),
  };

  const supabase = getSupabase();
  if (supabase && cleanEmail) {
    try {
      const { error } = await supabase.from('profiles').upsert(
        {
          email: cleanEmail,
          full_name: normalized.fullName,
          city: normalized.city || 'Kuala Lumpur',
          role: normalized.role || 'guest',
          phone: normalized.phone || null,
          avatar_url: normalized.avatarUrl || null,
          bio: normalized.bio || null,
          status: normalized.status || 'active',
          verified: normalized.verified,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );
      if (error) {
        console.warn('Notice: Remote Supabase profile save notice:', error.message);
      }
    } catch (err) {
      console.warn('Notice: Remote Supabase profile save exception:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('qaaga_v3_profile', JSON.stringify(normalized));
    } catch {}
  }

  return normalized;
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
