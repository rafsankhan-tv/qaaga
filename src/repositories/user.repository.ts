import { marketplaceStore } from '../services/marketplaceStore';
import { UserProfile, UserRole } from '../types';

/**
 * Data Access Layer (Repository Pattern) - User Repository
 */
export class UserRepository {
  async findById(id: string): Promise<UserProfile | null> {
    const users = marketplaceStore.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  async findByPhone(phone: string): Promise<UserProfile | null> {
    const users = marketplaceStore.getUsers();
    return users.find((u) => u.phone === phone) || null;
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const users = marketplaceStore.getUsers();
    return users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null;
  }

  async findByPhoneOrEmail(identifier: string): Promise<UserProfile | null> {
    const clean = identifier.trim().toLowerCase();
    const users = marketplaceStore.getUsers();
    return (
      users.find(
        (u) => u.phone === identifier.trim() || u.email?.toLowerCase() === clean
      ) || null
    );
  }

  async create(user: UserProfile & { passwordHash?: string }): Promise<UserProfile> {
    marketplaceStore.addUser(user);
    return user;
  }

  async update(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    marketplaceStore.updateUser(id, updates);
    return this.findById(id);
  }

  async updateActiveRole(id: string, role: UserRole): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;
    marketplaceStore.updateUser(id, { activeRole: role });
    return true;
  }

  async listAll(): Promise<UserProfile[]> {
    return marketplaceStore.getUsers();
  }
}

export const userRepository = new UserRepository();
