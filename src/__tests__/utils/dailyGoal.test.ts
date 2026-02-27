import { calculateDailyGoals, DailyGoals } from '@/utils/dailyGoal';
import { User, Lifestyle } from '@/types';

describe('calculateDailyGoals', () => {
  it('returns default goals when no user data is provided', () => {
    const goals = calculateDailyGoals(null, undefined);
    expect(goals.calories).toBeGreaterThan(0);
    expect(goals.protein).toBeGreaterThan(0);
    expect(goals.fat).toBeGreaterThan(0);
    expect(goals.carbs).toBeGreaterThan(0);
    expect(goals.fiber).toBe(20);
    expect(goals.salt).toBe(7);
  });

  it('calculates higher calories for male users', () => {
    const maleUser: User = {
      displayName: 'テスト',
      gender: 'male',
      birthYear: '1990',
      height: '175',
      weight: '70',
    };
    const femaleUser: User = {
      displayName: 'テスト',
      gender: 'female',
      birthYear: '1990',
      height: '160',
      weight: '55',
    };

    const maleGoals = calculateDailyGoals(maleUser);
    const femaleGoals = calculateDailyGoals(femaleUser);

    expect(maleGoals.calories).toBeGreaterThan(femaleGoals.calories);
  });

  it('adjusts for activity level', () => {
    const user: User = {
      displayName: 'テスト',
      gender: 'male',
      birthYear: '1990',
      height: '175',
      weight: '70',
    };

    const sedentary = calculateDailyGoals(user, { exerciseLevel: 'sedentary' });
    const active = calculateDailyGoals(user, { exerciseLevel: 'active' });

    expect(active.calories).toBeGreaterThan(sedentary.calories);
  });

  it('returns correct macronutrient ratios', () => {
    const goals = calculateDailyGoals(null, undefined);

    const proteinCals = goals.protein * 4;
    const fatCals = goals.fat * 9;
    const carbsCals = goals.carbs * 4;
    const totalMacroCals = proteinCals + fatCals + carbsCals;

    expect(proteinCals / totalMacroCals).toBeCloseTo(0.15, 1);
    expect(fatCals / totalMacroCals).toBeCloseTo(0.25, 1);
    expect(carbsCals / totalMacroCals).toBeCloseTo(0.55, 0);
  });
});
