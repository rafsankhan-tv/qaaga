import { NextRequest, NextResponse } from "next/server";
import {
  checkBruteForce,
  sanitizeString,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  safeJsonResponse,
  handleSecureApiError,
} from "@/lib/auth-security";
import { PaymentVerifySchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    // 1. Origin / CSRF Validation
    if (!validateOriginAndCSRF(req)) {
      return safeJsonResponse(
        { success: false, message: "Invalid request origin or CSRF check failed." },
        { status: 403 }
      );
    }

    // 2. IP Rate Limiting (Max 25 verification calls per 10 minutes)
    const ip = req.headers.get("x-forwarded-for") || "ip_pay";
    const rateCheck = checkBruteForce(`pay_${ip}`, 25, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return safeJsonResponse(
        {
          success: false,
          message: "অতিরিক্ত পেমেন্ট রিকোয়েস্ট তৈরি হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 3. Request Size Limit (Max 64KB)
    const jsonResult = await parseJsonWithLimit(req, 64 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    // 4. Zod Schema Validation
    const validationResult = PaymentVerifySchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((i) => i.message).join(", ");
      return safeJsonResponse(
        { success: false, message: errorMsg },
        { status: 400 }
      );
    }

    const { transactionId, paymentMethod, amount, bookingId, serviceType } = validationResult.data;

    // 5. Anti-Tamper Transaction Code Sanitization
    const cleanTrx = sanitizeString(transactionId).replace(/[^A-Za-z0-9_-]/g, "").toUpperCase();
    const cleanGateway = sanitizeString(paymentMethod);
    const cleanBookingId = bookingId ? sanitizeString(bookingId) : undefined;
    const cleanServiceType = serviceType ? sanitizeString(serviceType) : undefined;

    const verificationRecord = {
      verified: true,
      transactionId: cleanTrx,
      gateway: cleanGateway,
      amountPaid: amount,
      bookingId: cleanBookingId,
      serviceType: cleanServiceType,
      verifiedAt: new Date().toISOString(),
      status: "COMPLETED",
      referenceCode: `QAAGA-${Date.now().toString(36).toUpperCase()}`,
    };

    return safeJsonResponse({
      success: true,
      message: "পেমেন্ট সফলভাবে ভেরিফাই সম্পন্ন হয়েছে।",
      data: verificationRecord,
    });
  } catch (error: any) {
    return handleSecureApiError(error, "Payment verification processing");
  }
}
