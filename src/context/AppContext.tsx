import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MealLog, MealAnalysis, Lifestyle, HealthData } from '@/types';
import { analyzeFoodImage, FoodNotDetectedError } from '@/services/geminiService';
import { useAuth } from '@/context/AuthContext';
import {
  getMealLogs,
  insertMealLog,
  updateMealLogFeedback,
  getLifestyle,
  upsertLifestyle,
  getLatestHealthData,
  insertHealthData,
} from '@/api/supabaseApi';

interface AppState {
  logs: MealLog[];
  currentAnalysis: MealAnalysis | null;
  lifestyle: Lifestyle;
  healthData: HealthData;
  isAnalyzing: boolean;
}

interface AppContextType extends AppState {
  analyzeMeal: (base64Image: string, mimeType?: string) => Promise<MealAnalysis>;
  addLog: (log: MealLog) => void;
  setLifestyle: (ls: Lifestyle) => void;
  setHealthData: (hd: HealthData) => void;
  setCurrentAnalysis: (a: MealAnalysis | null) => void;
  setIsAnalyzing: (v: boolean) => void;
  sendFeedback: (logId: string, type: 'good' | 'bad') => void;
  connectHealth: () => Promise<HealthData>;
  disconnectHealth: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const userId = session?.user.id;

  const [logs, setLogs] = useState<MealLog[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<MealAnalysis | null>(null);
  const [lifestyle, setLifestyleState] = useState<Lifestyle>({});
  const [healthData, setHealthDataState] = useState<HealthData>({ connected: false });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLogs([]);
      setCurrentAnalysis(null);
      setLifestyleState({});
      setHealthDataState({ connected: false });
      return;
    }

    const load = async () => {
      try {
        const [fetchedLogs, fetchedLifestyle, fetchedHealth] = await Promise.all([
          getMealLogs(userId),
          getLifestyle(userId),
          getLatestHealthData(userId),
        ]);
        setLogs(fetchedLogs);
        setLifestyleState(fetchedLifestyle);
        setHealthDataState(fetchedHealth);
      } catch (e) {
        console.error('Failed to load user data:', e);
      }
    };
    load();
  }, [userId]);

  const analyzeMeal = useCallback(
    async (base64Image: string, mimeType: string = 'image/jpeg') => {
      setIsAnalyzing(true);
      try {
        const result = await analyzeFoodImage(base64Image, mimeType, lifestyle, healthData);
        setCurrentAnalysis(result);

        const now = new Date();
        const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        const date = now.toDateString();

        if (userId) {
          const saved = await insertMealLog(userId, result, date, time);
          setLogs((prev) => [saved, ...prev]);
        } else {
          const localLog: MealLog = { ...result, time, date };
          setLogs((prev) => [localLog, ...prev]);
        }

        return result;
      } catch (error) {
        if (error instanceof FoodNotDetectedError) throw error;
        throw error;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [lifestyle, healthData, userId]
  );

  const addLog = useCallback((log: MealLog) => {
    setLogs((prev) => [log, ...prev]);
  }, []);

  const setLifestyle = useCallback(
    async (ls: Lifestyle) => {
      setLifestyleState(ls);
      if (userId) {
        try {
          await upsertLifestyle(userId, ls);
        } catch (e) {
          console.error('Failed to save lifestyle:', e);
        }
      }
    },
    [userId]
  );

  const setHealthData = useCallback((hd: HealthData) => {
    setHealthDataState(hd);
  }, []);

  const sendFeedback = useCallback(
    async (logId: string, type: 'good' | 'bad') => {
      if (!userId) return;
      try {
        await updateMealLogFeedback(userId, logId, type);
        setLogs((prev) =>
          prev.map((l) => (l.id === logId ? { ...l, feedback: type } : l))
        );
      } catch (e) {
        console.error('Failed to send feedback:', e);
      }
    },
    [userId]
  );

  const connectHealth = useCallback(async () => {
    if (!userId) {
      const mockData: HealthData = {
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
      setHealthDataState(mockData);
      return mockData;
    }

    const data = await insertHealthData(userId, {
      steps: 4280,
      heartRate: 72,
      weight: 62.5,
      bloodPressureSys: 128,
      bloodPressureDia: 78,
      sleepHours: 6.5,
    });
    setHealthDataState(data);
    return data;
  }, [userId]);

  const disconnectHealth = useCallback(() => {
    setHealthDataState({ connected: false });
  }, []);

  return (
    <AppContext.Provider
      value={{
        logs,
        currentAnalysis,
        lifestyle,
        healthData,
        isAnalyzing,
        analyzeMeal,
        addLog,
        setLifestyle,
        setHealthData,
        setCurrentAnalysis,
        setIsAnalyzing,
        sendFeedback,
        connectHealth,
        disconnectHealth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
