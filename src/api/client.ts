import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// In development, change this to your local server address
// For Android emulator: http://10.0.2.2:3001
// For iOS simulator: http://localhost:3001
// For physical device: use your computer's local IP
const BASE_URL = __DEV__ ? 'http://localhost:3001/api' : 'https://api.nutrilife.app/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore not available
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - clear stored data
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
    }
    return Promise.reject(error);
  }
);

// Flag to track if backend is available
let useBackend = true;

export const isBackendAvailable = () => useBackend;

// Check backend health on startup
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health-check', { timeout: 5000 });
    useBackend = true;
    return true;
  } catch {
    useBackend = false;
    return false;
  }
};
