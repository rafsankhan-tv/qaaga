import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  checkBruteForce,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  safeJsonResponse,
  handleSecureApiError,
  extractAuthTokenFromRequest,
  verifyAuthToken,
} from "@/lib/auth-security";
import { EbookAuthorizeSchema } from "@/lib/validation";

const EBOOK_SIGNING_KEY = process.env.EBOOK_TOKEN_SECRET || process.env.JWT_SECRET || "qaaga-ebook-secure-signing-secret-2026";

export async function POST(req: NextRequest) {
  try {
    // 1. Origin / CSRF Validation
    if (!validateOriginAndCSRF(req)) {
      return safeJsonResponse(
        { authorized: false, message: "Invalid request origin or CSRF check failed." },
        { status: 403 }
      );
    }

    // 2. IP Rate Limiting (Max 30 book access requests per 10 minutes)
    const ip = req.headers.get("x-forwarded-for") || "ip_ebook";
    const rateCheck = checkBruteForce(`ebook_${ip}`, 30, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return safeJsonResponse(
        {
          authorized: false,
          message: "অতিরিক্ত ইবুক অ্যাক্সেস রিকোয়েস্ট। কিছুক্ষণ পর চেষ্টা করুন।",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 3. Request Size Limit (Max 32KB)
    const jsonResult = await parseJsonWithLimit(req, 32 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    // 4. Zod Schema Validation
    const validationResult = EbookAuthorizeSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      return safeJsonResponse(
        { authorized: false, message: validationResult.error.issues[0]?.message || "Invalid parameters." },
        { status: 400 }
      );
    }

    const { ebookId, userId } = validationResult.data;

    // 5. Check Session / Identity (IDOR Protection)
    const sessionToken = extractAuthTokenFromRequest(req);
    if (sessionToken) {
      const userPayload = verifyAuthToken(sessionToken);
      if (userPayload && userPayload.userId !== userId && !userPayload.roles.includes("SUPER_ADMIN")) {
        // User cannot request access for another user ID
        return safeJsonResponse(
          { authorized: false, message: "Forbidden: Session identity mismatch." },
          { status: 403 }
        );
      }
    }

    // 6. Generate Cryptographically Signed HMAC Token with Expiry
    const timestamp = Date.now();
    const expiryTimestamp = timestamp + 3600 * 1000; // 1 hour validity
    const rawPayload = `${userId}:${ebookId}:${expiryTimestamp}`;
    const signature = crypto
      .createHmac("sha256", EBOOK_SIGNING_KEY)
      .update(rawPayload)
      .digest("hex")
      .substring(0, 32);

    const secureReaderToken = `EBK_${Buffer.from(rawPayload).toString("base64")}.${signature}`;

    return safeJsonResponse({
      authorized: true,
      secureReaderToken,
      expiresIn: 3600,
      readerUrl: `/reader/ebook/${encodeURIComponent(ebookId)}?token=${encodeURIComponent(secureReaderToken)}`,
    });
  } catch (error: any) {
    return handleSecureApiError(error, "Ebook authorization processing");
  }
}
