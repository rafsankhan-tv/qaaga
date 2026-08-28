import { userRepository } from '../../repositories/user.repository';
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  sanitizeString,
  JWTPayload,
} from '../../lib/auth-security';
import { UserLoginInput, UserRegisterInput } from '../../lib/validation';
import { UserProfile, UserRole } from '../../types';

export interface AuthResult {
  success: boolean;
  message: string;
  user?: Partial<UserProfile>;
  token?: string;
  errorCode?: string;
  statusCode?: number;
}

/**
 * Business Logic Layer - Authentication & Account Management Service
 * Pure domain logic: Independent of HTTP transport or framework.
 */
export class AuthService {
  async login(input: UserLoginInput): Promise<AuthResult> {
    const cleanIdentifier = sanitizeString(input.phoneOrEmail).toLowerCase();
    const user = await userRepository.findByPhoneOrEmail(cleanIdentifier);

    if (!user) {
      return {
        success: false,
        message: 'মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়।',
        errorCode: 'INVALID_CREDENTIALS',
        statusCode: 401,
      };
    }

    const isPasswordValid = await verifyPassword(input.password, (user as any).passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়।',
        errorCode: 'INVALID_CREDENTIALS',
        statusCode: 401,
      };
    }

    const activeRole = user.activeRole || user.roles[0] || 'CUSTOMER';
    const token = signAuthToken({
      userId: user.id,
      phone: user.phone,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      activeRole: activeRole,
    });

    return {
      success: true,
      message: `স্বাগতম, ${user.fullName}! লগইন সফল হয়েছে।`,
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
      token,
      statusCode: 200,
    };
  }

  async register(input: UserRegisterInput): Promise<AuthResult> {
    const existingByPhone = await userRepository.findByPhone(input.phone);
    if (existingByPhone) {
      return {
        success: false,
        message: 'এই ফোন নম্বরটি দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে। দয়া করে লগইন করুন।',
        errorCode: 'PHONE_EXISTS',
        statusCode: 409,
      };
    }

    if (input.email && input.email.trim()) {
      const existingByEmail = await userRepository.findByEmail(input.email);
      if (existingByEmail) {
        return {
          success: false,
          message: 'এই ইমেইল ঠিকানাটি ইতোমধ্যে ব্যবহার করা হয়েছে।',
          errorCode: 'EMAIL_EXISTS',
          statusCode: 409,
        };
      }
    }

    const plainPass = input.password || 'qaaga2026';
    const hashedPassword = await hashPassword(plainPass);
    const selectedRole = (input.role as UserRole) || 'CUSTOMER';

    const newUser: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: sanitizeString(input.fullName),
      phone: sanitizeString(input.phone),
      email: input.email ? sanitizeString(input.email) : `${input.phone}@qaaga.user.local`,
      roles: [selectedRole, 'CUSTOMER'],
      activeRole: selectedRole,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      gender: 'male',
      division: 'ঢাকা',
      district: sanitizeString(input.district || 'ঢাকা'),
      thana: 'মিরপুর',
      area: sanitizeString(input.area || 'মিরপুর'),
      address: input.address ? sanitizeString(input.address) : 'মিরপুর, ঢাকা',
      accountStatus: 'active',
      isVerified: true,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (newUser as any).passwordHash = hashedPassword;
    await userRepository.create(newUser);

    const token = signAuthToken({
      userId: newUser.id,
      phone: newUser.phone,
      email: newUser.email,
      fullName: newUser.fullName,
      roles: newUser.roles,
      activeRole: newUser.activeRole || 'CUSTOMER',
    });

    return {
      success: true,
      message: 'সফলভাবে রেজিস্ট্রেশন সম্পন্ন হয়েছে।',
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
      token,
      statusCode: 201,
    };
  }

  async switchRole(userPayload: JWTPayload, targetRole: UserRole): Promise<AuthResult> {
    const isSuperAdmin = userPayload.roles.includes('SUPER_ADMIN');
    if (!isSuperAdmin && !userPayload.roles.includes(targetRole)) {
      return {
        success: false,
        message: `Forbidden: You do not possess the role '${targetRole}'.`,
        errorCode: 'ROLE_UNAUTHORIZED',
        statusCode: 403,
      };
    }

    await userRepository.updateActiveRole(userPayload.userId, targetRole);

    const newToken = signAuthToken({
      userId: userPayload.userId,
      phone: userPayload.phone,
      email: userPayload.email,
      fullName: userPayload.fullName,
      roles: userPayload.roles,
      activeRole: targetRole,
    });

    return {
      success: true,
      message: `রোল পরিবর্তন সফল: ${targetRole}`,
      token: newToken,
      user: {
        id: userPayload.userId,
        activeRole: targetRole,
      },
      statusCode: 200,
    };
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return userRepository.findById(userId);
  }
}

export const authService = new AuthService();
