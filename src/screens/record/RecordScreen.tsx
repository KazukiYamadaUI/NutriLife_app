import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '@/context/AppContext';
import { RootStackParamList, MealLog } from '@/types';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { ScoreRing } from '@/components/ScoreRing';
import { NutrientBar } from '@/components/NutrientBar';
import { RadarChart } from '@/components/RadarChart';
import {
  ChevronLIcon,
  ChevronRIcon,
  CalendarIcon,
  ChartIcon,
} from '@/components/Icons';
import { tokens } from '@/theme/tokens';
import { styles } from '@/theme/styles';

const { width: SCREEN_W } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const RecordScreen: React.FC<Props> = ({ navigation }) => {
  const { logs } = useApp();
  const [tab, setTab] = useState(0);
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [graphPeriod, setGraphPeriod] = useState('day');

  const tabs = ['カレンダー', 'グラフ'];
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = today.toDateString();

  const logDates: Record<
    string,
    { count: number; totalCal: number; scores: number[]; logs: MealLog[]; avgScore?: number }
  > = {};
  logs.forEach((l) => {
    const k = l.date;
    if (!logDates[k])
      logDates[k] = { count: 0, totalCal: 0, scores: [], logs: [] };
    logDates[k].count++;
    logDates[k].totalCal += l.cal;
    logDates[k].scores.push(l.score);
    logDates[k].logs.push(l);
  });
  Object.values(logDates).forEach((v) => {
    v.avgScore = Math.round(
      v.scores.reduce((a, b) => a + b, 0) / v.scores.length
    );
  });

  const selDateStr = selectedDate ? selectedDate.toDateString() : todayStr;

  const monthDates: {
    date: Date;
    dateStr: string;
    logs: MealLog[];
    totalCal: number;
  }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    const ds = dt.toDateString();
    const dl = logDates[ds];
    monthDates.push({
      date: dt,
      dateStr: ds,
      logs: dl ? dl.logs : [],
      totalCal: dl ? dl.totalCal : 0,
    });
  }

  const getRadarData = (period: string) => {
    let filtered: MealLog[] = [];
    const now = new Date();
    if (period === 'day') {
      const ds = selectedDate ? selectedDate.toDateString() : todayStr;
      filtered = logs.filter((l) => l.date === ds);
    } else if (period === 'week') {
      const wa = new Date(now);
      wa.setDate(wa.getDate() - 7);
      filtered = logs.filter((l) => new Date(l.date) >= wa);
    } else if (period === 'month') {
      const ma = new Date(now);
      ma.setMonth(ma.getMonth() - 1);
      filtered = logs.filter((l) => new Date(l.date) >= ma);
    } else {
      const ya = new Date(now);
      ya.setFullYear(ya.getFullYear() - 1);
      filtered = logs.filter((l) => new Date(l.date) >= ya);
    }
    if (filtered.length === 0)
      return { data: [0, 0, 0, 0, 0], count: 0, avgScore: 0, totalCal: 0 };
    const avgP = filtered.reduce((a, l) => a + l.p, 0) / filtered.length;
    const avgF = filtered.reduce((a, l) => a + l.f, 0) / filtered.length;
    const avgC = filtered.reduce((a, l) => a + l.c, 0) / filtered.length;
    const avgFiber =
      filtered.reduce((a, l) => a + l.fiber, 0) / filtered.length;
    const avgSalt =
      filtered.reduce((a, l) => a + l.salt, 0) / filtered.length;
    const avgScore = Math.round(
      filtered.reduce((a, l) => a + l.score, 0) / filtered.length
    );
    const totalCal = Math.round(
      filtered.reduce((a, l) => a + l.cal, 0) /
        (period === 'day' ? 1 : filtered.length)
    );
    return {
      data: [
        Math.min(100, Math.round((avgP / 60) * 100)),
        Math.min(100, Math.round((avgF / 65) * 100)),
        Math.min(100, Math.round((avgC / 300) * 100)),
        Math.min(100, Math.round((avgFiber / 20) * 100)),
        Math.min(100, Math.round(((7 - avgSalt) / 7) * 100)),
      ],
      count: filtered.length,
      avgScore,
      totalCal,
    };
  };

  const radarLabels = ['たんぱく質', '脂質', '炭水化物', '食物繊維', '減塩'];
  const rd = getRadarData(graphPeriod);
  const periodLabels: Record<string, string> = {
    day: '1日',
    week: '1週間',
    month: '1か月',
    year: '1年',
  };
  const periodDesc: Record<string, string> = {
    day: '選択した日',
    week: '過去7日間',
    month: '過去1ヶ月',
    year: '過去1年間',
  };
  const cellW = (SCREEN_W - 32) / 7;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <Header title="記録" />
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 8,
          gap: 8,
          backgroundColor: tokens.card,
        }}
      >
        {tabs.map((t, i) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(i)}
            style={[
              styles.modeBtn,
              {
                backgroundColor: tab === i ? tokens.green : 'transparent',
                borderColor: tab === i ? tokens.green : tokens.border,
              },
            ]}
          >
            {i === 0 ? (
              <CalendarIcon size={20} color={tab === i ? '#fff' : tokens.textMuted} />
            ) : (
              <ChartIcon size={20} color={tab === i ? '#fff' : tokens.textMuted} />
            )}
            <Text
              style={{
                fontSize: tokens.fontSub,
                color: tab === i ? '#fff' : tokens.textSub,
                fontWeight: tab === i ? '700' : '500',
              }}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 0 ? (
        <View style={{ flex: 1 }}>
          {/* Fixed calendar area */}
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            {/* Month nav */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <TouchableOpacity
                onPress={() => setCalMonth(new Date(year, month - 1, 1))}
                style={{
                  minWidth: tokens.touchMin,
                  minHeight: tokens.touchMin,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLIcon size={28} color={tokens.green} />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: tokens.fontTitle,
                  fontWeight: '800',
                  color: tokens.text,
                }}
              >
                {year}年{month + 1}月
              </Text>
              <TouchableOpacity
                onPress={() => setCalMonth(new Date(year, month + 1, 1))}
                style={{
                  minWidth: tokens.touchMin,
                  minHeight: tokens.touchMin,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRIcon size={28} color={tokens.green} />
              </TouchableOpacity>
            </View>

            {/* Weekday headers */}
            <View style={{ flexDirection: 'row', marginBottom: 6 }}>
              {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
                <View key={d} style={{ width: cellW, alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: tokens.fontSub,
                      fontWeight: '700',
                      color:
                        i === 0 ? tokens.danger : i === 6 ? tokens.blue : tokens.textMuted,
                    }}
                  >
                    {d}
                  </Text>
                </View>
              ))}
            </View>

            {/* Days grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <View key={`e${i}`} style={{ width: cellW, height: 50 }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const d = new Date(year, month, day);
                const ds = d.toDateString();
                const isToday = ds === todayStr;
                const isSel = ds === selDateStr;
                const hasLog = logDates[ds];
                const sc = hasLog?.avgScore;
                const dotColor =
                  sc && sc >= 80
                    ? tokens.success
                    : sc && sc >= 60
                    ? tokens.orange
                    : sc
                    ? tokens.danger
                    : null;
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setSelectedDate(d)}
                    style={{
                      width: cellW,
                      height: 50,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSel
                        ? tokens.green
                        : isToday
                        ? tokens.greenLight
                        : 'transparent',
                      borderWidth: isToday && !isSel ? 2 : 0,
                      borderColor: tokens.green,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.fontBody,
                        fontWeight: isToday || isSel ? '800' : '500',
                        color: isSel
                          ? '#fff'
                          : isToday
                          ? tokens.green
                          : tokens.text,
                      }}
                    >
                      {day}
                    </Text>
                    {hasLog ? (
                      <View style={{ flexDirection: 'row', gap: 2 }}>
                        {Array.from({
                          length: Math.min(hasLog.count, 3),
                        }).map((_, j) => (
                          <View
                            key={j}
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: 3.5,
                              backgroundColor: isSel
                                ? 'rgba(255,255,255,0.8)'
                                : dotColor || tokens.textMuted,
                            }}
                          />
                        ))}
                      </View>
                    ) : (
                      <View style={{ height: 7 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: tokens.border }} />

          {/* Scrollable log list - only show selected date */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {(() => {
              const selEntry = monthDates.find((m) => m.dateStr === selDateStr);
              const selDate = selEntry?.date || (selectedDate || today);
              const selLogs = selEntry?.logs || [];
              const selTotalCal = selEntry?.totalCal || 0;
              const isSelToday = selDateStr === todayStr;

              return (
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 12,
                      paddingVertical: 6,
                      borderBottomWidth: 2,
                      borderBottomColor: tokens.green,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.fontBody,
                        fontWeight: '800',
                        color: tokens.green,
                      }}
                    >
                      {isSelToday
                        ? `${selDate.getMonth() + 1}月${selDate.getDate()}日（今日）`
                        : `${selDate.getMonth() + 1}月${selDate.getDate()}日`}
                    </Text>
                    {selLogs.length > 0 && (
                      <Text
                        style={{
                          fontSize: tokens.fontSub,
                          color: tokens.green,
                          fontWeight: '700',
                        }}
                      >
                        合計 {selTotalCal} kcal
                      </Text>
                    )}
                  </View>
                  {selLogs.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                      <Text style={{ fontSize: 40, marginBottom: 12 }}>📝</Text>
                      <Text
                        style={{
                          fontSize: tokens.fontBody,
                          fontWeight: '700',
                          color: tokens.textSub,
                          marginBottom: 4,
                        }}
                      >
                        記録なし
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.fontSub,
                          color: tokens.textMuted,
                        }}
                      >
                        この日の食事記録はありません
                      </Text>
                    </View>
                  ) : (
                    selLogs.map((l, i) => (
                      <Card
                        key={i}
                        onPress={() =>
                          navigation.navigate('MealDetail', { log: l })
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 14,
                          marginBottom: 8,
                          padding: 14,
                        }}
                      >
                        <ScoreRing score={l.score} size={48} />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontWeight: '700',
                              fontSize: tokens.fontBody,
                              color: tokens.text,
                            }}
                          >
                            {l.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: tokens.fontSmall,
                              color: tokens.textMuted,
                            }}
                          >
                            {l.time}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: tokens.fontLarge,
                            fontWeight: '800',
                            color: tokens.green,
                          }}
                        >
                          {l.cal}
                        </Text>
                        <ChevronRIcon size={22} color={tokens.textMuted} />
                      </Card>
                    ))
                  )}
                </View>
              );
            })()}
          </ScrollView>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Period selector */}
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
            {['day', 'week', 'month', 'year'].map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setGraphPeriod(p)}
                style={[
                  styles.periodBtn,
                  graphPeriod === p && {
                    backgroundColor: tokens.green,
                    borderColor: tokens.green,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: tokens.fontBody,
                    color: graphPeriod === p ? '#fff' : tokens.textSub,
                    fontWeight: graphPeriod === p ? '700' : '500',
                  }}
                >
                  {periodLabels[p]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text
            style={{
              fontSize: tokens.fontSub,
              color: tokens.textMuted,
              textAlign: 'center',
              fontWeight: '600',
              marginBottom: 8,
            }}
          >
            {periodDesc[graphPeriod]}の栄養バランス
          </Text>

          {rd.count === 0 ? (
            <Card
              style={{
                alignItems: 'center',
                padding: 40,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📊</Text>
              <Text
                style={{
                  fontSize: tokens.fontBody,
                  fontWeight: '700',
                  color: tokens.textSub,
                  marginBottom: 6,
                }}
              >
                データがありません
              </Text>
              <Text style={{ fontSize: tokens.fontSub, color: tokens.textMuted }}>
                食事を記録するとグラフが表示されます
              </Text>
            </Card>
          ) : (
            <>
              <Card
                style={{
                  alignItems: 'center',
                  marginBottom: 14,
                  padding: 16,
                }}
              >
                <RadarChart data={rd.data} labels={radarLabels} size={260} />
              </Card>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                {[
                  {
                    val: rd.avgScore,
                    label:
                      graphPeriod === 'day' ? 'スコア' : '平均スコア',
                    color: tokens.green,
                  },
                  {
                    val: rd.totalCal,
                    label: graphPeriod === 'day' ? 'kcal' : '平均kcal',
                    color: tokens.orange,
                  },
                  { val: rd.count, label: '食', color: tokens.blue },
                ].map(({ val, label, color }) => (
                  <Card
                    key={label}
                    style={{ flex: 1, alignItems: 'center', padding: 14 }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.fontHero,
                        fontWeight: '800',
                        color,
                      }}
                    >
                      {val}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.fontSub,
                        color: tokens.textMuted,
                        fontWeight: '600',
                        marginTop: 2,
                      }}
                    >
                      {label}
                    </Text>
                  </Card>
                ))}
              </View>
              <Card style={{ marginBottom: 14 }}>
                <Text
                  style={{
                    fontSize: tokens.fontLarge,
                    fontWeight: '800',
                    color: tokens.green,
                    marginBottom: 14,
                  }}
                >
                  栄養バランスの詳細
                </Text>
                {radarLabels.map((l, i) => {
                  const v = rd.data[i];
                  const color = [
                    tokens.success,
                    tokens.orange,
                    '#3b82f6',
                    '#7c3aed',
                    tokens.danger,
                  ][i];
                  const status: 'good' | 'low' | '' =
                    v >= 70 ? 'good' : v >= 40 ? 'low' : '';
                  return (
                    <NutrientBar
                      key={l}
                      label={l}
                      value={v}
                      max={100}
                      unit="%"
                      color={color}
                      status={status}
                    />
                  );
                })}
              </Card>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
