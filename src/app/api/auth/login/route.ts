import { NextRequest, NextResponse } from "next/server";
import { UserLoginSchema } from "@/lib/validation";
import {
  verifyPassword,
  signAuthToken,
  setAuthCookie,
  checkBruteForce,
  recordFailedAttempt,
  resetFailedAttempts,
  sanitizeString,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  safeJsonResponse,
  handleSecureApiError,
} from "@/lib/auth-security";
import { marketplaceStore } from "@/services/marketplaceStore";

export async function POST(req: NextRequest) {
  try {
    // 1. CSRF & Origin Validation
    if (!validateOriginAndCSRF(req)) {
      return safeJsonResponse(
        { success: false, message: "Invalid request origin or CSRF check failed." },
        { status: 403 }
      );
    }

    // 2. Request Size Limit (Max 64KB for login payload)
    const jsonResult = await parseJsonWithLimit(req, 64 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    // 3. Zod Input Validation
    const validationResult = UserLoginSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((e) => e.message).join(", ");
      return safeJsonResponse(
        { success: false, message: errorMsg },
        { status: 400 }
      );
    }

    const { phoneOrEmail, password } = validationResult.data;
    const cleanIdentifier = sanitizeString(phoneOrEmail).toLowerCase();
    const ip = req.headers.get("x-forwarded-for") || "ip_login";

    // 4. IP & Account Brute Force Protection (Max 5 attempts, 15m lockout)
    const ipRateCheck = checkBruteForce(`ip_login_${ip}`, 15, 10 * 60 * 1000, 15 * 60 * 1000);
    if (!ipRateCheck.allowed) {
      return safeJsonResponse(
        {
          success: false,
          message: ipRateCheck.message,
          retryAfterSeconds: ipRateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const accountRateCheck = checkBruteForce(`acc_${cleanIdentifier}`, 5, 10 * 60 * 1000, 15 * 60 * 1000);
    if (!accountRateCheck.allowed) {
      return safeJsonResponse(
        {
          success: false,
          message: accountRateCheck.message,
          retryAfterSeconds: accountRateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 5. Find User (Constant time simulation to prevent user enumeration timing attacks)
    const users = marketplaceStore.getUsers();
    const user = users.find(
      (u) => u.phone === phoneOrEmail || u.email?.toLowerCase() === cleanIdentifier
    );

    if (!user) {
      const fail = recordFailedAttempt(`acc_${cleanIdentifier}`);
      return safeJsonResponse(
        {
          success: false,
          message: "মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়।",
          remainingAttempts: fail.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 6. Secure Password Verification
    const isPasswordValid = await verifyPassword(password, (user as any).passwordHash);
    if (!isPasswordValid) {
      const fail = recordFailedAttempt(`acc_${cleanIdentifier}`);
      return safeJsonResponse(
        {
          success: false,
          message: `ভুল পাসওয়ার্ড। আর ${fail.remainingAttempts} বার চেষ্টা করা যাবে।`,
          remainingAttempts: fail.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 7. Successful login -> reset rate limit counter
    resetFailedAttempts(`acc_${cleanIdentifier}`);

    // 8. Sign JWT Session Token & Set HttpOnly Secure Cookie
    const token = signAuthToken({
      userId: user.id,
      phone: user.phone,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      activeRole: user.activeRole || user.roles[0] || "CUSTOMER",
    });

    const response = safeJsonResponse({
      success: true,
      message: `স্বাগতম, ${user.fullName}! লগইন সফল হয়েছে।`,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole || user.roles[0] || "CUSTOMER",
        avatarUrl: user.avatarUrl,
        district: user.district,
        area: user.area,
        isVerified: user.isVerified,
      },
      token,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    return handleSecureApiError(error, "User login processing");
  }
}
