import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/api';

interface User {
  id: number;
  email: string;
  username: string;
  profile_picture?: string;
  xp: number;
  level: number;
  total_discoveries: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, refresh: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const res = await fetchWithAuth('/users/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } catch (error) {
      console.error("Auth check failed", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (token: string, refresh: string) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refresh);
    checkAuth();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
