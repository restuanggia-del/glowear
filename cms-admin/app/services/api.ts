import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001",
});

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
