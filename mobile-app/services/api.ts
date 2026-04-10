import axios from 'axios';
import { API_URL } from '@/constants/config';

// Ini adalah LOGIKA (Service), tempat kita membuat mesin penarik data
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Anda juga bisa menaruh fungsi-fungsi spesifik di sini
export const loginUser = async (data) => {
  return await api.post('/auth/login', data);
};