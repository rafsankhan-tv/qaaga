import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '../types';
import { marketplaceStore } from '../services/marketplaceStore';

export interface AuthContextType {
  currentUser: UserProfile | null;
  activeRole: UserRole;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isProvider: boolean;
  isSeller: boolean;
  unreadNotificationCount: number;
  isLoading: boolean;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  applyForRole: (role: UserRole) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  loginWithCredentials: (phoneOrEmail: string, password?: string) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  registerUser: (data: { fullName: string; phone: string; email?: string; password?: string; role?: UserRole; district?: string; area?: string }) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const users = marketplaceStore.getUsers();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return users[0] || null; // Default initial user: Super Admin Rafsan Khan
  });
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    return users[0]?.activeRole || 'CUSTOMER';
  });

  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Sync notification badge count
  useEffect(() => {
    const update = () => {
      if (currentUser) {
        const notifs = marketplaceStore.getNotifications(currentUser.id);
        setNotificationCount(notifs.filter(n => !n.isRead).length);
      }
    };
    update();
    const unsub = marketplaceStore.subscribe(update);
    return unsub;
  }, [currentUser]);

  // Attempt silent session recovery on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            setActiveRole(data.user.activeRole || 'CUSTOMER');
          }
        }
      } catch (e) {
        // Fallback to local store user state if offline/standalone
      }
    };
    checkSession();
  }, []);

  const switchRole = useCallback(async (role: UserRole) => {
    setActiveRole(role);
    if (currentUser) {
      currentUser.activeRole = role;
      setCurrentUser({ ...currentUser, activeRole: role });
    }
    try {
      await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: role }),
        credentials: 'same-origin',
      });
    } catch (e) {
      // Ignored for offline mode
    }
  }, [currentUser]);

  const switchUser = useCallback((userId: string) => {
    const allUsers = marketplaceStore.getUsers();
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setActiveRole(found.activeRole || found.roles[0] || 'CUSTOMER');
    }
  }, []);

  const applyForRole = useCallback((role: UserRole) => {
    if (currentUser) {
      if (!currentUser.roles.includes(role)) {
        currentUser.roles.push(role);
        currentUser.activeRole = role;
        setActiveRole(role);
        setCurrentUser({ ...currentUser });
      }
    }
  }, [currentUser]);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
      setCurrentUser(updated);
    }
  }, [currentUser]);

  const loginWithCredentials = async (phoneOrEmail: string, password: string = '123456') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail, password }),
        credentials: 'same-origin',
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        setActiveRole(data.user.activeRole || 'CUSTOMER');
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || 'লগইন ব্যর্থ হয়েছে।' };
      }
    } catch (err: any) {
      return { success: false, message: 'নেটওয়ার্ক বা সার্ভার ত্রুটি।' };
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (data: {
    fullName: string;
    phone: string;
    email?: string;
    password?: string;
    role?: UserRole;
    district?: string;
    area?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'same-origin',
      });

      const result = await res.json();
      if (res.ok && result.success && result.user) {
        setCurrentUser(result.user);
        setActiveRole(result.user.activeRole || 'CUSTOMER');
        return { success: true, message: result.message, user: result.user };
      } else {
        return { success: false, message: result.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' };
      }
    } catch (err: any) {
      return { success: false, message: 'সার্ভার ত্রুটি।' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch (e) {
      // Ignored
    }
    setCurrentUser(null);
    setActiveRole('GUEST');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        isLoggedIn: !!currentUser,
        isAdmin: activeRole === 'ADMIN' || activeRole === 'SUPER_ADMIN' || currentUser?.roles.includes('SUPER_ADMIN') || false,
        isProvider: activeRole === 'PROVIDER' || currentUser?.roles.includes('PROVIDER') || false,
        isSeller: activeRole === 'SELLER' || currentUser?.roles.includes('SELLER') || false,
        unreadNotificationCount: notificationCount,
        isLoading,
        switchRole,
        switchUser,
        applyForRole,
        updateProfile,
        loginWithCredentials,
        registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
