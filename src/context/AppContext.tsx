import React, { createContext, useContext, useState, useCallback } from 'react';
import { MealLog, MealAnalysis, Lifestyle, HealthData } from '@/types';
import { mealsApi } from '@/api/meals';
import { healthApi } from '@/api/health';

interface AppState {
  logs: MealLog[];
  currentAnalysis: MealAnalysis | null;
  lifestyle: Lifestyle;
  healthData: HealthData;
  isAnalyzing: boolean;
}

interface AppContextType extends AppState {
  analyzeMeal: (imageUri: string) => Promise<MealAnalysis>;
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
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<MealAnalysis | null>(null);
  const [lifestyle, setLifestyleState] = useState<Lifestyle>({});
  const [healthData, setHealthDataState] = useState<HealthData>({ connected: false });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMeal = useCallback(
    async (imageUri: string) => {
      setIsAnalyzing(true);
      try {
        const result = await mealsApi.analyze(imageUri, lifestyle, healthData);
        setCurrentAnalysis(result);
        const now = new Date();
        const log: MealLog = {
          ...result,
          time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
          date: now.toDateString(),
        };
        setLogs((prev) => [log, ...prev]);
        return result;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [lifestyle, healthData]
  );

  const addLog = useCallback((log: MealLog) => {
    setLogs((prev) => [log, ...prev]);
  }, []);

  const setLifestyle = useCallback((ls: Lifestyle) => {
    setLifestyleState(ls);
  }, []);

  const setHealthData = useCallback((hd: HealthData) => {
    setHealthDataState(hd);
  }, []);

  const sendFeedback = useCallback((logId: string, type: 'good' | 'bad') => {
    // In production, this would call the API
    console.log('Feedback:', logId, type);
  }, []);

  const connectHealth = useCallback(async () => {
    const data = await healthApi.connect();
    setHealthDataState(data);
    return data;
  }, []);

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
