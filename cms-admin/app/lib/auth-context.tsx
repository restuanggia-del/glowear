"use client";

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";

import { loginUser, registerUser, validateDashboardAccess, type RegisterData } from "../services/api";

type User = {
  id: string;
  email: string;
  nama: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, kataSandi: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  validate: () => Promise<boolean>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  validate: async () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, kataSandi: string) => {
    try {
      const data = await loginUser({email, kataSandi});
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    const result = await registerUser(data);
    // User can login after register
    console.log("Register success", result);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const validate = async (): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }
    try {
      const result = await validateDashboardAccess(user.id);
      return result.valid;
    } catch (error) {
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, validate, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
