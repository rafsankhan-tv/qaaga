import { getSupabase } from './supabaseClient';
import {
  BookingRecord,
  DEFAULT_REVIEWS,
  GuestProfile,
  HostThread,
  INITIAL_BOOKINGS,
  INITIAL_LISTINGS,
  INITIAL_THREADS,
  INITIAL_USERS,
  ListingReview,
  QaagaListing,
} from '@/data/listings';

/**
 * Normalizes DB column naming (snake_case) to QaagaListing (camelCase)
 */
function mapDbListingToModel(row: any): QaagaListing {
  return {
    id: String(row.id),
    title: row.title || 'Untitled Listing',
    area: row.area || 'Kuala Lumpur',
    city: row.city || 'Kuala Lumpur',
    subType: row.sub_type || 'Apartment',
    category: row.category || 'stay',
    twoNightPriceUsd: Number(row.two_night_price_usd) || 120,
    rating: String(row.rating || '5.0'),
    reviewsCount: Number(row.reviews_count) || 0,
    guestFavorite: Boolean(row.guest_favorite),
    image: row.image || '/assets/kl-ui/kl-1.jpg',
    gallery: Array.isArray(row.gallery) && row.gallery.length > 0 ? row.gallery : [row.image || '/assets/kl-ui/kl-1.jpg'],
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
/* 1. LISTINGS DATABASE OPERATIONS                                           */
/* ========================================================================= */
export async function getListingsFromDatabase(): Promise<QaagaListing[]> {
  const supabase = getSupabase();
  if (!supabase) return INITIAL_LISTINGS;

  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map(mapDbListingToModel);
    }
  } catch (err) {
    console.warn('Notice: Remote Supabase listings table read fallback:', err);
  }

  return INITIAL_LISTINGS;
}

export async function insertListingToDatabase(
  listing: QaagaListing
): Promise<QaagaListing> {
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
    console.warn('Notice: Supabase listing insert fallback:', err);
  }

  return listing;
}

export async function deleteListingFromDatabase(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return true;

  try {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    return !error;
  } catch {
    return true;
  }
}

/* ========================================================================= */
/* 2. BOOKINGS DATABASE OPERATIONS                                           */
/* ========================================================================= */
export async function getBookingsFromDatabase(
  guestEmail?: string
): Promise<BookingRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return INITIAL_BOOKINGS;

  try {
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (guestEmail) {
      query = query.eq('guest_email', guestEmail);
    }
    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        confirmationCode: row.confirmation_code,
        listingId: row.listing_id,
        title: row.title,
        area: row.area,
        image: row.image,
        checkInLabel: row.check_in_label,
        nights: Number(row.nights) || 2,
        guests: Number(row.guests) || 1,
        totalUsd: Number(row.total_usd) || 100,
        hostName: row.host_name,
        status: row.status || 'Confirmed',
      }));
    }
  } catch (err) {
    console.warn('Notice: Supabase bookings read fallback:', err);
  }

  return INITIAL_BOOKINGS;
}

export async function insertBookingToDatabase(
  booking: BookingRecord,
  guestEmail: string,
  guestName: string
): Promise<BookingRecord> {
  const supabase = getSupabase();
  if (!supabase) return booking;

  try {
    const payload = {
      id: booking.id,
      confirmation_code: booking.confirmationCode,
      listing_id: booking.listingId,
      guest_email: guestEmail,
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
    console.warn('Notice: Supabase booking insert fallback:', err);
  }

  return booking;
}

export async function cancelBookingInDatabase(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return true;

  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'Cancelled', updated_at: new Date().toISOString() })
      .eq('id', id);
    return !error;
  } catch {
    return true;
  }
}

/* ========================================================================= */
/* 3. REVIEWS DATABASE OPERATIONS                                            */
/* ========================================================================= */
export async function getReviewsFromDatabase(
  listingId: string
): Promise<ListingReview[]> {
  const supabase = getSupabase();
  const defaultReviews = DEFAULT_REVIEWS[listingId] || [];
  if (!supabase) return defaultReviews;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
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
    console.warn('Notice: Supabase reviews read fallback:', err);
  }

  return defaultReviews;
}

export async function insertReviewToDatabase(
  listingId: string,
  review: { author: string; rating: number; comment: string }
): Promise<ListingReview> {
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
    console.warn('Notice: Supabase review insert fallback:', err);
  }

  return newReview;
}

/* ========================================================================= */
/* 4. MESSAGES & INBOX OPERATIONS                                            */
/* ========================================================================= */
export async function getThreadsFromDatabase(): Promise<HostThread[]> {
  const supabase = getSupabase();
  if (!supabase) return INITIAL_THREADS;

  try {
    const { data: threadsData, error } = await supabase
      .from('threads')
      .select('*, messages(*)')
      .order('updated_at', { ascending: false });

    if (!error && Array.isArray(threadsData) && threadsData.length > 0) {
      return threadsData.map((t: any) => ({
        id: t.id,
        hostName: t.host_name,
        listingTitle: t.listing_title,
        listingImage: t.listing_image,
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
    }
  } catch (err) {
    console.warn('Notice: Supabase threads read fallback:', err);
  }

  return INITIAL_THREADS;
}

export async function sendMessageToDatabase(
  threadId: string,
  message: { sender: 'host' | 'guest'; text: string; time: string }
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return true;

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
    return true;
  }
}

/* ========================================================================= */
/* 5. STORAGE FILE UPLOAD (SUPABASE STORAGE WITH FALLBACK)                   */
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
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(filePath);

        return { url: publicUrl };
      }
    } catch (err) {
      console.warn('Supabase storage direct upload notice, using optimized reader:', err);
    }
  }

  // Graceful local data URL fallback
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: String(reader.result) });
    reader.onerror = () => resolve({ url: '', error: 'Failed to read file' });
    reader.readAsDataURL(file);
  });
}

/* ========================================================================= */
/* 6. REALTIME CHANNEL SUBSCRIPTION                                         */
/* ========================================================================= */
export function subscribeToSupabaseTable(
  tableName: 'listings' | 'bookings' | 'reviews' | 'threads' | 'messages' | 'site_branding',
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
/* 6. USER PROFILES & AUTH DATABASE OPERATIONS                               */
/* ========================================================================= */
export async function getUserProfileFromDatabase(email: string): Promise<GuestProfile | null> {
  const cleanEmail = email.trim().toLowerCase();
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (!error && data) {
        return {
          fullName: data.full_name || 'Verified Member',
          email: data.email,
          city: data.city || 'Kuala Lumpur',
          verified: Boolean(data.verified),
          role: data.role || 'guest',
          phone: data.phone || undefined,
          avatarUrl: data.avatar_url || '',
          bio: data.bio || '',
          joinedDate: data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Nov 2026',
          status: data.status || 'active',
        };
      }
    } catch (err) {
      console.warn('Notice: Remote Supabase profile query fallback:', err);
    }
  }

  // Check local fallback users
  const found = INITIAL_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
  return found || null;
}

export async function saveUserProfileToDatabase(profile: GuestProfile): Promise<GuestProfile> {
  const cleanEmail = profile.email.trim().toLowerCase();
  const normalized: GuestProfile = {
    ...profile,
    email: cleanEmail,
    verified: true,
  };

  const supabase = getSupabase();
  if (supabase) {
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
          verified: true,
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

  // Also update local storage for seamless client state
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('qaaga_v3_profile', JSON.stringify(normalized));
    } catch {}
  }

  return normalized;
}

export async function getAllUsersFromDatabase(): Promise<GuestProfile[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((d) => ({
          fullName: d.full_name || 'Member',
          email: d.email,
          city: d.city || 'Kuala Lumpur',
          verified: Boolean(d.verified),
          role: d.role || 'guest',
          phone: d.phone || undefined,
          avatarUrl: d.avatar_url || '',
          bio: d.bio || '',
          joinedDate: d.created_at ? new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Nov 2026',
          status: d.status || 'active',
        }));
      }
    } catch (err) {
      console.warn('Notice: Remote Supabase users query fallback:', err);
    }
  }

  return INITIAL_USERS;
}

export async function updateUserRoleInDatabase(
  email: string,
  role: 'guest' | 'host' | 'admin',
  status: 'active' | 'suspended' = 'active'
): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role, status, updated_at: new Date().toISOString() })
        .eq('email', cleanEmail);
      if (!error) return true;
    } catch (err) {
      console.warn('Notice: Remote Supabase update user role exception:', err);
    }
  }
  return true;
}
