import { catalogRepository } from '../../repositories/catalog.repository';
import {
  Product,
  DoctorProfile,
  NurseProfile,
  HotelProfile,
  EBook,
  JobPost,
  UsedProductListing,
  ServiceCategory,
  HeroBannerSlide,
} from '../../types';

/**
 * Business Logic Layer - Marketplace Catalog Service
 */
export class CatalogService {
  getCategories(): ServiceCategory[] {
    return catalogRepository.getCategories();
  }

  getServiceModules(query?: string | null, categoryGroup?: string | null) {
    let modules = query
      ? catalogRepository.searchServiceModules(query)
      : catalogRepository.getServiceModules();

    if (categoryGroup) {
      modules = modules.filter((m) => m.categoryGroup === categoryGroup);
    }
    return modules;
  }

  getProducts(filters?: { category?: string; sellerId?: string; search?: string }): Product[] {
    return catalogRepository.getProducts(filters);
  }

  getProductById(id: string): Product | null {
    return catalogRepository.getProductById(id);
  }

  createProduct(productData: Parameters<typeof catalogRepository.addProduct>[0]): Product {
    return catalogRepository.addProduct(productData);
  }

  getDoctors(filters?: { specialty?: string; district?: string; search?: string }): DoctorProfile[] {
    return catalogRepository.getDoctors(filters);
  }

  getDoctorById(id: string): DoctorProfile | null {
    return catalogRepository.getDoctorById(id);
  }

  getNurses(filters?: { area?: string; shiftType?: string }): NurseProfile[] {
    return catalogRepository.getNurses(filters);
  }

  getHotels(filters?: { location?: string; search?: string }): HotelProfile[] {
    return catalogRepository.getHotels(filters);
  }

  getEbooks(filters?: { category?: string; search?: string }): EBook[] {
    return catalogRepository.getEbooks(filters);
  }

  getJobs(): JobPost[] {
    return catalogRepository.getJobs();
  }

  getUsedProducts(): UsedProductListing[] {
    return catalogRepository.getUsedProducts();
  }

  getHeroBanners(): HeroBannerSlide[] {
    return catalogRepository.getHeroBanners();
  }
}

export const catalogService = new CatalogService();
