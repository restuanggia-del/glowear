import axios from "axios";
import { API_URL } from "../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor: otomatis attach JWT token ke setiap request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: handle 401 Unauthorized — redirect ke login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid — hapus data & redirect
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      // Note: Navigation handled by the app checking token presence
    }
    return Promise.reject(error);
  }
);