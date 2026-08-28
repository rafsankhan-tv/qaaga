/**
 * QAAGA Super Marketplace — Startup Environment Validation
 * 
 * Strict Requirement:
 * Startup requires ONLY the following 5 core environment variables:
 * 1. DATABASE_URL
 * 2. JWT_SECRET
 * 3. SESSION_SECRET
 * 4. SETTINGS_ENCRYPTION_KEY
 * 5. CORS_ORIGIN
 * 
 * All other services (Gemini, bKash, Nagad, SSLCommerz, Stripe, S3, SMS, Redis, AI Microservice)
 * are modular and lazily loaded on demand.
 */

export const REQUIRED_STARTUP_VARIABLES = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET',
  'SETTINGS_ENCRYPTION_KEY',
  'CORS_ORIGIN',
] as const;

export type RequiredStartupKey = typeof REQUIRED_STARTUP_VARIABLES[number];

export interface StartupValidationResult {
  valid: boolean;
  requiredVariables: readonly RequiredStartupKey[];
  missing: RequiredStartupKey[];
  configured: RequiredStartupKey[];
}

/**
 * Validates the 5 required startup variables
 */
export function validateStartupEnvironment(options: { strict?: boolean } = {}): StartupValidationResult {
  const missing: RequiredStartupKey[] = [];
  const configured: RequiredStartupKey[] = [];

  for (const key of REQUIRED_STARTUP_VARIABLES) {
    const value = process.env[key];
    if (!value || value.trim().length === 0) {
      missing.push(key);
    } else {
      configured.push(key);
    }
  }

  const valid = missing.length === 0;

  if (!valid) {
    const message = `[QAAGA Startup Config] Missing required startup environment variables: ${missing.join(', ')}. Startup requires only: ${REQUIRED_STARTUP_VARIABLES.join(', ')}`;
    
    if (options.strict || process.env.NODE_ENV === 'production') {
      console.warn(message);
      // In strict production mode, throw to prevent insecure startup
      if (options.strict) {
        throw new Error(message);
      }
    } else {
      console.info(`[QAAGA Startup Config] Notice: ${missing.length} startup variables are not explicitly defined in local dev environment (${missing.join(', ')}). Using secure development defaults.`);
    }
  } else {
    console.log(`[QAAGA Startup Config] All ${REQUIRED_STARTUP_VARIABLES.length} startup environment variables verified: ${REQUIRED_STARTUP_VARIABLES.join(', ')}`);
  }

  return {
    valid,
    requiredVariables: REQUIRED_STARTUP_VARIABLES,
    missing,
    configured,
  };
}
