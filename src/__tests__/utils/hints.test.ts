import { getDailyHint } from '@/utils/hints';
import { MealLog } from '@/types';

const makeMealLog = (overrides: Partial<MealLog> = {}): MealLog => ({
  name: 'テスト料理',
  cal: 500,
  p: 25,
  f: 15,
  c: 60,
  fiber: 5,
  salt: 2,
  score: 75,
  ingredients: ['食材'],
  missing: '',
  praise: '',
  advice: '',
  time: '12:00',
  date: new Date().toDateString(),
  ...overrides,
});

describe('getDailyHint', () => {
  it('returns a general hint when there are no logs', () => {
    const hint = getDailyHint([]);
    expect(typeof hint).toBe('string');
    expect(hint.length).toBeGreaterThan(0);
  });

  it('returns protein advice when protein is low', () => {
    const logs = [makeMealLog({ p: 5 })];
    const hint = getDailyHint(logs);
    expect(hint).toContain('たんぱく質');
  });

  it('returns fiber advice when fiber is low', () => {
    const logs = [makeMealLog({ p: 30, fiber: 1 })];
    const hint = getDailyHint(logs);
    expect(hint).toContain('食物繊維');
  });

  it('returns salt warning when salt is high', () => {
    const logs = [
      makeMealLog({ p: 30, fiber: 5, salt: 4 }),
      makeMealLog({ p: 30, fiber: 5, salt: 5 }),
    ];
    const hint = getDailyHint(logs);
    expect(hint).toContain('塩分');
  });

  it('returns praise when score is high', () => {
    const logs = [makeMealLog({ p: 30, fiber: 5, salt: 2, score: 90 })];
    const hint = getDailyHint(logs);
    expect(hint).toContain('良い');
  });

  it('returns consistent hints for the same day with no logs', () => {
    const hint1 = getDailyHint([]);
    const hint2 = getDailyHint([]);
    expect(hint1).toBe(hint2);
  });
});
