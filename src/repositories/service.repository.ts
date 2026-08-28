import { marketplaceStore } from '../services/marketplaceStore';
import { ServiceRequest, ProviderOffer, Booking, ServiceRequestStatus } from '../types';

/**
 * Data Access Layer (Repository Pattern) - Service & Escrow Request Repository
 */
export class ServiceRepository {
  async findRequestById(id: string): Promise<ServiceRequest | null> {
    const requests = marketplaceStore.getRequests();
    return requests.find((r) => r.id === id) || null;
  }

  async listRequests(filters?: {
    customerId?: string;
    categoryId?: string;
    status?: string;
    district?: string;
  }): Promise<ServiceRequest[]> {
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
    const requests = marketplaceStore.getRequests();
    requests.unshift(req);
    return req;
  }

  async updateRequestStatus(id: string, status: ServiceRequestStatus, note?: string): Promise<ServiceRequest | null> {
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
    const offers = marketplaceStore.getOffers();
    if (requestId) {
      return offers.filter((o) => o.requestId === requestId);
    }
    return offers;
  }

  async createOffer(offer: ProviderOffer): Promise<ProviderOffer> {
    const offers = marketplaceStore.getOffers();
    offers.unshift(offer);
    return offer;
  }

  async createBooking(booking: Booking): Promise<Booking> {
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
}

export const serviceRepository = new ServiceRepository();
