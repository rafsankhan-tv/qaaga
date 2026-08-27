import { NextRequest, NextResponse } from "next/server";
import {
  authenticateRequest,
  signAuthToken,
  setAuthCookie,
  validateOriginAndCSRF,
  parseJsonWithLimit,
  safeJsonResponse,
  handleSecureApiError,
} from "@/lib/auth-security";
import { RoleSwitchSchema } from "@/lib/validation";
import { UserRole } from "@/types";

export async function POST(req: NextRequest) {
  try {
    // 1. CSRF & Origin Validation
    if (!validateOriginAndCSRF(req)) {
      return safeJsonResponse(
        { error: "Invalid request origin or CSRF check failed." },
        { status: 403 }
      );
    }

    // 2. Authentication Check
    const auth = await authenticateRequest(req);
    if (!auth.authenticated || !auth.user) {
      return auth.errorResponse || safeJsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Request Size Limit
    const jsonResult = await parseJsonWithLimit(req, 16 * 1024);
    if (!jsonResult.success) {
      return jsonResult.errorResponse!;
    }

    // 4. Zod Validation
    const validationResult = RoleSwitchSchema.safeParse(jsonResult.data);
    if (!validationResult.success) {
      return safeJsonResponse(
        { error: validationResult.error.issues[0]?.message || "Invalid role specified." },
        { status: 400 }
      );
    }

    const { targetRole } = validationResult.data;

    // 5. Privilege Escalation Prevention (User must own the role or be SUPER_ADMIN)
    const userRoles = auth.user.roles || [];
    const isSuperAdmin = userRoles.includes("SUPER_ADMIN");

    if (!isSuperAdmin && !userRoles.includes(targetRole as UserRole)) {
      return safeJsonResponse(
        { error: `Forbidden: You do not possess the role '${targetRole}'. Please register as a partner first.` },
        { status: 403 }
      );
    }

    // 6. Issue refreshed secure JWT session with updated active role
    const updatedToken = signAuthToken({
      userId: auth.user.userId,
      phone: auth.user.phone,
      email: auth.user.email,
      fullName: auth.user.fullName,
      roles: auth.user.roles,
      activeRole: targetRole as UserRole,
    });

    const response = safeJsonResponse({
      success: true,
      activeRole: targetRole,
      message: `রোল পরিবর্তন সফল: ${targetRole}`,
    });

    setAuthCookie(response, updatedToken);
    return response;
  } catch (error: any) {
    return handleSecureApiError(error, "Role switch authorization");
  }
}
