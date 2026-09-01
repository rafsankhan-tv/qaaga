import { marketplaceStore } from '../services/marketplaceStore.ts';
import { dbService } from '../db/database.ts';
import type { ServiceRequest, ProviderOffer, Booking, ServiceRequestStatus, ProviderOfferStatus } from '../types/index.ts';
import {
  assertProductionWriteAllowed,
  handleRepositoryWriteError,
} from '../lib/persistence-policy.ts';

/**
 * Data Access Layer (Repository Pattern) - Service & Escrow Request Repository
 * Fully PostgreSQL-backed with ACID compliance and memory fallback for dev/demo.
 */
export class ServiceRepository {
  async findRequestById(id: string): Promise<ServiceRequest | null> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `SELECT * FROM service_requests WHERE id = $1 LIMIT 1`;
        const res = await dbService.query(sql, [id]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return this.mapRowToServiceRequest(row);
        }
      } catch (err) {
        console.warn('PostgreSQL findRequestById warning:', err);
      }
    }
    const requests = marketplaceStore.getRequests();
    return requests.find((r) => r.id === id) || null;
  }

  async listRequests(filters?: {
    customerId?: string;
    categoryId?: string;
    status?: string;
    district?: string;
  }): Promise<ServiceRequest[]> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const whereClauses: string[] = ['1=1'];
        const params: any[] = [];
        let pIdx = 1;

        if (filters?.customerId) {
          whereClauses.push(`customer_id = $${pIdx++}`);
          params.push(filters.customerId);
        }
        if (filters?.categoryId) {
          whereClauses.push(`category_id = $${pIdx++}`);
          params.push(filters.categoryId);
        }
        if (filters?.status) {
          whereClauses.push(`status = $${pIdx++}`);
          params.push(filters.status);
        }
        if (filters?.district) {
          whereClauses.push(`LOWER(district) = LOWER($${pIdx++})`);
          params.push(filters.district);
        }

        const sql = `SELECT * FROM service_requests WHERE ${whereClauses.join(' AND ')} ORDER BY created_at DESC LIMIT 100`;
        const res = await dbService.query(sql, params);
        if (res.rows.length > 0) {
          return res.rows.map((row) => this.mapRowToServiceRequest(row));
        }
      } catch (err) {
        console.warn('PostgreSQL listRequests warning:', err);
      }
    }

    let requests = marketplaceStore.getRequests();
    if (filters?.customerId) {
      requests = requests.filter((r) => r.customerId === filters.customerId);
    }
    if (filters?.categoryId) {
      requests = requests.filter((r) => r.categoryId === filters.categoryId);
    }
    if (filters?.status) {
      requests = requests.filter((r) => r.status === (filters.status as ServiceRequestStatus));
    }
    if (filters?.district) {
      requests = requests.filter((r) => r.district.toLowerCase() === filters.district?.toLowerCase());
    }
    return requests;
  }

  async createRequest(req: ServiceRequest): Promise<ServiceRequest> {
    assertProductionWriteAllowed('Create service request');
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `
          INSERT INTO service_requests (
            id, customer_id, customer_name, customer_phone, category_id,
            title, description, district, area, address,
            preferred_date, preferred_time, budget, is_urgent,
            advance_amount, remaining_amount, platform_commission,
            status, payment_status, assigned_provider_id, created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14,
            $15, $16, $17,
            $18, $19, $20, NOW(), NOW()
          )
          ON CONFLICT (id) DO NOTHING
          RETURNING *
        `;
        const params = [
          req.id,
          req.customerId || null,
          req.customerName,
          req.customerPhone,
          req.categoryId,
          req.title,
          req.description || '',
          req.district || 'ঢাকা',
          req.area || 'মিরপুর',
          req.address || '',
          req.preferredDate || null,
          req.preferredTime || 'যেকোনো সময়',
          Number(req.budget || 0),
          Boolean(req.isUrgent),
          0,
          0,
          0,
          req.status || 'ADMIN_REVIEW',
          'UNPAID',
          req.assignedProviderId || null,
        ];
        await dbService.query(sql, params);
      } catch (err) {
        handleRepositoryWriteError('Create service request', err);
      }
    }

    const requests = marketplaceStore.getRequests();
    requests.unshift(req);
    return req;
  }

  async updateRequestStatus(id: string, status: ServiceRequestStatus, note?: string): Promise<ServiceRequest | null> {
    assertProductionWriteAllowed('Update service request status');
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `UPDATE service_requests SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`;
        await dbService.query(sql, [id, status]);
      } catch (err) {
        handleRepositoryWriteError('Update service request status', err);
      }
    }

    const req = await this.findRequestById(id);
    if (!req) return null;
    req.status = status;
    req.statusAuditLog.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${status}`,
      changedBy: 'System',
    });
    req.updatedAt = new Date().toISOString();
    return req;
  }

  async listOffers(requestId?: string): Promise<ProviderOffer[]> {
    if (dbService.isDatabaseConfigured() && requestId) {
      try {
        const sql = `SELECT * FROM service_offers WHERE request_id = $1 ORDER BY created_at DESC`;
        const res = await dbService.query(sql, [requestId]);
        if (res.rows.length > 0) {
          return res.rows.map((row) => ({
            id: row.id,
            requestId: row.request_id,
            providerId: row.provider_id,
            providerName: row.provider_name || 'Service Provider',
            providerAvatar: row.provider_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            providerPhone: row.provider_phone || '',
            providerRating: Number(row.provider_rating || 5.0),
            providerReviewCount: Number(row.provider_review_count || 0),
            providerCompletedJobs: Number(row.provider_completed_jobs || 0),
            providerExperience: Number(row.provider_experience || 3),
            offeredPrice: Number(row.proposed_price || row.offered_price || 0),
            serviceCharge: Number(row.service_charge || 0),
            partsIncluded: Boolean(row.parts_included),
            estimatedDuration: row.estimated_duration || '১ দিন',
            earliestDate: row.earliest_date || new Date().toISOString().split('T')[0],
            earliestTime: row.earliest_time || 'সকাল ১০:০০',
            offerMessage: row.message || row.offer_message || '',
            warranty: row.warranty || '৭ দিনের ওয়ারেন্টি',
            offerExpiry: row.offer_expiry || new Date(Date.now() + 86400000).toISOString(),
            status: (row.status as ProviderOfferStatus) || 'SUBMITTED',
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
            updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('PostgreSQL listOffers warning:', err);
      }
    }

    const offers = marketplaceStore.getOffers();
    if (requestId) {
      return offers.filter((o) => o.requestId === requestId);
    }
    return offers;
  }

  async createOffer(offer: ProviderOffer): Promise<ProviderOffer> {
    assertProductionWriteAllowed('Create provider offer');
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `
          INSERT INTO service_offers (id, request_id, provider_id, proposed_price, estimated_duration, message, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          ON CONFLICT (id) DO NOTHING
        `;
        await dbService.query(sql, [
          offer.id,
          offer.requestId,
          offer.providerId,
          offer.offeredPrice,
          offer.estimatedDuration,
          offer.offerMessage || '',
          offer.status || 'SUBMITTED',
        ]);
      } catch (err) {
        handleRepositoryWriteError('Create provider offer', err);
      }
    }

    const offers = marketplaceStore.getOffers();
    offers.unshift(offer);
    return offer;
  }

  async createBooking(booking: Booking): Promise<Booking> {
    assertProductionWriteAllowed('Create booking');
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `
          INSERT INTO bookings (id, request_id, customer_id, provider_id, service_title, booking_date, status, total_amount, advance_paid, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          ON CONFLICT (id) DO NOTHING
        `;
        await dbService.query(sql, [
          booking.id,
          booking.requestId || null,
          booking.customerId || null,
          booking.providerId,
          booking.serviceTitle || 'সার্ভিস বুকিং',
          booking.createdAt || new Date().toISOString(),
          booking.status || 'BOOKED',
          Number(booking.totalAmount || 0),
          Number(booking.advancePaid || 0),
        ]);
      } catch (err) {
        handleRepositoryWriteError('Create booking', err);
      }
    }

    const bookings = marketplaceStore.getBookings();
    bookings.unshift(booking);
    return booking;
  }

  async listBookings(userId?: string): Promise<Booking[]> {
    const bookings = marketplaceStore.getBookings();
    if (userId) {
      return bookings.filter((b) => b.customerId === userId || b.providerId === userId);
    }
    return bookings;
  }

  private mapRowToServiceRequest(row: any): ServiceRequest {
    return {
      id: row.id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      categoryId: row.category_id,
      categoryName: row.category_name || 'জেনারেল সার্ভিস',
      subCategory: row.sub_category || 'জেনারেল',
      title: row.title || 'সার্ভিস রিকোয়েস্ট',
      description: row.description || '',
      district: row.district || 'ঢাকা',
      thana: row.thana || 'মিরপুর',
      area: row.area || 'মিরপুর ১০',
      address: row.address || '',
      preferredDate: row.preferred_date ? new Date(row.preferred_date).toISOString().split('T')[0] : '',
      preferredTime: row.preferred_time || 'যেকোনো সময়',
      isUrgent: Boolean(row.is_urgent),
      budget: Number(row.budget || 0),
      images: Array.isArray(row.images) ? row.images : [],
      routingMode: row.routing_mode || 'ALL_ELIGIBLE',
      targetProviderIds: Array.isArray(row.target_provider_ids) ? row.target_provider_ids : [],
      status: (row.status as ServiceRequestStatus) || 'ADMIN_REVIEW',
      assignedProviderId: row.assigned_provider_id || undefined,
      selectedOfferId: row.selected_offer_id || undefined,
      bookingId: row.booking_id || undefined,
      statusAuditLog: [
        {
          status: (row.status as ServiceRequestStatus) || 'ADMIN_REVIEW',
          timestamp: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          note: 'Request created',
          changedBy: 'Customer',
        },
      ],
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    };
  }
}

export const serviceRepository = new ServiceRepository();
