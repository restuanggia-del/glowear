"use client";

import { createContext, useContext, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  nama: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, kataSandi: string) => Promise<void>;
  register: (data: { nama: string; username: string; email: string; kataSandi: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const initUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser) as User;
    }
    return null;
  };

  const [user, setUser] = useState<User | null>(initUser());
  const [loading, setLoading] = useState(false);
  const isAdmin = !!user && user.role === 'ADMIN';

  const login = async (email: string, kataSandi: string) => {
    const res = await api.post('/auth/login', { email, kataSandi });
    const userData = res.data.user;
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (data: { nama: string; username: string; email: string; kataSandi: string }) => {
    const res = await api.post('/auth/register', data);
    const userData = res.data.user;
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin,
      login, 
      register, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

