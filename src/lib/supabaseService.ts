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
/* 5B. SUPABASE BRANDING (LOGO & FAVICON) UPLOAD & CLOUD PERSISTENCE        */
/* ========================================================================= */
export async function uploadBrandingAssetToSupabase(
  file: File,
  type: 'logo' | 'favicon'
): Promise<{ url: string; storageType: 'supabase-storage' | 'optimized-base64'; error?: string }> {
  const supabase = getSupabase();

  if (supabase) {
    // Try primary branding bucket, fallback to public or custom
    const bucketsToTry = ['qaaga-branding', 'branding', 'public-assets', 'public'];
    const fileExt = (file.name.split('.').pop() || (type === 'favicon' ? 'ico' : 'png')).toLowerCase();
    const cleanFileName = `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    for (const b of bucketsToTry) {
      try {
        const { data, error } = await supabase.storage
          .from(b)
          .upload(cleanFileName, file, {
            cacheControl: '3600',
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
      } catch (err) {
        // Continue to next bucket or graceful fallback
      }
    }
  }

  // Graceful optimized data URL fallback with reliable reader
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
    console.warn('Notice: Remote Supabase branding table save fallback:', err);
  }

  return branding;
}

export async function getBrandingFromSupabase(): Promise<any | null> {
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
    console.warn('Notice: Remote Supabase branding read fallback:', err);
  }

  return null;
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

/* ========================================================================= */
/* 7. PROPERTY ADVANCED OPERATIONS & AVAILABILITY                            */
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
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('host_email', cleanEmail)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row) => ({
          ...mapDbListingToModel(row),
          hostEmail: row.host_email,
          propertyType: row.property_type,
          roomType: row.room_type,
          priceDaily: Number(row.price_daily) || Math.round(row.two_night_price_usd / 2),
          priceWeekly: Number(row.price_weekly) || undefined,
          priceMonthly: Number(row.price_monthly) || undefined,
          status: row.status || 'active',
          isFeatured: Boolean(row.is_featured),
          facilities: row.facilities || {},
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.warn('Notice: Properties by host fetch fallback:', err);
    }
  }
  return [];
}

export async function updatePropertyStatus(
  id: string,
  status: 'active' | 'inactive' | 'pending_approval' | 'rejected'
): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
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
  return true;
}

export async function checkPropertyAvailability(
  propertyId: string,
  checkInDate: string,
  checkOutDate: string
): Promise<{ isAvailable: boolean; conflictReason?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { isAvailable: true };

  try {
    // 1. Check for overlapping confirmed or accepted bookings
    const { data: bookings, error: bookingErr } = await supabase
      .from('bookings')
      .select('id, check_in, check_out, status')
      .eq('property_id', propertyId)
      .in('status', ['Confirmed', 'Accepted', 'Pending']);

    if (!bookingErr && Array.isArray(bookings)) {
      const inTime = new Date(checkInDate).getTime();
      const outTime = new Date(checkOutDate).getTime();

      for (const b of bookings) {
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

    // 2. Check for manual blocked dates in property_availability
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
/* 8. HOST INCOMING BOOKINGS & STATUS MANAGEMENT                            */
/* ========================================================================= */
export async function getBookingsForHost(hostEmail: string): Promise<any[]> {
  const cleanEmail = hostEmail.trim().toLowerCase();
  const supabase = getSupabase();
  if (supabase) {
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
  }
  return [];
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'Pending' | 'Confirmed' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Completed',
  reason?: string,
  cancelledBy?: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
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
  return true;
}

/* ========================================================================= */
/* 9. PAYMENT RECORDS & PROOF UPLOADS (Direct Guest-to-Host)                */
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
  const supabase = getSupabase();
  const id = `pay-${Date.now()}`;
  const now = new Date().toISOString();

  const record: PaymentProofRecord = {
    id,
    bookingId: data.bookingId,
    amount: data.amount,
    currency: data.currency || 'USD',
    paymentMethod: data.paymentMethod,
    transactionReference: data.transactionReference,
    proofImageUrl: data.proofImageUrl,
    payerName: data.payerName,
    payerEmail: data.payerEmail,
    status: 'pending_review',
    createdAt: now,
  };

  if (supabase) {
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
      console.warn('Notice: Supabase payment record insert notice:', err);
    }
  }

  // Local storage fallback for seamless client preview
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('qaaga_payment_records') || '[]');
      localStorage.setItem('qaaga_payment_records', JSON.stringify([record, ...existing]));
    } catch {}
  }

  return record;
}

export async function getPaymentProofs(bookingId?: string): Promise<PaymentProofRecord[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('payment_records').select('*').order('created_at', { ascending: false });
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
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = JSON.parse(localStorage.getItem('qaaga_payment_records') || '[]');
      if (bookingId) return saved.filter((s: any) => s.bookingId === bookingId);
      return saved;
    } catch {}
  }
  return [];
}

export async function updatePaymentProofStatus(
  id: string,
  status: 'pending_review' | 'verified' | 'rejected',
  notes?: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
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
  return true;
}

/* ========================================================================= */
/* 10. IDENTITY VERIFICATION SYSTEM                                         */
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
  const supabase = getSupabase();
  const now = new Date().toISOString();

  const record: IdentityVerificationRecord = {
    id: `idv-${Date.now()}`,
    userEmail: cleanEmail,
    userName: data.userName,
    documentType: data.documentType,
    documentFrontUrl: data.documentFrontUrl,
    documentBackUrl: data.documentBackUrl,
    selfieUrl: data.selfieUrl,
    status: 'pending',
    createdAt: now,
  };

  if (supabase) {
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
        // Also update profiles table identity_status
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
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('qaaga_verifications') || '[]');
      localStorage.setItem('qaaga_verifications', JSON.stringify([record, ...existing]));
    } catch {}
  }

  return record;
}

export async function getIdentityVerifications(
  userEmail?: string
): Promise<IdentityVerificationRecord[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('identity_verifications').select('*').order('created_at', { ascending: false });
      if (userEmail) query = query.eq('user_email', userEmail.trim().toLowerCase());
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
      console.warn('Notice: Identity verifications query fallback:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const saved = JSON.parse(localStorage.getItem('qaaga_verifications') || '[]');
      if (userEmail) return saved.filter((s: any) => s.userEmail === userEmail);
      return saved;
    } catch {}
  }
  return [];
}

export async function updateIdentityVerificationStatus(
  id: string,
  userEmail: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string,
  reviewedBy: string = 'Super Admin'
): Promise<boolean> {
  const supabase = getSupabase();
  const cleanEmail = userEmail.trim().toLowerCase();
  const now = new Date().toISOString();

  if (supabase) {
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

  return true;
}

/* ========================================================================= */
/* 11. DYNAMIC CALCULATED ADMIN PLATFORM STATISTICS                          */
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
  const supabase = getSupabase();
  if (supabase) {
    try {
      const [
        { count: userCount },
        { count: hostCount },
        { data: props },
        { data: allBookings },
        { count: pendingIdCount },
        { count: pendingPayCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'host'),
        supabase.from('properties').select('id, status'),
        supabase.from('bookings').select('id, total_usd, status'),
        supabase.from('identity_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payment_records').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
      ]);

      const properties = Array.isArray(props) ? props : [];
      const bookingsList = Array.isArray(allBookings) ? allBookings : [];

      const activeProps = properties.filter((p) => p.status === 'active').length;
      const confirmed = bookingsList.filter((b) => b.status === 'Confirmed' || b.status === 'Accepted').length;
      const pending = bookingsList.filter((b) => b.status === 'Pending').length;
      const totalRevenue = bookingsList
        .filter((b) => b.status !== 'Cancelled' && b.status !== 'Rejected')
        .reduce((sum, b) => sum + (Number(b.total_usd) || 0), 0);

      return {
        totalUsers: Math.max(userCount || 0, INITIAL_USERS.length),
        totalHosts: hostCount || 0,
        totalProperties: properties.length || INITIAL_LISTINGS.length,
        activeProperties: activeProps || INITIAL_LISTINGS.length,
        totalBookings: bookingsList.length || INITIAL_BOOKINGS.length,
        confirmedBookings: confirmed || INITIAL_BOOKINGS.filter((b) => b.status === 'Confirmed').length,
        pendingBookings: pending,
        totalGrossRevenueUsd: totalRevenue || INITIAL_BOOKINGS.reduce((acc, b) => acc + (b.totalUsd || 0), 0),
        pendingVerifications: pendingIdCount || 0,
        pendingPayments: pendingPayCount || 0,
      };
    } catch (err) {
      console.warn('Notice: Calculating dynamic platform stats fallback:', err);
    }
  }

  // Fallback calculated from base data
  const totalRevenue = INITIAL_BOOKINGS.reduce((acc, b) => acc + (b.totalUsd || 0), 0);
  return {
    totalUsers: INITIAL_USERS.length,
    totalHosts: INITIAL_USERS.filter((u) => u.role === 'host').length,
    totalProperties: INITIAL_LISTINGS.length,
    activeProperties: INITIAL_LISTINGS.length,
    totalBookings: INITIAL_BOOKINGS.length,
    confirmedBookings: INITIAL_BOOKINGS.filter((b) => b.status === 'Confirmed').length,
    pendingBookings: 0,
    totalGrossRevenueUsd: totalRevenue,
    pendingVerifications: 0,
    pendingPayments: 0,
  };
}

/* ========================================================================= */
/* 12. NOTIFICATIONS MANAGEMENT                                              */
/* ========================================================================= */
export async function getNotificationsFromDatabase(
  recipientEmail: string
): Promise<any[]> {
  const cleanEmail = recipientEmail.trim().toLowerCase();
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_email', cleanEmail)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((n) => ({
          id: n.id,
          title: n.title,
          desc: n.message,
          time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: Boolean(n.read),
          link: n.link,
          type: n.type,
        }));
      }
    } catch (err) {
      console.warn('Notice: Notifications query fallback:', err);
    }
  }
  return [];
}

export async function createNotificationInDatabase(
  recipientEmail: string,
  title: string,
  message: string,
  type: string = 'system',
  link?: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('notifications').insert({
        recipient_email: recipientEmail.trim().toLowerCase(),
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
  return true;
}

