'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

interface UserContextType {
  user: AuthResponse | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = () => {
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    
    // Listen for storage events (in case login happens in another tab)
    const handleStorageChange = () => loadUser();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <UserContext.Provider value={{ user, loading, logout, refreshUser: loadUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
