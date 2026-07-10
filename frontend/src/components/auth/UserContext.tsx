'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { AuthResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { clearAuthSession, getStorageMode, getStoredToken, getStoredUser, persistAuthSession, subscribeToAuthChanges, syncAuthSessionFromBrowserState } from '@/lib/auth-session';
import { isJwtExpired } from '@/lib/auth-jwt';

interface UserContextType {
  user: AuthResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthResponse | null>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  logout: async () => {},
  refreshUser: async () => null,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    syncAuthSessionFromBrowserState();

    try {
      const token = getStoredToken();
      const storedUser = getStoredUser();
      
      if (!token) {
        setUser(null);
        return null;
      }

      if (isJwtExpired(token, 5)) {
        clearAuthSession('expired');
        setUser(null);
        return null;
      }
    
      const profile = await authService.getMe();
      const nextUser: AuthResponse = {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email ?? storedUser?.email ?? '',
        phoneNumber: profile.phoneNumber ?? storedUser?.phoneNumber ?? '',
        role: profile.role ?? storedUser?.role ?? '',
        token,
      };
    
      persistAuthSession(nextUser, getStorageMode() === 'local', 'login', false);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      console.error('Error validating current session:', error);
      clearAuthSession('invalid');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      if (!isMounted) {
        return;
      }

      setLoading(true);
      await loadUser();
    };

    void refresh();

    const unsubscribe = subscribeToAuthChanges(() => {
      void refresh();
    });

    const handlePageRestore = () => {
      void refresh();
    };

    window.addEventListener('pageshow', handlePageRestore);
    document.addEventListener('visibilitychange', handlePageRestore);

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener('pageshow', handlePageRestore);
      document.removeEventListener('visibilitychange', handlePageRestore);
    };
  }, [loadUser]);

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.replace('/login');
  };

  return (
    <UserContext.Provider value={{ user, loading, isAuthenticated: !!user, logout, refreshUser: loadUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
