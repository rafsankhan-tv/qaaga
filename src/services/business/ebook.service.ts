import crypto from 'crypto';
import { catalogRepository } from '../../repositories/catalog.repository';
import { EbookAuthorizeInput } from '../../lib/validation';

const EBOOK_SIGNING_KEY =
  process.env.EBOOK_TOKEN_SECRET || process.env.JWT_SECRET || 'qaaga-ebook-secure-signing-secret-2026';

export interface EbookAuthResult {
  authorized: boolean;
  secureReaderToken?: string;
  expiresIn?: number;
  readerUrl?: string;
  message?: string;
  statusCode?: number;
}

/**
 * Business Logic Layer - Digital eBook DRM & Authorized Reader Token Service
 */
export class EbookService {
  async authorizeAccess(
    input: EbookAuthorizeInput,
    sessionUserId?: string,
    isSuperAdmin = false
  ): Promise<EbookAuthResult> {
    // IDOR Protection: User cannot forge access tokens for another user
    if (sessionUserId && !isSuperAdmin && sessionUserId !== input.userId) {
      return {
        authorized: false,
        message: 'Forbidden: Session identity mismatch.',
        statusCode: 403,
      };
    }

    const ebook = catalogRepository.getEbookById(input.ebookId);
    if (!ebook) {
      return {
        authorized: false,
        message: 'অনুরোধকৃত বইটি পাওয়া যায়নি।',
        statusCode: 404,
      };
    }

    const timestamp = Date.now();
    const expiryTimestamp = timestamp + 3600 * 1000; // 1 hour validity
    const rawPayload = `${input.userId}:${input.ebookId}:${expiryTimestamp}`;
    const signature = crypto
      .createHmac('sha256', EBOOK_SIGNING_KEY)
      .update(rawPayload)
      .digest('hex')
      .substring(0, 32);

    const secureReaderToken = `EBK_${Buffer.from(rawPayload).toString('base64')}.${signature}`;

    return {
      authorized: true,
      secureReaderToken,
      expiresIn: 3600,
      readerUrl: `/reader/ebook/${encodeURIComponent(input.ebookId)}?token=${encodeURIComponent(
        secureReaderToken
      )}`,
      statusCode: 200,
    };
  }

  listEbooks(category?: string, search?: string) {
    return catalogRepository.getEbooks({ category, search });
  }

  getEbookById(id: string) {
    return catalogRepository.getEbookById(id);
  }
}

export const ebookService = new EbookService();
