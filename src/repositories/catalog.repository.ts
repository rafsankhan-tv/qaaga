import { marketplaceStore } from '../services/marketplaceStore.ts';
import { serviceRegistry } from '../lib/serviceRegistry.ts';
import { dbService } from '../db/database.ts';
import { MARKETPLACE_CATEGORIES } from '../data/categoriesData.ts';
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

  async seedCategoriesIfEmpty(): Promise<void> {
    if (!dbService.isDatabaseConfigured()) return;
    try {
      const check = await dbService.query(`SELECT COUNT(*) as count FROM service_categories`);
      const count = parseInt(check.rows[0]?.count || '0', 10);
      if (count === 0) {
        for (let i = 0; i < MARKETPLACE_CATEGORIES.length; i++) {
          const cat = MARKETPLACE_CATEGORIES[i];
          await dbService.query(
            `INSERT INTO service_categories (
              id, name_bn, name_en, icon, description_bn, description_en,
              slug, subcategories, default_advance_percent, min_price,
              banner_image, is_featured, category_type, is_active, display_order,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, $14, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING`,
            [
              cat.id,
              cat.banglaName || cat.name,
              cat.name,
              cat.iconName || 'Wrench',
              cat.description,
              cat.description,
              cat.slug || cat.id,
              JSON.stringify(cat.subcategories || []),
              cat.defaultAdvancePercent || 20,
              cat.minPrice || 500,
              cat.bannerImage || '',
              Boolean(cat.isFeatured),
              cat.categoryType || 'SERVICE',
              i + 1,
            ]
          );
        }
      }
    } catch (err) {
      console.warn('PostgreSQL seedCategoriesIfEmpty warning:', err);
    }
  }

  async getCategoriesAsync(): Promise<ServiceCategory[]> {
    if (dbService.isDatabaseConfigured()) {
      try {
        await this.seedCategoriesIfEmpty();
        const sql = `SELECT * FROM service_categories WHERE is_active = true ORDER BY display_order ASC, created_at ASC`;
        const res = await dbService.query(sql);
        if (res.rows.length > 0) {
          const categories: ServiceCategory[] = res.rows.map((row) => ({
            id: row.id,
            name: row.name_en,
            banglaName: row.name_bn || row.name_en,
            slug: row.slug || row.id,
            iconName: row.icon || 'Wrench',
            description: row.description_en || row.description_bn || '',
            defaultAdvancePercent: Number(row.default_advance_percent || 20),
            minPrice: Number(row.min_price || 500),
            subcategories: typeof row.subcategories === 'string' ? JSON.parse(row.subcategories) : (row.subcategories || []),
            bannerImage: row.banner_image || '',
            isFeatured: Boolean(row.is_featured || row.is_popular),
            categoryType: (row.category_type as any) || 'SERVICE',
          }));
          marketplaceStore.setCategories(categories);
          return categories;
        }
      } catch (err) {
        console.warn('PostgreSQL getCategoriesAsync warning:', err);
      }
    }
    return marketplaceStore.getCategories();
  }

  async createCategory(cat: ServiceCategory): Promise<ServiceCategory> {
    assertProductionWriteAllowed('Create category');
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `
          INSERT INTO service_categories (
            id, name_bn, name_en, icon, description_bn, description_en,
            slug, subcategories, default_advance_percent, min_price,
            banner_image, is_featured, category_type, is_active, display_order,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, 0, NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            name_bn = EXCLUDED.name_bn,
            name_en = EXCLUDED.name_en,
            icon = EXCLUDED.icon,
            description_bn = EXCLUDED.description_bn,
            description_en = EXCLUDED.description_en,
            slug = EXCLUDED.slug,
            subcategories = EXCLUDED.subcategories,
            default_advance_percent = EXCLUDED.default_advance_percent,
            min_price = EXCLUDED.min_price,
            banner_image = EXCLUDED.banner_image,
            is_featured = EXCLUDED.is_featured,
            category_type = EXCLUDED.category_type,
            updated_at = NOW()
          RETURNING *
        `;
        const params = [
          cat.id,
          cat.banglaName || cat.name,
          cat.name,
          cat.iconName || 'Wrench',
          cat.description,
          cat.description,
          cat.slug || cat.id,
          JSON.stringify(cat.subcategories || []),
          cat.defaultAdvancePercent || 20,
          cat.minPrice || 500,
          cat.bannerImage || '',
          Boolean(cat.isFeatured),
          cat.categoryType || 'SERVICE',
        ];
        await dbService.query(sql, params);
      } catch (err) {
        handleRepositoryWriteError('Create category in PostgreSQL', err);
      }
    }
    marketplaceStore.addCategory(cat);
    return cat;
  }

  async updateCategory(id: string, updates: Partial<ServiceCategory>): Promise<ServiceCategory | null> {
    assertProductionWriteAllowed('Update category');
    if (dbService.isDatabaseConfigured()) {
      try {
        const setClauses: string[] = ['updated_at = NOW()'];
        const params: any[] = [id];
        let pIdx = 2;

        if (updates.name !== undefined) {
          setClauses.push(`name_en = $${pIdx++}`);
          params.push(updates.name);
        }
        if (updates.banglaName !== undefined) {
          setClauses.push(`name_bn = $${pIdx++}`);
          params.push(updates.banglaName);
        }
        if (updates.iconName !== undefined) {
          setClauses.push(`icon = $${pIdx++}`);
          params.push(updates.iconName);
        }
        if (updates.description !== undefined) {
          setClauses.push(`description_en = $${pIdx++}`);
          params.push(updates.description);
          setClauses.push(`description_bn = $${pIdx++}`);
          params.push(updates.description);
        }
        if (updates.subcategories !== undefined) {
          setClauses.push(`subcategories = $${pIdx++}`);
          params.push(JSON.stringify(updates.subcategories));
        }
        if (updates.defaultAdvancePercent !== undefined) {
          setClauses.push(`default_advance_percent = $${pIdx++}`);
          params.push(updates.defaultAdvancePercent);
        }
        if (updates.minPrice !== undefined) {
          setClauses.push(`min_price = $${pIdx++}`);
          params.push(updates.minPrice);
        }
        if (updates.bannerImage !== undefined) {
          setClauses.push(`banner_image = $${pIdx++}`);
          params.push(updates.bannerImage);
        }
        if (updates.isFeatured !== undefined) {
          setClauses.push(`is_featured = $${pIdx++}`);
          params.push(updates.isFeatured);
        }
        if (updates.categoryType !== undefined) {
          setClauses.push(`category_type = $${pIdx++}`);
          params.push(updates.categoryType);
        }

        const sql = `UPDATE service_categories SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`;
        await dbService.query(sql, params);
      } catch (err) {
        handleRepositoryWriteError('Update category in PostgreSQL', err);
      }
    }
    marketplaceStore.updateCategory(id, updates);
    return marketplaceStore.getCategories().find((c) => c.id === id) || null;
  }

  async deleteCategory(id: string): Promise<boolean> {
    assertProductionWriteAllowed('Delete category');
    if (dbService.isDatabaseConfigured()) {
      try {
        await dbService.query(`DELETE FROM service_categories WHERE id = $1`, [id]);
      } catch (err) {
        handleRepositoryWriteError('Delete category in PostgreSQL', err);
      }
    }
    marketplaceStore.deleteCategory(id);
    return true;
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
