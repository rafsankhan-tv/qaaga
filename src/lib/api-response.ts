import { NextResponse } from 'next/server';
import { applySecurityHeaders } from './auth-security';

/**
 * QAAGA Super Marketplace — Standardized Multi-Platform API Envelope
 * Designed for Next.js Web + React Native + Expo Mobile Applications.
 */

export interface ApiResponseMeta {
  timestamp: string;
  version: string;
  platform?: string;
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta: ApiResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  validationErrors?: Record<string, string[] | string>;
  meta: ApiResponseMeta;
}

const API_VERSION = '1.0.0';

/**
 * Attach CORS headers specifically allowing Mobile Apps (Expo / React Native)
 * and Web clients.
 */
export function setMobileCorsHeaders(res: NextResponse): NextResponse {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, X-Client-Platform, X-App-Version, X-Device-Id, X-Expo-Push-Token'
  );
  res.headers.set('Access-Control-Max-Age', '86400');
  return res;
}

export function createApiSuccess<T>(
  data: T,
  options?: {
    message?: string;
    status?: number;
    pagination?: ApiResponseMeta['pagination'];
    extraMeta?: Record<string, any>;
    customHeaders?: Record<string, string>;
  }
): NextResponse {
  const status = options?.status || 200;
  const meta: ApiResponseMeta = {
    timestamp: new Date().toISOString(),
    version: API_VERSION,
    ...(options?.pagination ? { pagination: options.pagination } : {}),
    ...(options?.extraMeta || {}),
  };

  // We format with data and top-level fields for backwards compatibility with web frontend
  const body: any = {
    success: true,
    ...(options?.message ? { message: options.message } : {}),
    ...(typeof data === 'object' && data !== null && !Array.isArray(data) ? data : { data }),
    data,
    meta,
  };

  const res = NextResponse.json(body, { status });
  applySecurityHeaders(res);
  setMobileCorsHeaders(res);

  if (options?.customHeaders) {
    for (const [key, value] of Object.entries(options.customHeaders)) {
      res.headers.set(key, value);
    }
  }

  return res;
}

export function createApiError(
  errorMessage: string,
  options?: {
    status?: number;
    code?: string;
    validationErrors?: Record<string, string[] | string>;
    extraMeta?: Record<string, any>;
  }
): NextResponse {
  const status = options?.status || 400;
  const meta: ApiResponseMeta = {
    timestamp: new Date().toISOString(),
    version: API_VERSION,
    ...(options?.extraMeta || {}),
  };

  const body: ApiErrorResponse = {
    success: false,
    error: errorMessage,
    ...(options?.code ? { code: options.code } : {}),
    ...(options?.validationErrors ? { validationErrors: options.validationErrors } : {}),
    meta,
  };

  const res = NextResponse.json(body, { status });
  applySecurityHeaders(res);
  setMobileCorsHeaders(res);

  return res;
}

export function handleOptionsCors(): NextResponse {
  const res = new NextResponse(null, { status: 204 });
  setMobileCorsHeaders(res);
  return res;
}
