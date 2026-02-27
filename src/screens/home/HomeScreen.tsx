import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { RootStackParamList } from '@/types';
import { Card } from '@/components/Card';
import { BigButton } from '@/components/BigButton';
import { AppLogo } from '@/components/AppLogo';
import { CardSkeleton } from '@/components/Skeleton';
import { CameraIcon, ImageIcon, HeartIcon } from '@/components/Icons';
import { tokens } from '@/theme/tokens';
import { getDailyHint } from '@/utils/hints';
import { calculateDailyGoals } from '@/utils/dailyGoal';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const ProgressBar: React.FC<{
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}> = ({ label, current, goal, unit, color }) => {
  const pct = Math.min(100, Math.round((current / goal) * 100));
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: tokens.fontSub, fontWeight: '600', color: tokens.textSub }}>
          {label}
        </Text>
        <Text style={{ fontSize: tokens.fontSub, fontWeight: '700', color }}>
          {current} / {goal} {unit}
        </Text>
      </View>
      <View
        style={{
          height: 8,
          backgroundColor: tokens.border,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { logs, healthData, isLoading, refreshData, lifestyle } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const dn = ['日', '月', '火', '水', '木', '金', '土'];
  const h = today.getHours();
  const gr = h < 11 ? 'おはようございます' : h < 17 ? 'こんにちは' : 'こんばんは';
  const tl = logs.filter((l) => l.date === today.toDateString());
  const totalCal = tl.reduce((a, l) => a + l.cal, 0);
  const totalP = tl.reduce((a, l) => a + l.p, 0);
  const totalF = tl.reduce((a, l) => a + l.f, 0);
  const totalC = tl.reduce((a, l) => a + l.c, 0);

  const goals = useMemo(() => calculateDailyGoals(user, lifestyle), [user, lifestyle]);
  const hint = useMemo(() => getDailyHint(tl), [tl]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tokens.green}
            colors={[tokens.green]}
          />
        }
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: tokens.textMuted,
                fontSize: tokens.fontSub,
                fontWeight: '500',
              }}
            >
              {today.getFullYear()}年{today.getMonth() + 1}月{today.getDate()}日（
              {dn[today.getDay()]}）
            </Text>
            <Text
              style={{
                fontSize: tokens.fontTitle + 2,
                fontWeight: '800',
                color: tokens.text,
              }}
            >
              {gr}、{user?.displayName || 'ユーザー'}さん
            </Text>
          </View>
          <AppLogo size={48} />
        </View>

        {healthData?.connected && (
          <Card
            style={{
              backgroundColor: tokens.blueLight,
              borderColor: '#bfdbfe',
              marginBottom: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 14,
            }}
          >
            <HeartIcon size={24} color={tokens.blue} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: tokens.fontSub, fontWeight: '700', color: tokens.blue }}>
                ヘルスケア連携中
              </Text>
              <Text style={{ fontSize: tokens.fontSmall, color: tokens.textSub, marginTop: 2 }}>
                今日 {healthData.steps?.toLocaleString() || 0}歩 ・ 心拍{' '}
                {healthData.heartRate || '--'}bpm
              </Text>
            </View>
          </Card>
        )}

        {isLoading ? (
          <>
            <CardSkeleton style={{ marginBottom: 16 }} />
            <CardSkeleton />
          </>
        ) : (
          <>
            <Card style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: tokens.fontLarge,
                  fontWeight: '800',
                  color: tokens.green,
                  marginBottom: 16,
                }}
              >
                📊 今日のまとめ
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  marginBottom: 8,
                }}
              >
                {[
                  { label: 'カロリー', val: totalCal, unit: 'kcal', color: tokens.green },
                  { label: 'たんぱく質', val: totalP, unit: 'g', color: tokens.orange },
                  { label: '記録した数', val: tl.length, unit: '食', color: tokens.greenMid },
                ].map(({ label, val, unit, color }) => (
                  <View key={label} style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: tokens.fontHero, fontWeight: '800', color }}>
                      {Math.round(val)}
                    </Text>
                    <Text style={{ fontSize: tokens.fontSub, color: tokens.textMuted }}>{unit}</Text>
                    <Text
                      style={{
                        fontSize: tokens.fontSub,
                        color: tokens.textSub,
                        marginTop: 2,
                        fontWeight: '600',
                      }}
                    >
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
              {tl.length === 0 && (
                <Text
                  style={{
                    fontSize: tokens.fontBody,
                    color: tokens.textMuted,
                    textAlign: 'center',
                    marginTop: 12,
                    lineHeight: 28,
                  }}
                >
                  まだ記録がありません。{'\n'}下のボタンから食事を撮影しましょう！
                </Text>
              )}
            </Card>

            {tl.length > 0 && (
              <Card style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: tokens.fontLarge,
                    fontWeight: '800',
                    color: tokens.green,
                    marginBottom: 14,
                  }}
                >
                  🎯 今日の目標
                </Text>
                <ProgressBar
                  label="カロリー"
                  current={Math.round(totalCal)}
                  goal={goals.calories}
                  unit="kcal"
                  color={tokens.green}
                />
                <ProgressBar
                  label="たんぱく質"
                  current={Math.round(totalP)}
                  goal={goals.protein}
                  unit="g"
                  color={tokens.orange}
                />
                <ProgressBar
                  label="脂質"
                  current={Math.round(totalF)}
                  goal={goals.fat}
                  unit="g"
                  color="#3b82f6"
                />
                <ProgressBar
                  label="炭水化物"
                  current={Math.round(totalC)}
                  goal={goals.carbs}
                  unit="g"
                  color="#7c3aed"
                />
              </Card>
            )}

            <Card style={{ backgroundColor: tokens.orangeLight, borderColor: '#f5d9b3' }}>
              <Text
                style={{
                  fontSize: tokens.fontBody,
                  fontWeight: '700',
                  color: tokens.orange,
                  marginBottom: 6,
                }}
              >
                💡 今日のヒント
              </Text>
              <Text style={{ fontSize: tokens.fontBody, color: tokens.text, lineHeight: 28 }}>
                {hint}
              </Text>
            </Card>
          </>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: 16, gap: 10 }}>
        <BigButton
          onPress={() => navigation.navigate('Camera', { mode: 'camera' })}
          color={tokens.orangeBg}
          icon={<CameraIcon size={32} color="#fff" />}
          style={{ minHeight: 76, borderRadius: tokens.radius }}
        >
          食事を撮影する
        </BigButton>
        <BigButton
          onPress={() => navigation.navigate('Camera', { mode: 'album' })}
          color={tokens.card}
          textColor={tokens.green}
          icon={<ImageIcon size={26} color={tokens.green} />}
          style={{ minHeight: 56, borderWidth: 2, borderColor: tokens.green }}
        >
          写真アルバムから選ぶ
        </BigButton>
      </View>
    </SafeAreaView>
  );
};
