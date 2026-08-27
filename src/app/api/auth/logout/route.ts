import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, safeJsonResponse, validateOriginAndCSRF } from "@/lib/auth-security";

export async function POST(req: NextRequest) {
  if (!validateOriginAndCSRF(req)) {
    return safeJsonResponse(
      { success: false, message: "Invalid request origin or CSRF check failed." },
      { status: 403 }
    );
  }

  const response = safeJsonResponse({
    success: true,
    message: "সফলভাবে লগআউট করা হয়েছে।",
  });

  clearAuthCookie(response);
  return response;
}
