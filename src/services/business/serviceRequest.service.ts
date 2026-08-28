import { serviceRepository } from '../../repositories/service.repository';
import { sanitizeString } from '../../lib/auth-security';
import { ServiceRequestInput } from '../../lib/validation';
import { ServiceRequest } from '../../types';

export interface ServiceRequestResult {
  success: boolean;
  message: string;
  request?: ServiceRequest;
  errorCode?: string;
  statusCode?: number;
}

/**
 * Business Logic Layer - Home Service & Escrow Booking Request Service
 */
export class ServiceRequestService {
  async createServiceRequest(
    input: ServiceRequestInput,
    authenticatedUserId?: string | null
  ): Promise<ServiceRequestResult> {
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newRequest: ServiceRequest = {
      id,
      customerId: authenticatedUserId || `anon_${Date.now()}`,
      customerName: sanitizeString(input.customerName),
      customerPhone: sanitizeString(input.customerPhone),
      categoryId: sanitizeString(input.categoryId),
      categoryName: 'সার্ভিস রিকোয়েস্ট',
      subCategory: 'সাধারণ মেরামত',
      title: sanitizeString(input.title),
      description: sanitizeString(input.description),
      district: sanitizeString(input.district),
      thana: 'সদর',
      area: sanitizeString(input.area),
      address: sanitizeString(input.address),
      images: [],
      routingMode: 'ALL_ELIGIBLE',
      targetProviderIds: [],
      preferredDate: input.preferredDate || now.split('T')[0],
      preferredTime: input.preferredTime || '10:00 AM - 12:00 PM',
      budget: input.budget,
      isUrgent: !!input.isUrgent,
      status: 'SUBMITTED',
      statusAuditLog: [
        {
          status: 'SUBMITTED',
          timestamp: now,
          note: 'Request created by customer',
          changedBy: input.customerName,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    await serviceRepository.createRequest(newRequest);

    return {
      success: true,
      message: 'সার্ভিস রিকোয়েস্ট সফলভাবে জমা হয়েছে। টেকনিশিয়ানদের অফার শীঘ্রই পাবেন।',
      request: newRequest,
      statusCode: 201,
    };
  }

  async listRequests(filters?: {
    customerId?: string;
    categoryId?: string;
    status?: string;
    district?: string;
  }): Promise<ServiceRequest[]> {
    return serviceRepository.listRequests(filters);
  }

  async getRequestById(id: string): Promise<ServiceRequest | null> {
    return serviceRepository.findRequestById(id);
  }
}

export const serviceRequestService = new ServiceRequestService();
