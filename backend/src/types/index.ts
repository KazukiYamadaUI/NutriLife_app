// ============ Shared Type Definitions ============

/** AI食事解析の結果 */
export interface MealAnalysisResult {
  name: string;
  cal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  salt: number;
  score: number;
  ingredients: string[];
  missing: string;
  praise: string;
  advice: string;
}

/** AI解析に渡すユーザーコンテキスト */
export interface AnalysisContext {
  lifestyle?: {
    portionSize?: string;
    exerciseLevel?: string;
    walkMinutes?: string;
  };
  healthData?: {
    steps?: number;
    heartRate?: number;
    weight?: number;
  };
  userProfile?: {
    gender?: string;
    birthYear?: string;
    height?: string;
    weight?: string;
  };
}
