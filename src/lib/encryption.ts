import crypto from 'crypto';

/**
 * QAAGA Settings Encryption Service
 * Encrypts and decrypts sensitive marketplace settings, API keys, and vendor credentials
 * using AES-256-GCM authenticated encryption with the required SETTINGS_ENCRYPTION_KEY.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getKeyBuffer(): Buffer {
  const rawKey = process.env.SETTINGS_ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error('SETTINGS_ENCRYPTION_KEY is required for settings encryption/decryption.');
  }

  // Derive 32-byte key via SHA-256 hash to ensure exact 256-bit key length
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * Encrypt sensitive plain text string to format: `iv:authTag:ciphertext` (hex encoded)
 */
export function encryptSetting(plainText: string): string {
  if (!plainText) return '';
  const key = getKeyBuffer();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt `iv:authTag:ciphertext` payload back to utf8 plaintext
 */
export function decryptSetting(encryptedPayload: string): string {
  if (!encryptedPayload || !encryptedPayload.includes(':')) return '';
  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted setting payload format.');
  }

  const [ivHex, authTagHex, cipherTextHex] = parts;
  const key = getKeyBuffer();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(cipherTextHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
