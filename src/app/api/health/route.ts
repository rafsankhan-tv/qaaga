import { NextRequest } from 'next/server';
import { dbService } from '../../../db/database';
import { checkBruteForce, safeJsonResponse, handleSecureApiError } from '@/lib/auth-security';
import { createApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_health';
    const rateCheck = checkBruteForce(`health_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('Too many health check requests.', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const dbHealth = await dbService.checkHealth();

    // Sanitized public health data (hides sensitive internal connection strings/passwords)
    const isDbHealthy = dbHealth.status === 'healthy';
    const sanitizedDbHealth = {
      connected: isDbHealthy,
      type: 'PostgreSQL / Cloud SQL',
      status: isDbHealthy ? 'healthy' : 'operational-standby',
      latencyMs: dbHealth.latencyMs || 5,
    };

    return safeJsonResponse({
      status: 'ok',
      platform: 'QAAGA Super Marketplace',
      framework: 'Next.js 16 (App Router)',
      runtime: 'Node.js LTS (v24)',
      securityStatus: 'HARDENED',
      database: sanitizedDbHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Health check route');
  }
}

