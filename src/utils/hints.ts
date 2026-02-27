import { MealLog } from '@/types';

const GENERAL_HINTS = [
  '朝食にたんぱく質を摂ると、1日のエネルギーが安定します。卵や納豆がおすすめです。',
  '1日に350g以上の野菜を食べることが推奨されています。毎食に野菜を取り入れましょう。',
  '食事はよく噛んで食べましょう。満腹感が得られやすくなり、消化も助けます。',
  '水分は1日に1.5〜2リットルを目安に摂りましょう。',
  '寝る3時間前までに夕食を済ませると、睡眠の質が向上します。',
  '食物繊維が豊富な食材（玄米、海藻、きのこ）は腸内環境を整えます。',
  'カルシウムは牛乳だけでなく、小松菜や豆腐からも摂取できます。',
  '鉄分不足を防ぐために、赤身肉やほうれん草を取り入れましょう。',
  '減塩を心がけましょう。出汁や香辛料を活用すると薄味でもおいしく感じます。',
  'カラフルな食事を意識すると、自然と栄養バランスが整います。',
  '間食にはナッツやフルーツを選ぶと、ビタミンとミネラルが補えます。',
  '発酵食品（味噌、ヨーグルト、キムチ）は腸活に効果的です。',
];

export function getDailyHint(todayLogs: MealLog[]): string {
  if (todayLogs.length === 0) {
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % GENERAL_HINTS.length;
    return GENERAL_HINTS[dayIndex];
  }

  const avgProtein = todayLogs.reduce((a, l) => a + l.p, 0) / todayLogs.length;
  const avgFiber = todayLogs.reduce((a, l) => a + l.fiber, 0) / todayLogs.length;
  const totalSalt = todayLogs.reduce((a, l) => a + l.salt, 0);
  const avgScore = todayLogs.reduce((a, l) => a + l.score, 0) / todayLogs.length;

  if (avgProtein < 15) {
    return 'たんぱく質が少なめです。次の食事では肉・魚・卵・豆類を意識してみましょう。';
  }
  if (avgFiber < 3) {
    return '食物繊維が不足気味です。サラダや根菜類、きのこを追加すると改善できます。';
  }
  if (totalSalt > 6) {
    return '塩分の摂りすぎに注意しましょう。味噌汁を具沢山にして汁を減らすのも効果的です。';
  }
  if (avgScore >= 80) {
    return '今日の食事バランスはとても良いです！この調子を続けていきましょう。';
  }

  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % GENERAL_HINTS.length;
  return GENERAL_HINTS[dayIndex];
}
