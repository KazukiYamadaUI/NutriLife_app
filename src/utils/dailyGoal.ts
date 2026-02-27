import { User, Lifestyle } from '@/types';

export interface DailyGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  salt: number;
}

export function calculateDailyGoals(
  user?: User | null,
  lifestyle?: Lifestyle
): DailyGoals {
  let bmr = 1800;

  if (user?.weight && user?.height && user?.birthYear && user?.gender) {
    const weight = parseFloat(user.weight);
    const height = parseFloat(user.height);
    const age = new Date().getFullYear() - parseInt(user.birthYear);

    if (user.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  let activityFactor = 1.55;
  if (lifestyle?.exerciseLevel === 'sedentary') activityFactor = 1.2;
  else if (lifestyle?.exerciseLevel === 'light') activityFactor = 1.375;
  else if (lifestyle?.exerciseLevel === 'moderate') activityFactor = 1.55;
  else if (lifestyle?.exerciseLevel === 'active') activityFactor = 1.725;

  const calories = Math.round(bmr * activityFactor);

  return {
    calories,
    protein: Math.round(calories * 0.15 / 4),
    fat: Math.round(calories * 0.25 / 9),
    carbs: Math.round(calories * 0.55 / 4),
    fiber: 20,
    salt: 7,
  };
}
