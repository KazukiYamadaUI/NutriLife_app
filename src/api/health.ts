import { apiClient, isBackendAvailable } from './client';
import { HealthData } from '@/types';

// Mock health data for development
const mockHealthData: HealthData = {
  connected: true,
  steps: 4280,
  heartRate: 72,
  weight: 62.5,
  bloodPressureSys: 128,
  bloodPressureDia: 78,
  sleepHours: 6.5,
  lastSynced: new Date().toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  }),
};

export const healthApi = {
  connect: async (): Promise<HealthData> => {
    if (!isBackendAvailable()) {
      // Simulate connection delay
      await new Promise((r) => setTimeout(r, 2000));
      return mockHealthData;
    }
    const { data } = await apiClient.post<HealthData>('/health/sync');
    return data;
  },

  getSummary: async (): Promise<HealthData> => {
    if (!isBackendAvailable()) {
      return mockHealthData;
    }
    const { data } = await apiClient.get<HealthData>('/health/summary');
    return data;
  },

  disconnect: async (): Promise<void> => {
    if (!isBackendAvailable()) return;
    await apiClient.delete('/health/disconnect');
  },
};
