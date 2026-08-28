import { catalogRepository } from '../../repositories/catalog.repository';
import { userRepository } from '../../repositories/user.repository';
import { UserProfile } from '../../types';

export interface MobileBootstrapPayload {
  appConfig: {
    minSupportedVersion: string;
    currentVersion: string;
    forceUpdate: boolean;
    maintenanceMode: boolean;
    supportHotline: string;
    supportWhatsapp: string;
    supportEmail: string;
    currencySymbol: string;
    currencyCode: string;
  };
  featureFlags: {
    enableCatAssistant: boolean;
    enableSuchiVision: boolean;
    enableNagadBkashAutoPay: boolean;
    enableEbookReader: boolean;
    enableInstantDoctorBooking: boolean;
    enableUsedMarketplace: boolean;
  };
  banners: any[];
  categories: any[];
  trendingProducts: any[];
  featuredDoctors: any[];
  hotlineInfo: {
    hotline: string;
    whatsapp: string;
    email: string;
  };
  user?: Partial<UserProfile> | null;
}

/**
 * Business Logic Layer - Mobile App Configuration & Bootstrap Service
 * Optimized for React Native + Expo Single-Roundtrip Startup.
 */
export class MobileService {
  async getMobileBootstrap(userId?: string | null): Promise<MobileBootstrapPayload> {
    const banners = catalogRepository.getHeroBanners();
    const categories = catalogRepository.getCategories();
    const allProducts = catalogRepository.getProducts();
    const trendingProducts = allProducts.slice(0, 8);
    const doctors = catalogRepository.getDoctors();
    const featuredDoctors = doctors.slice(0, 6);

    let userProfile: Partial<UserProfile> | null = null;
    if (userId) {
      const u = await userRepository.findById(userId);
      if (u) {
        userProfile = {
          id: u.id,
          fullName: u.fullName,
          phone: u.phone,
          email: u.email,
          roles: u.roles,
          activeRole: u.activeRole,
          avatarUrl: u.avatarUrl,
          district: u.district,
          area: u.area,
          isVerified: u.isVerified,
        };
      }
    }

    return {
      appConfig: {
        minSupportedVersion: '1.0.0',
        currentVersion: '1.2.0',
        forceUpdate: false,
        maintenanceMode: false,
        supportHotline: '09658824360',
        supportWhatsapp: '+8801644985301',
        supportEmail: 'qaaga@consultant.com',
        currencySymbol: '৳',
        currencyCode: 'BDT',
      },
      featureFlags: {
        enableCatAssistant: true,
        enableSuchiVision: true,
        enableNagadBkashAutoPay: true,
        enableEbookReader: true,
        enableInstantDoctorBooking: true,
        enableUsedMarketplace: true,
      },
      banners,
      categories,
      trendingProducts,
      featuredDoctors,
      hotlineInfo: {
        hotline: '09658824360',
        whatsapp: '+8801644985301',
        email: 'qaaga@consultant.com',
      },
      user: userProfile,
    };
  }
}

export const mobileService = new MobileService();
