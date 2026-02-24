// ============ TYPE DEFINITIONS ============

export interface User {
  id?: string;
  phone?: string;
  displayName: string;
  gender?: 'male' | 'female' | 'other' | '';
  birthYear?: string;
  height?: string;
  weight?: string;
}

export interface MealAnalysis {
  name: string;
  cal: number;
  p: number;
  f: number;
  c: number;
  fiber: number;
  salt: number;
  score: number;
  ingredients: string[];
  missing: string;
  praise: string;
  advice: string;
}

export interface MealLog extends MealAnalysis {
  id?: string;
  time: string;
  date: string;
  imageUrl?: string;
  feedback?: 'good' | 'bad' | null;
}

export interface Lifestyle {
  portionSize?: string;
  exerciseLevel?: string;
  appetite?: string;
  mealFrequency?: string;
  walkMinutes?: string;
}

export interface HealthData {
  connected: boolean;
  steps?: number;
  heartRate?: number;
  weight?: number;
  bloodPressureSys?: number;
  bloodPressureDia?: number;
  sleepHours?: number;
  lastSynced?: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  ProfileSetup: undefined;
  Main: undefined;
  Camera: { mode: 'camera' | 'album' };
  Analyzing: undefined;
  Result: undefined;
  DetectionFailed: undefined;
  AnalysisFailed: undefined;
  MealDetail: { log: MealLog };
  ProfileEdit: undefined;
  Lifestyle: undefined;
  HealthKit: undefined;
  Terms: undefined;
  MealSettings: undefined;
  NotifSettings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Record: undefined;
  Settings: undefined;
};
