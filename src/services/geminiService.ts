import { GoogleGenerativeAI } from '@google/generative-ai';
import { MealAnalysis, Lifestyle, HealthData } from '@/types';

export class FoodNotDetectedError extends Error {
  constructor(message = '食事を検出できませんでした') {
    super(message);
    this.name = 'FoodNotDetectedError';
  }
}

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * クライアントサイドで Gemini API を使って食事画像を解析する
 */
export async function analyzeFoodImage(
  base64Image: string,
  mimeType: string = 'image/jpeg',
  lifestyle?: Lifestyle,
  healthData?: HealthData
): Promise<MealAnalysis> {
  if (!API_KEY) {
    throw new Error('APIキーが設定されていません。設定を確認してください。');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const contextPrompt = buildContextPrompt(lifestyle, healthData);

    const prompt = `あなたは栄養管理の専門家AIです。この写真を分析して、以下のJSON形式で回答してください。
日本語で回答してください。推定値で構いません。

まず写真に食事が写っているかを判定してください。
- 食事が写っている場合: "detected" を true にし、栄養情報を記入してください。
- 食事が写っていない場合（風景、文書、人物のみ、ぼやけて判別不能など）: "detected" を false にし、他のフィールドはデフォルト値のままにしてください。

{
  "detected": true または false,
  "name": "料理名",
  "cal": 推定カロリー(kcal, 整数),
  "p": たんぱく質(g, 小数1桁),
  "f": 脂質(g, 小数1桁),
  "c": 炭水化物(g, 小数1桁),
  "fiber": 食物繊維(g, 小数1桁),
  "salt": 塩分(g, 小数1桁),
  "score": 栄養バランススコア(0-100の整数),
  "ingredients": ["食材1", "食材2", ...],
  "missing": "不足している主な栄養素",
  "praise": "褒める一言（絵文字付き）",
  "advice": "具体的な改善アドバイス（2-3文）"
}
${contextPrompt}
JSONのみ返してください。マークダウンや説明文は不要です。`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ]);

    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\s?/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);

      if (parsed.detected === false) {
        throw new FoodNotDetectedError();
      }

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
    } catch (e) {
      if (e instanceof FoodNotDetectedError) throw e;
      throw new Error('AI応答の解析に失敗しました: ' + text);
    }
  } catch (error) {
    if (error instanceof FoodNotDetectedError) throw error;
    console.error('Gemini analysis failed:', error);
    throw error;
  }
}

function buildContextPrompt(lifestyle?: Lifestyle, healthData?: HealthData): string {
  const parts: string[] = [];

  if (lifestyle) {
    const { portionSize, exerciseLevel, walkMinutes } = lifestyle;
    if (portionSize) parts.push(`普段の食事量: ${portionSize}`);
    if (exerciseLevel) parts.push(`運動レベル: ${exerciseLevel}`);
    if (walkMinutes) parts.push(`1日の歩行時間: ${walkMinutes}分`);
  }

  if (healthData) {
    const { steps, heartRate } = healthData;
    if (steps) parts.push(`今日の歩数: ${steps}歩`);
    if (heartRate) parts.push(`心拍数: ${heartRate}bpm`);
  }

  if (parts.length > 0) {
    return `\n利用者の情報:\n${parts.join('\n')}\nこの情報を踏まえてパーソナライズしたアドバイスをしてください。\n`;
  }
  return '';
}

