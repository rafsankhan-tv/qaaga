/**
 * QAAGA Super Marketplace — Runtime & Startup Environment Validator
 * Enforces presence and structure of critical production configuration without leaking secrets.
 */

import { z } from 'zod';

const ProductionEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(10, 'DATABASE_URL is required and must be valid in production'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters in production'),
  APP_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  DEMO_MODE: z.string().optional(),
});

export interface EnvValidationResult {
  isValid: boolean;
  isProduction: boolean;
  missingKeys: string[];
  errors: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const isProd = process.env.NODE_ENV === 'production' && process.env.DEMO_MODE !== 'true';

  if (!isProd) {
    return {
      isValid: true,
      isProduction: false,
      missingKeys: [],
      errors: [],
    };
  }

  const result = ProductionEnvSchema.safeParse(process.env);
  if (result.success) {
    return {
      isValid: true,
      isProduction: true,
      missingKeys: [],
      errors: [],
    };
  }

  const missingKeys: string[] = [];
  const errors: string[] = [];

  for (const issue of result.error.issues) {
    const key = issue.path.join('.');
    missingKeys.push(key);
    errors.push(`${key}: ${issue.message}`);
  }

  return {
    isValid: false,
    isProduction: true,
    missingKeys,
    errors,
  };
}

export function assertValidEnvironment(): void {
  const check = validateEnvironment();
  if (check.isProduction && !check.isValid) {
    throw new Error(
      `[CONFIG FATAL] Production environment configuration error: Missing or invalid variables [${check.missingKeys.join(
        ', '
      )}]. Detailed: ${check.errors.join('; ')}`
    );
  }
}
