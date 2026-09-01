import { marketplaceStore } from '../services/marketplaceStore.ts';
import { dbService } from '../db/database.ts';
import type { UserProfile, UserRole } from '../types/index.ts';
import {
  assertProductionWriteAllowed,
  handleRepositoryWriteError,
  isProductionStrict,
} from '../lib/persistence-policy.ts';

/**
 * Data Access Layer (Repository Pattern) - User Repository
 * PostgreSQL-backed with in-memory sync and resilient fallback.
 */
export class UserRepository {
  async findById(id: string): Promise<UserProfile | null> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `SELECT * FROM users WHERE id = $1 LIMIT 1`;
        const res = await dbService.query(sql, [id]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            fullName: row.full_name || row.name || 'User',
            phone: row.phone,
            email: row.email || '',
            avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            gender: row.gender || 'male',
            division: row.division || 'ঢাকা',
            district: row.district || 'ঢাকা',
            thana: row.thana || 'মিরপুর',
            area: row.area || 'মিরপুর ১০',
            address: row.address || '',
            roles: [row.role as UserRole],
            activeRole: (row.role as UserRole) || 'CUSTOMER',
            accountStatus: row.is_active === false ? 'suspended' : 'active',
            isVerified: Boolean(row.is_verified),
            rating: Number(row.rating || 5.0),
            reviewCount: Number(row.review_count || 0),
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
            updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('PostgreSQL findById fallback to local store:', err);
      }
    }
    const users = marketplaceStore.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  async findByPhone(phone: string): Promise<UserProfile | null> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `SELECT * FROM users WHERE phone = $1 LIMIT 1`;
        const res = await dbService.query(sql, [phone]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            fullName: row.full_name || row.name || 'User',
            phone: row.phone,
            email: row.email || '',
            avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            gender: row.gender || 'male',
            division: row.division || 'ঢাকা',
            district: row.district || 'ঢাকা',
            thana: row.thana || 'মিরপুর',
            area: row.area || 'মিরপুর ১০',
            address: row.address || '',
            roles: [row.role as UserRole],
            activeRole: (row.role as UserRole) || 'CUSTOMER',
            accountStatus: row.is_active === false ? 'suspended' : 'active',
            isVerified: Boolean(row.is_verified),
            rating: Number(row.rating || 5.0),
            reviewCount: Number(row.review_count || 0),
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
            updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('PostgreSQL findByPhone fallback to local store:', err);
      }
    }
    const users = marketplaceStore.getUsers();
    return users.find((u) => u.phone === phone) || null;
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`;
        const res = await dbService.query(sql, [email]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            fullName: row.full_name || row.name || 'User',
            phone: row.phone,
            email: row.email || '',
            avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            gender: row.gender || 'male',
            division: row.division || 'ঢাকা',
            district: row.district || 'ঢাকা',
            thana: row.thana || 'মিরপুর',
            area: row.area || 'মিরপুর ১০',
            address: row.address || '',
            roles: [row.role as UserRole],
            activeRole: (row.role as UserRole) || 'CUSTOMER',
            accountStatus: row.is_active === false ? 'suspended' : 'active',
            isVerified: Boolean(row.is_verified),
            rating: Number(row.rating || 5.0),
            reviewCount: Number(row.review_count || 0),
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
            updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('PostgreSQL findByEmail fallback to local store:', err);
      }
    }
    const users = marketplaceStore.getUsers();
    return users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null;
  }

  async findByPhoneOrEmail(identifier: string): Promise<UserProfile | null> {
    const clean = identifier.trim().toLowerCase();
    if (clean.includes('@')) {
      return this.findByEmail(clean);
    }
    return this.findByPhone(identifier.trim());
  }

  async create(user: UserProfile & { passwordHash?: string }): Promise<UserProfile> {
    assertProductionWriteAllowed('User registration');
    if (dbService.isDatabaseConfigured()) {
      try {
        const sql = `
          INSERT INTO users (id, full_name, phone, email, password_hash, role, district, area, address, is_verified, is_active, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
          ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name, updated_at = NOW()
          RETURNING *
        `;
        const params = [
          user.id,
          user.fullName,
          user.phone,
          user.email || null,
          user.passwordHash || null,
          user.activeRole || user.roles[0] || 'CUSTOMER',
          user.district || 'ঢাকা',
          user.area || null,
          user.address || null,
          Boolean(user.isVerified),
          true,
        ];
        await dbService.query(sql, params);
      } catch (err) {
        handleRepositoryWriteError('User creation', err);
      }
    }
    marketplaceStore.addUser(user);
    return user;
  }

  async update(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    assertProductionWriteAllowed('User profile update');
    if (dbService.isDatabaseConfigured()) {
      try {
        const setClauses: string[] = ['updated_at = NOW()'];
        const params: any[] = [id];
        let pIdx = 2;

        if (updates.fullName !== undefined) {
          setClauses.push(`full_name = $${pIdx++}`);
          params.push(updates.fullName);
        }
        if (updates.email !== undefined) {
          setClauses.push(`email = $${pIdx++}`);
          params.push(updates.email);
        }
        if (updates.district !== undefined) {
          setClauses.push(`district = $${pIdx++}`);
          params.push(updates.district);
        }
        if (updates.area !== undefined) {
          setClauses.push(`area = $${pIdx++}`);
          params.push(updates.area);
        }
        if (updates.address !== undefined) {
          setClauses.push(`address = $${pIdx++}`);
          params.push(updates.address);
        }
        if (updates.activeRole !== undefined) {
          setClauses.push(`role = $${pIdx++}`);
          params.push(updates.activeRole);
        }
        if (updates.avatarUrl !== undefined) {
          setClauses.push(`avatar_url = $${pIdx++}`);
          params.push(updates.avatarUrl);
        }

        const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $1`;
        await dbService.query(sql, params);
      } catch (err) {
        handleRepositoryWriteError('User update', err);
      }
    }
    marketplaceStore.updateUser(id, updates);
    return this.findById(id);
  }

  async updateActiveRole(id: string, role: UserRole): Promise<boolean> {
    return (await this.update(id, { activeRole: role })) !== null;
  }

  async listAll(): Promise<UserProfile[]> {
    if (dbService.isDatabaseConfigured()) {
      try {
        const res = await dbService.query(`SELECT * FROM users ORDER BY created_at DESC LIMIT 100`);
        if (res.rows.length > 0) {
          return res.rows.map((row) => ({
            id: row.id,
            fullName: row.full_name || row.name || 'User',
            phone: row.phone,
            email: row.email || '',
            avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            gender: row.gender || 'male',
            division: row.division || 'ঢাকা',
            district: row.district || 'ঢাকা',
            thana: row.thana || 'মিরপুর',
            area: row.area || 'মিরপুর ১০',
            address: row.address || '',
            roles: [row.role as UserRole],
            activeRole: (row.role as UserRole) || 'CUSTOMER',
            accountStatus: row.is_active === false ? 'suspended' : 'active',
            isVerified: Boolean(row.is_verified),
            rating: Number(row.rating || 5.0),
            reviewCount: Number(row.review_count || 0),
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
            updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('PostgreSQL listAll users warning:', err);
      }
    }
    return marketplaceStore.getUsers();
  }
}

export const userRepository = new UserRepository();
