import { marketplaceStore } from '../services/marketplaceStore.ts';
import { serviceRegistry } from '../lib/serviceRegistry.ts';
import { dbService } from '../db/database.ts';
import {
  assertProductionWriteAllowed,
  handleRepositoryWriteError,
} from '../lib/persistence-policy.ts';
import type {
  Product,
  DoctorProfile,
  NurseProfile,
  HotelProfile,
  EBook,
  JobPost,
  UsedProductListing,
  ServiceCategory,
  HeroBannerSlide,
} from '../types/index.ts';

/**
 * Data Access Layer (Repository Pattern) - Catalog Repository
 */
export class CatalogRepository {
  getCategories(): ServiceCategory[] {
    return marketplaceStore.getCategories();
  }

  getServiceModules() {
    return serviceRegistry.getActiveModules();
  }

  searchServiceModules(query: string) {
    return serviceRegistry.searchModules(query);
  }

  getProducts(filters?: { category?: string; sellerId?: string; search?: string }): Product[] {
    let products = marketplaceStore.getProducts();
    if (filters?.category) {
      products = products.filter((p) => p.category.toLowerCase() === filters.category?.toLowerCase());
    }
    if (filters?.sellerId) {
      products = products.filter((p) => p.sellerId === filters.sellerId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return products;
  }

  getProductById(id: string): Product | null {
    return marketplaceStore.getProducts().find((p) => p.id === id) || null;
  }

  addProduct(productData: Parameters<typeof marketplaceStore.addProduct>[0]): Product {
    assertProductionWriteAllowed('Add product to catalog');
    const product = marketplaceStore.addProduct(productData);
    if (dbService.isDatabaseConfigured()) {
      dbService
        .query(
          `INSERT INTO products (id, seller_id, title, description, category, price, discount_price, stock_quantity, images, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
          [
            product.id,
            product.sellerId,
            product.title,
            product.description,
            product.category,
            product.price,
            product.discountPrice || null,
            product.stock,
            JSON.stringify(product.images),
            product.inStock,
          ]
        )
        .catch((err) => {
          handleRepositoryWriteError('Add product to database', err);
        });
    }
    return product;
  }

  getDoctors(filters?: { specialty?: string; district?: string; search?: string }): DoctorProfile[] {
    let doctors = marketplaceStore.getDoctors();
    if (filters?.specialty) {
      doctors = doctors.filter((d) => d.specialization.toLowerCase() === filters.specialty?.toLowerCase());
    }
    if (filters?.district) {
      doctors = doctors.filter((d) => d.district.toLowerCase() === filters.district?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.hospitalChamber.toLowerCase().includes(q)
      );
    }
    return doctors;
  }

  getDoctorById(id: string): DoctorProfile | null {
    return marketplaceStore.getDoctors().find((d) => d.id === id) || null;
  }

  getNurses(filters?: { area?: string; shiftType?: string }): NurseProfile[] {
    let nurses = marketplaceStore.getNurses();
    if (filters?.area) {
      nurses = nurses.filter((n) => n.area.toLowerCase().includes(filters.area!.toLowerCase()));
    }
    return nurses;
  }

  getHotels(filters?: { location?: string; search?: string }): HotelProfile[] {
    let hotels = marketplaceStore.getHotels();
    if (filters?.location) {
      const loc = filters.location.toLowerCase();
      hotels = hotels.filter((h) => h.area.toLowerCase().includes(loc) || h.district.toLowerCase().includes(loc));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      hotels = hotels.filter(
        (h) => h.name.toLowerCase().includes(q) || h.area.toLowerCase().includes(q) || h.district.toLowerCase().includes(q)
      );
    }
    return hotels;
  }

  getEbooks(filters?: { category?: string; search?: string }): EBook[] {
    let ebooks = marketplaceStore.getEbooks();
    if (filters?.category) {
      ebooks = ebooks.filter((b) => b.category.toLowerCase() === filters.category?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      ebooks = ebooks.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }
    return ebooks;
  }

  getEbookById(id: string): EBook | null {
    return marketplaceStore.getEbooks().find((b) => b.id === id) || null;
  }

  getJobs(): JobPost[] {
    return marketplaceStore.getJobs();
  }

  getUsedProducts(): UsedProductListing[] {
    return marketplaceStore.getUsedProducts();
  }

  getHeroBanners(): HeroBannerSlide[] {
    return marketplaceStore.getHeroBanners();
  }

  getSystemSettings() {
    return marketplaceStore.getSettings();
  }
}

export const catalogRepository = new CatalogRepository();
