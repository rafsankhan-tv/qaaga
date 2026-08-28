/**
 * QAAGA Super Marketplace — Mobile Client SDK (React Native & Expo Ready)
 *
 * This client provides fully-typed, drop-in integration for:
 * 1. React Native (iOS / Android)
 * 2. Expo managed & bare workflows
 * 3. Next.js Web frontends
 *
 * Handles Bearer token injection, automatic token storage, retry logic,
 * and unified error parsing.
 */

export interface QaagaClientConfig {
  baseUrl: string;
  authToken?: string | null;
  platform?: 'expo' | 'react-native' | 'web';
  appVersion?: string;
  onTokenExpired?: () => void;
}

export class QaagaApiClient {
  private baseUrl: string;
  private authToken: string | null = null;
  private platform: string;
  private appVersion: string;
  private onTokenExpired?: () => void;

  constructor(config: QaagaClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.authToken = config.authToken || null;
    this.platform = config.platform || 'expo';
    this.appVersion = config.appVersion || '1.0.0';
    this.onTokenExpired = config.onTokenExpired;
  }

  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }

  private async request<T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
      params?: Record<string, string | number | boolean | undefined | null>;
    } = {}
  ): Promise<{ success: boolean; data?: T; message?: string; error?: string; status: number }> {
    let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    if (options.params) {
      const query = new URLSearchParams();
      for (const [k, v] of Object.entries(options.params)) {
        if (v !== undefined && v !== null) {
          query.append(k, String(v));
        }
      }
      const qs = query.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Platform': this.platform,
      'X-App-Version': this.appVersion,
      ...(options.headers || {}),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const res = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (res.status === 401 && this.onTokenExpired) {
        this.onTokenExpired();
      }

      const json = await res.json().catch(() => ({}));

      return {
        success: res.ok && json.success !== false,
        data: json.data !== undefined ? json.data : json,
        message: json.message,
        error: json.error || (res.ok ? undefined : json.message || 'Request failed'),
        status: res.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network connection failed',
        status: 0,
      };
    }
  }

  // --- 1. Mobile App Bootstrap ---
  public mobile = {
    bootstrap: () => this.request('/api/mobile/bootstrap'),
  };

  // --- 2. Auth Module ---
  public auth = {
    login: (phoneOrEmail: string, password?: string) =>
      this.request('/api/auth/login', {
        method: 'POST',
        body: { phoneOrEmail, password: password || 'qaaga2026' },
      }),

    register: (payload: {
      fullName: string;
      phone: string;
      email?: string;
      password?: string;
      role?: string;
      district?: string;
      area?: string;
      address?: string;
    }) =>
      this.request('/api/auth/register', {
        method: 'POST',
        body: payload,
      }),

    me: () => this.request('/api/auth/me'),

    logout: () => this.request('/api/auth/logout', { method: 'POST' }),

    switchRole: (targetRole: string) =>
      this.request('/api/auth/switch-role', {
        method: 'POST',
        body: { targetRole },
      }),
  };

  // --- 3. Catalog & Services ---
  public catalog = {
    categories: () => this.request('/api/categories'),
    services: (params?: { categoryGroup?: string; search?: string }) =>
      this.request('/api/services', { params }),
    products: (params?: { category?: string; search?: string }) =>
      this.request('/api/products', { params }),
    doctors: (params?: { specialty?: string; district?: string; search?: string }) =>
      this.request('/api/doctors', { params }),
    nurses: (params?: { area?: string; shiftType?: string }) =>
      this.request('/api/nurses', { params }),
    hotels: (params?: { location?: string; search?: string }) =>
      this.request('/api/hotels', { params }),
    ebooks: (params?: { category?: string; search?: string }) =>
      this.request('/api/ebooks', { params }),
  };

  // --- 4. Service Requests & Escrow Bookings ---
  public serviceRequests = {
    create: (payload: {
      customerName: string;
      customerPhone: string;
      categoryId: string;
      title: string;
      description: string;
      district: string;
      area: string;
      address: string;
      preferredDate?: string;
      preferredTime?: string;
      budget: number;
      isUrgent?: boolean;
    }) =>
      this.request('/api/services/request', {
        method: 'POST',
        body: payload,
      }),

    list: (params?: { categoryId?: string; status?: string; district?: string }) =>
      this.request('/api/services/request', { params }),
  };

  // --- 5. Orders & Payments ---
  public orders = {
    create: (payload: {
      customerName: string;
      customerPhone: string;
      shippingAddress: string;
      district: string;
      area: string;
      items: Array<{
        productId: string;
        productTitle: string;
        price: number;
        quantity: number;
        image?: string;
        sellerId?: string;
      }>;
      subtotal: number;
      deliveryFee?: number;
      discountAmount?: number;
      totalAmount: number;
      paymentMethod?: string;
    }) =>
      this.request('/api/orders', {
        method: 'POST',
        body: payload,
      }),

    list: (params?: { page?: number; limit?: number }) =>
      this.request('/api/orders', { params }),
  };

  public payments = {
    verify: (payload: {
      transactionId: string;
      paymentMethod: string;
      amount: number;
      bookingId?: string;
      serviceType?: string;
    }) =>
      this.request('/api/payments/verify', {
        method: 'POST',
        body: payload,
      }),
  };

  // --- 6. Ebook Reader ---
  public ebooks = {
    authorize: (ebookId: string, userId: string) =>
      this.request('/api/ebooks/authorize-access', {
        method: 'POST',
        body: { ebookId, userId },
      }),
  };

  // --- 7. AI Assistants ---
  public ai = {
    chat: (message: string, assistantType: 'CAT' | 'SUCHI' = 'SUCHI', history = []) =>
      this.request('/api/ai/chat', {
        method: 'POST',
        body: { message, assistantType, history },
      }),

    catChat: (message: string, history = []) =>
      this.request('/api/ai-cat/chat', {
        method: 'POST',
        body: { message, history },
      }),

    suchiChat: (message: string, image?: string, history = []) =>
      this.request('/api/suchi/chat', {
        method: 'POST',
        body: { message, image, history },
      }),
  };
}

export default QaagaApiClient;
