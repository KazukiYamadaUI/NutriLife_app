import { apiClient, isBackendAvailable } from './client';
import { User, Lifestyle } from '@/types';

export const userApi = {
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/user/profile');
    return data;
  },

  updateProfile: async (profile: Partial<User>): Promise<User> => {
    if (!isBackendAvailable()) {
      return profile as User;
    }
    const { data } = await apiClient.put<User>('/user/profile', profile);
    return data;
  },

  updateLifestyle: async (lifestyle: Lifestyle): Promise<Lifestyle> => {
    if (!isBackendAvailable()) {
      return lifestyle;
    }
    const { data } = await apiClient.put<Lifestyle>('/user/lifestyle', lifestyle);
    return data;
  },

  getLifestyle: async (): Promise<Lifestyle> => {
    const { data } = await apiClient.get<Lifestyle>('/user/lifestyle');
    return data;
  },
};
