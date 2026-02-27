import { MealAnalysis, Lifestyle, HealthData } from '@/types';
import { supabase } from '@/lib/supabase';

export class FoodNotDetectedError extends Error {
  constructor(message = '食事を検出できませんでした') {
    super(message);
    this.name = 'FoodNotDetectedError';
  }
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * バックエンド経由で Gemini API を使って食事画像を解析する
 * API キーはサーバー側のみに保持される
 */
export async function analyzeFoodImage(
  base64Image: string,
  mimeType: string = 'image/jpeg',
  lifestyle?: Lifestyle,
  healthData?: HealthData
): Promise<MealAnalysis> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    throw new Error('認証が必要です。ログインしてください。');
  }

  const response = await fetch(`${API_URL}/api/meals/analyze-base64`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      base64: base64Image,
      mimeType,
      lifestyle: lifestyle || {},
      healthData: healthData
        ? {
            steps: healthData.steps,
            heartRate: healthData.heartRate,
            weight: healthData.weight,
          }
        : {},
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    if (err.error === 'FOOD_NOT_DETECTED') {
      throw new FoodNotDetectedError();
    }
    throw new Error(err.error || '食事の解析に失敗しました');
  }

  const parsed = await response.json();

  return {
    name: parsed.name || '不明な料理',
    cal: Math.round(parsed.cal || 0),
    p: Number(Number(parsed.p || 0).toFixed(1)),
    f: Number(Number(parsed.f || 0).toFixed(1)),
    c: Number(Number(parsed.c || 0).toFixed(1)),
    fiber: Number(Number(parsed.fiber || 0).toFixed(1)),
    salt: Number(Number(parsed.salt || 0).toFixed(1)),
    score: Math.min(100, Math.max(0, Math.round(parsed.score || 50))),
    ingredients: parsed.ingredients || [],
    missing: parsed.missing || '',
    praise: parsed.praise || '記録ありがとうございます！📝',
    advice: parsed.advice || '',
  };
}
