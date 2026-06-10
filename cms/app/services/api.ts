import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001",
});

// Interceptor: otomatis attach JWT token ke setiap request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  kataSandi: string;
}

export interface RegisterData {
  nama: string;
  username: string;
  email: string;
  kataSandi: string;
}

export async function loginUser(credentials: LoginCredentials) {
  const { data } = await api.post('/auth/login', credentials);
  return data;
}

export async function registerUser(data: RegisterData) {
  const { data: result } = await api.post('/auth/register', data);
  return result;
}

export async function validateDashboardAccess(id: string) {
  const { data } = await api.post('/auth/validate', { id });
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
}

export async function verifyOtp(email: string, otp: string) {
  const { data } = await api.post('/auth/verify-otp', { email, otp });
  return data;
}

export async function resetPassword(email: string, otp: string, kataSandiBaru: string) {
  const { data } = await api.post('/auth/reset-password', { email, otp, kataSandiBaru });
  return data;
}
