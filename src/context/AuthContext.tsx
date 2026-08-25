import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { marketplaceStore } from '../services/marketplaceStore';

interface AuthContextType {
  currentUser: UserProfile | null;
  activeRole: UserRole;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isProvider: boolean;
  isSeller: boolean;
  unreadNotificationCount: number;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  applyForRole: (role: UserRole) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const users = marketplaceStore.getUsers();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return users[0] || null; // Default to Super Admin / Rafsan Khan
  });
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    return users[0]?.activeRole || 'CUSTOMER';
  });

  const [notificationCount, setNotificationCount] = useState(0);

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

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    if (currentUser) {
      currentUser.activeRole = role;
    }
  };

  const switchUser = (userId: string) => {
    const allUsers = marketplaceStore.getUsers();
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setActiveRole(found.activeRole || found.roles[0]);
    }
  };

  const applyForRole = (role: UserRole) => {
    if (currentUser) {
      if (!currentUser.roles.includes(role)) {
        currentUser.roles.push(role);
        currentUser.activeRole = role;
        setActiveRole(role);
        setCurrentUser({ ...currentUser });
      }
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
      setCurrentUser(updated);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveRole('GUEST');
  };

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
        switchRole,
        switchUser,
        applyForRole,
        updateProfile,
        logout
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
