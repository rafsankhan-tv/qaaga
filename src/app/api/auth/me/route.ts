import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, ROLE_PERMISSIONS, safeJsonResponse, handleSecureApiError } from "@/lib/auth-security";
import { marketplaceStore } from "@/services/marketplaceStore";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated || !auth.user) {
      return auth.errorResponse || safeJsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    const users = marketplaceStore.getUsers();
    const user = users.find((u) => u.id === auth.user?.userId);

    if (!user) {
      return safeJsonResponse({ error: "User session is invalid or user not found" }, { status: 404 });
    }

    const activeRole = auth.user.activeRole || user.activeRole || "CUSTOMER";
    const permissions = ROLE_PERMISSIONS[activeRole] || [];

    return safeJsonResponse({
      authenticated: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        roles: user.roles,
        activeRole: activeRole,
        avatarUrl: user.avatarUrl,
        district: user.district,
        area: user.area,
        isVerified: user.isVerified,
      },
      permissions,
    });
  } catch (error: any) {
    return handleSecureApiError(error, "Fetch session profile");
  }
}
