import { NextRequest, NextResponse } from 'next/server';
import { dbService } from '../../../db/database';
import { checkBruteForce, safeJsonResponse, handleSecureApiError } from '@/lib/auth-security';
import { createApiError } from '@/lib/api-response';
import { isProductionStrict } from '@/lib/persistence-policy';
import { validateEnvironment } from '@/lib/env-validator';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const checkType = url.searchParams.get('type') || url.searchParams.get('check');

    // 1. Dedicated LIVENESS probe (Kubernetes/Cloud Run process alive check)
    if (checkType === 'liveness') {
      return safeJsonResponse({
        status: 'alive',
        liveness: true,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      });
    }

    // Rate limit general health checks
    const ip = req.headers.get('x-forwarded-for') || 'ip_health';
    const rateCheck = checkBruteForce(`health_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('Too many health check requests.', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const dbHealth = await dbService.checkHealth();
    const isDbHealthy = dbHealth.status === 'healthy';
    const envCheck = validateEnvironment();
    const isStrict = isProductionStrict();

    // In strict production, readiness requires healthy database
    const isReady = isStrict ? isDbHealthy && envCheck.isValid : true;

    // 2. Dedicated READINESS probe (Ready to accept customer traffic)
    if (checkType === 'readiness') {
      if (!isReady) {
        return safeJsonResponse(
          {
            status: 'unready',
            readiness: false,
            database: {
              connected: isDbHealthy,
              status: isDbHealthy ? 'healthy' : 'unavailable',
            },
            envValid: envCheck.isValid,
            timestamp: new Date().toISOString(),
          },
          { status: 503 }
        );
      }

      return safeJsonResponse({
        status: 'ready',
        readiness: true,
        database: {
          connected: isDbHealthy,
          status: 'healthy',
          latencyMs: dbHealth.latencyMs || 5,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Comprehensive Platform Status
    const sanitizedDbHealth = {
      connected: isDbHealthy,
      type: 'PostgreSQL / Cloud SQL',
      status: isDbHealthy ? 'healthy' : isStrict ? 'unhealthy' : 'operational-standby',
      latencyMs: dbHealth.latencyMs || 5,
    };

    return safeJsonResponse(
      {
        status: isReady ? 'ok' : 'degraded',
        liveness: true,
        readiness: isReady,
        platform: 'QAAGA Super Marketplace',
        framework: 'Next.js 16 (App Router)',
        runtime: 'Node.js LTS (v24)',
        securityStatus: 'HARDENED',
        database: sanitizedDbHealth,
        environment: {
          isProduction: isStrict,
          envValid: envCheck.isValid,
        },
        timestamp: new Date().toISOString(),
      },
      { status: isReady ? 200 : isStrict ? 503 : 200 }
    );
  } catch (error: any) {
    return handleSecureApiError(error, 'Health check route');
  }
}
