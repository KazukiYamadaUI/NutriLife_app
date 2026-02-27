import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import { env } from '../config/env';
import { MealAnalysisResult, AnalysisContext } from '../types';

class AiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
  }

  async analyzeMealImage(
    imagePath: string,
    context: AnalysisContext
  ): Promise<MealAnalysisResult> {
    if (!this.genAI) {
      console.warn('Gemini not configured, returning mock analysis');
      return this.mockAnalysis(context);
    }

    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

      const contextPrompt = this.buildContextPrompt(context);

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3-flash',
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        },
      });

      const systemPrompt = `あなたは栄養管理の専門家AIです。食事の写真を分析して、栄養情報とアドバイスを日本語で提供してください。

以下のJSON形式で回答してください（他のテキストは不要）:
{
  "name": "料理名",
  "cal": カロリー(整数),
  "protein": たんぱく質(g, 小数1桁),
  "fat": 脂質(g, 小数1桁),
  "carbs": 炭水化物(g, 小数1桁),
  "fiber": 食物繊維(g, 小数1桁),
  "salt": 塩分(g, 小数1桁),
  "score": 栄養バランススコア(0-100の整数),
  "ingredients": ["食材1", "食材2", ...],
  "missing": "不足している主な栄養素",
  "praise": "褒める一言（絵文字付き）",
  "advice": "具体的な改善アドバイス（2-3文）"
}

${contextPrompt}`;

      const result = await model.generateContent([
        systemPrompt,
        {
          inlineData: {
            data: base64Image,
            mimeType,
          },
        },
        'この食事の栄養を分析してください。',
      ]);

      const response = result.response;
      const content = response.text();
      if (!content) throw new Error('Empty response from Gemini');

      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse JSON from response');

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: parsed.name || '不明な料理',
        cal: Math.round(parsed.cal || 0),
        protein: Number((parsed.protein || 0).toFixed(1)),
        fat: Number((parsed.fat || 0).toFixed(1)),
        carbs: Number((parsed.carbs || 0).toFixed(1)),
        fiber: Number((parsed.fiber || 0).toFixed(1)),
        salt: Number((parsed.salt || 0).toFixed(1)),
        score: Math.min(100, Math.max(0, Math.round(parsed.score || 50))),
        ingredients: parsed.ingredients || [],
        missing: parsed.missing || '',
        praise: parsed.praise || '記録ありがとうございます！📝',
        advice: parsed.advice || '',
      };
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      return this.mockAnalysis(context);
    }
  }

  async analyzeBase64Image(
    base64Data: string,
    mimeType: string,
    context: AnalysisContext
  ): Promise<MealAnalysisResult> {
    if (!this.genAI) {
      console.warn('Gemini not configured, returning mock analysis');
      return this.mockAnalysis(context);
    }

    try {
      const contextPrompt = this.buildContextPrompt(context);

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3-flash',
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        },
      });

      const systemPrompt = `あなたは栄養管理の専門家AIです。この写真を分析して、以下のJSON形式で回答してください。
日本語で回答してください。推定値で構いません。

まず写真に食事が写っているかを判定してください。
- 食事が写っている場合: "detected" を true にし、栄養情報を記入してください。
- 食事が写っていない場合: "detected" を false にしてください。

{
  "detected": true または false,
  "name": "料理名",
  "cal": 推定カロリー(kcal, 整数),
  "protein": たんぱく質(g, 小数1桁),
  "fat": 脂質(g, 小数1桁),
  "carbs": 炭水化物(g, 小数1桁),
  "fiber": 食物繊維(g, 小数1桁),
  "salt": 塩分(g, 小数1桁),
  "score": 栄養バランススコア(0-100の整数),
  "ingredients": ["食材1", "食材2", ...],
  "missing": "不足している主な栄養素",
  "praise": "褒める一言（絵文字付き）",
  "advice": "具体的な改善アドバイス（2-3文）"
}
${contextPrompt}
JSONのみ返してください。`;

      const result = await model.generateContent([
        systemPrompt,
        {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        },
      ]);

      const content = result.response.text();
      if (!content) throw new Error('Empty response from Gemini');

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse JSON from response');

      const parsed = JSON.parse(jsonMatch[0]);

      if (parsed.detected === false) {
        throw new Error('FOOD_NOT_DETECTED');
      }

      return {
        name: parsed.name || '不明な料理',
        cal: Math.round(parsed.cal || 0),
        protein: Number((parsed.protein || 0).toFixed(1)),
        fat: Number((parsed.fat || 0).toFixed(1)),
        carbs: Number((parsed.carbs || 0).toFixed(1)),
        fiber: Number((parsed.fiber || 0).toFixed(1)),
        salt: Number((parsed.salt || 0).toFixed(1)),
        score: Math.min(100, Math.max(0, Math.round(parsed.score || 50))),
        ingredients: parsed.ingredients || [],
        missing: parsed.missing || '',
        praise: parsed.praise || '記録ありがとうございます！📝',
        advice: parsed.advice || '',
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'FOOD_NOT_DETECTED') throw error;
      console.error('Gemini base64 analysis failed:', error);
      return this.mockAnalysis(context);
    }
  }

  private buildContextPrompt(context: AnalysisContext): string {
    const parts: string[] = [];

    if (context.userProfile) {
      const { gender, birthYear, height, weight } = context.userProfile;
      if (birthYear) {
        const age = new Date().getFullYear() - parseInt(birthYear);
        parts.push(`利用者: ${age}歳`);
      }
      if (gender) parts.push(`性別: ${gender === 'male' ? '男性' : gender === 'female' ? '女性' : '不明'}`);
      if (height) parts.push(`身長: ${height}cm`);
      if (weight) parts.push(`体重: ${weight}kg`);
    }

    if (context.lifestyle) {
      const { portionSize, exerciseLevel, walkMinutes } = context.lifestyle;
      if (portionSize) parts.push(`普段の食事量: ${portionSize}`);
      if (exerciseLevel) parts.push(`運動レベル: ${exerciseLevel}`);
      if (walkMinutes) parts.push(`1日の歩行時間: ${walkMinutes}分`);
    }

    if (context.healthData) {
      const { steps, heartRate } = context.healthData;
      if (steps) parts.push(`今日の歩数: ${steps}歩`);
      if (heartRate) parts.push(`心拍数: ${heartRate}bpm`);
    }

    if (parts.length > 0) {
      return `\n利用者の情報:\n${parts.join('\n')}\nこの情報を踏まえてパーソナライズしたアドバイスをしてください。`;
    }
    return '';
  }

  private mockAnalysis(context: AnalysisContext): MealAnalysisResult {
    const foods: MealAnalysisResult[] = [
      {
        name: '鮭の塩焼き定食',
        cal: 520,
        protein: 32,
        fat: 15,
        carbs: 58,
        fiber: 4.2,
        salt: 2.8,
        score: 82,
        ingredients: ['鮭', 'ご飯', '味噌汁', '漬物'],
        missing: 'ビタミンC',
        praise: '素晴らしいお食事です！🎉',
        advice: '',
      },
      {
        name: 'カレーライス',
        cal: 680,
        protein: 18,
        fat: 22,
        carbs: 95,
        fiber: 3.1,
        salt: 3.5,
        score: 65,
        ingredients: ['ご飯', 'カレールー', 'じゃがいも', 'にんじん', '玉ねぎ', '豚肉'],
        missing: '食物繊維',
        praise: 'きちんと記録できました！👍',
        advice: '',
      },
      {
        name: 'サラダチキンと玄米',
        cal: 380,
        protein: 35,
        fat: 8,
        carbs: 42,
        fiber: 5.8,
        salt: 1.9,
        score: 91,
        ingredients: ['鶏むね肉', 'レタス', 'トマト', 'アボカド', '玄米'],
        missing: 'カルシウム',
        praise: 'パーフェクトに近いお食事！✨',
        advice: '',
      },
      {
        name: '天ぷらうどん',
        cal: 510,
        protein: 14,
        fat: 18,
        carbs: 72,
        fiber: 2.4,
        salt: 4.1,
        score: 55,
        ingredients: ['うどん', '海老天', 'かまぼこ', 'ねぎ'],
        missing: 'たんぱく質',
        praise: '記録ありがとうございます！📝',
        advice: '',
      },
      {
        name: '焼き魚と煮物定食',
        cal: 440,
        protein: 28,
        fat: 12,
        carbs: 50,
        fiber: 5.2,
        salt: 2.2,
        score: 88,
        ingredients: ['さば', '大根', 'にんじん', 'こんにゃく', 'ご飯'],
        missing: 'カルシウム',
        praise: '理想的な和食です！🌟',
        advice: '',
      },
    ];

    const base = { ...foods[Math.floor(Math.random() * foods.length)] };

    let advice = '';
    const ex = context.lifestyle?.exerciseLevel || 'light';
    if (ex === 'active') advice += '運動量が多いので、たんぱく質をしっかり摂れているのは良いですね。';
    else if (ex === 'sedentary') advice += 'あまり動かない日は、カロリーを少しひかえめにすると良いですよ。';
    else advice += '適度な活動量ですね。';

    const steps = context.healthData?.steps;
    if (steps && steps > 6000) advice += ` 今日は${steps.toLocaleString()}歩も歩かれていますね！`;
    else if (steps) advice += ` 今日の歩数は${steps.toLocaleString()}歩です。食後に軽いお散歩もおすすめですよ。`;
    if (base.fiber < 4) advice += ' 次のお食事ではお野菜を少し増やしてみましょう。';

    base.advice = advice;
    return base;
  }
}

export const aiService = new AiService();
