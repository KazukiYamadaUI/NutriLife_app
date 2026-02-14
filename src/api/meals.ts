import { apiClient, isBackendAvailable } from './client';
import { MealAnalysis, MealLog, Lifestyle, HealthData } from '@/types';

// Mock AI analysis for offline / development
const mockAnalyze = (ls: Lifestyle, hd: HealthData): Promise<MealAnalysis> =>
  new Promise((res) => {
    setTimeout(() => {
      const foods: MealAnalysis[] = [
        {
          name: '鮭の塩焼き定食',
          cal: 520,
          p: 32,
          f: 15,
          c: 58,
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
          p: 18,
          f: 22,
          c: 95,
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
          p: 35,
          f: 8,
          c: 42,
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
          p: 14,
          f: 18,
          c: 72,
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
          p: 28,
          f: 12,
          c: 50,
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
      const ex = ls?.exerciseLevel || 'light';
      if (ex === 'active' || ex === 'veryActive')
        advice += '運動量が多いので、たんぱく質をしっかり摂れているのは良いですね。';
      else if (ex === 'sedentary')
        advice += 'あまり動かない日は、カロリーを少しひかえめにすると良いですよ。';
      else advice += '適度な活動量ですね。';

      const steps = hd?.steps;
      if (steps && steps > 6000)
        advice += ` 今日は${steps.toLocaleString()}歩も歩かれていますね！`;
      else if (steps)
        advice += ` 今日の歩数は${steps.toLocaleString()}歩です。食後に軽いお散歩もおすすめですよ。`;
      if (base.fiber < 4)
        advice += ' 次のお食事ではお野菜を少し増やしてみましょう。';

      base.advice = advice;
      res(base);
    }, 3000);
  });

export const mealsApi = {
  analyze: async (
    imageUri: string,
    lifestyle: Lifestyle,
    healthData: HealthData
  ): Promise<MealAnalysis> => {
    if (!isBackendAvailable()) {
      return mockAnalyze(lifestyle, healthData);
    }

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'meal.jpg',
    } as any);
    formData.append('lifestyle', JSON.stringify(lifestyle));
    formData.append('healthData', JSON.stringify(healthData));

    const { data } = await apiClient.post<MealAnalysis>('/meals/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return data;
  },

  getLogs: async (params?: { date?: string; month?: string }): Promise<MealLog[]> => {
    if (!isBackendAvailable()) return [];
    const { data } = await apiClient.get<MealLog[]>('/meals', { params });
    return data;
  },

  getDetail: async (id: string): Promise<MealLog> => {
    const { data } = await apiClient.get<MealLog>(`/meals/${id}`);
    return data;
  },

  sendFeedback: async (id: string, type: 'good' | 'bad'): Promise<void> => {
    if (!isBackendAvailable()) return;
    await apiClient.post(`/meals/${id}/feedback`, { type });
  },
};
