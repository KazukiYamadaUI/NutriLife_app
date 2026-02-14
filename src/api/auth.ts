import { apiClient, isBackendAvailable } from './client';
import { User } from '@/types';

interface AuthResponse {
  token: string;
  user: User;
}

// Mock implementation for offline / development
const mockAuth = {
  sendCode: async (_phone: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 1000));
  },

  verifyCode: async (phone: string, _code: string): Promise<AuthResponse> => {
    await new Promise((r) => setTimeout(r, 800));
    return {
      token: 'mock_token_' + Date.now(),
      user: {
        id: 'u_' + Date.now(),
        phone,
        displayName: 'ユーザー',
        gender: 'other',
      },
    };
  },
};

export const authApi = {
  sendCode: async (phone: string): Promise<void> => {
    if (!isBackendAvailable()) {
      return mockAuth.sendCode(phone);
    }
    await apiClient.post('/auth/send-code', { phone });
  },

  verifyCode: async (phone: string, code: string): Promise<AuthResponse> => {
    if (!isBackendAvailable()) {
      return mockAuth.verifyCode(phone, code);
    }
    const { data } = await apiClient.post<AuthResponse>('/auth/verify', { phone, code });
    return data;
  },
};
