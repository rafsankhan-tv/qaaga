import { NextRequest, NextResponse } from "next/server";
import { UserRegisterSchema } from "@/lib/validation";
import {
  hashPassword,
  signAuthToken,
  setAuthCookie,
  sanitizeString,
  checkBruteForce,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  safeJsonResponse,
  handleSecureApiError,
} from "@/lib/auth-security";
import { marketplaceStore } from "@/services/marketplaceStore";
import { UserProfile, UserRole } from "@/types";

export async function POST(req: NextRequest) {
  try {
    // 1. CSRF & Origin Validation
    if (!validateOriginAndCSRF(req)) {
      return safeJsonResponse(
        { success: false, message: "Invalid request origin or CSRF check failed." },
        { status: 403 }
      );
    }

    // 2. Request Size Limit (Max 64KB)
    const jsonResult = await parseJsonWithLimit(req, 64 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    // 3. Zod Schema Validation
    const validationResult = UserRegisterSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((e) => e.message).join(", ");
      return safeJsonResponse(
        { success: false, message: errorMsg },
        { status: 400 }
      );
    }

    const { fullName, phone, email, password, role, district, area, address } = validationResult.data;
    const ip = req.headers.get("x-forwarded-for") || "ip_reg";

    // 4. Rate Limiting on IP & Registration Key (Max 8 registrations per 15 minutes)
    const ipRateCheck = checkBruteForce(`ip_reg_${ip}`, 8, 15 * 60 * 1000, 30 * 60 * 1000);
    if (!ipRateCheck.allowed) {
      return safeJsonResponse(
        { success: false, message: ipRateCheck.message },
        { status: 429 }
      );
    }

    const phoneRateCheck = checkBruteForce(`reg_phone_${phone}`, 5, 15 * 60 * 1000, 30 * 60 * 1000);
    if (!phoneRateCheck.allowed) {
      return safeJsonResponse(
        { success: false, message: phoneRateCheck.message },
        { status: 429 }
      );
    }

    // 5. Check for Duplicate User
    const existingUsers = marketplaceStore.getUsers();
    const phoneExists = existingUsers.some((u) => u.phone === phone);
    if (phoneExists) {
      return safeJsonResponse(
        { success: false, message: "এই ফোন নম্বরটি দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে। দয়া করে লগইন করুন।" },
        { status: 409 }
      );
    }

    if (email && email.trim()) {
      const emailExists = existingUsers.some((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        return safeJsonResponse(
          { success: false, message: "এই ইমেইল ঠিকানাটি ইতোমধ্যে ব্যবহার করা হয়েছে।" },
          { status: 409 }
        );
      }
    }

    // 6. Secure Bcrypt Password Hashing with Salt 12
    const plainPass = password || "qaaga2026";
    const hashedPassword = await hashPassword(plainPass);

    // 7. Create Sanitized User Profile
    const selectedRole = (role as UserRole) || "CUSTOMER";
    const newUser: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: sanitizeString(fullName),
      phone: sanitizeString(phone),
      email: email ? sanitizeString(email) : `${phone}@qaaga.user.local`,
      roles: [selectedRole, "CUSTOMER"],
      activeRole: selectedRole,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
      gender: "male",
      division: "ঢাকা",
      district: sanitizeString(district || "ঢাকা"),
      thana: "মিরপুর",
      area: sanitizeString(area || "মিরপুর"),
      address: address ? sanitizeString(address) : "মিরপুর, ঢাকা",
      accountStatus: "active",
      isVerified: true,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store user with hashed password
    (newUser as any).passwordHash = hashedPassword;
    marketplaceStore.addUser(newUser);

    // 8. Sign JWT Session Token & Set HttpOnly Secure Cookie
    const token = signAuthToken({
      userId: newUser.id,
      phone: newUser.phone,
      email: newUser.email,
      fullName: newUser.fullName,
      roles: newUser.roles,
      activeRole: newUser.activeRole || "CUSTOMER",
    });

    const response = safeJsonResponse(
      {
        success: true,
        message: "সফলভাবে রেজিস্ট্রেশন সম্পন্ন হয়েছে।",
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          phone: newUser.phone,
          email: newUser.email,
          roles: newUser.roles,
          activeRole: newUser.activeRole,
          avatarUrl: newUser.avatarUrl,
          district: newUser.district,
          area: newUser.area,
          isVerified: newUser.isVerified,
        },
        token: token,
      },
      { status: 201 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    return handleSecureApiError(error, "User registration processing");
  }
}
