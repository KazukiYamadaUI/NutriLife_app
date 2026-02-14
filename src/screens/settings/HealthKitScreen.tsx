import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '@/context/AppContext';
import { RootStackParamList } from '@/types';
import { Header } from '@/components/Header';
import { BigButton } from '@/components/BigButton';
import { Card } from '@/components/Card';
import { HeartIcon, LockIcon, LinkIcon } from '@/components/Icons';
import { tokens } from '@/theme/tokens';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'HealthKit'>;
};

const DataRow: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  unit: string;
}> = ({ icon, label, value, unit }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: tokens.border,
    }}
  >
    <Text style={{ fontSize: 26, width: 36, textAlign: 'center' }}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: tokens.fontSub, color: tokens.textMuted }}>{label}</Text>
      <Text
        style={{
          fontSize: tokens.fontTitle,
          fontWeight: '800',
          color: tokens.text,
          marginTop: 2,
        }}
      >
        {value}{' '}
        <Text style={{ fontSize: tokens.fontSub, fontWeight: '500' }}>{unit}</Text>
      </Text>
    </View>
  </View>
);

export const HealthKitScreen: React.FC<Props> = ({ navigation }) => {
  const { healthData, connectHealth, disconnectHealth } = useApp();
  const [syncing, setSyncing] = useState(false);
  const connected = healthData?.connected;

  const doConnect = async () => {
    setSyncing(true);
    try {
      await connectHealth();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <Header title="ヘルスケアとつなげる" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Card
          style={{
            backgroundColor: tokens.blueLight,
            borderColor: '#bfdbfe',
            marginBottom: 20,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <HeartIcon size={28} color={tokens.blue} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: tokens.fontBody,
                fontWeight: '700',
                color: tokens.blue,
                marginBottom: 6,
              }}
            >
              iOSヘルスケアと連携
            </Text>
            <Text
              style={{ fontSize: tokens.fontSub, color: tokens.textSub, lineHeight: 24 }}
            >
              歩数・体重・心拍数をAI解析に活用し、
              <Text style={{ fontWeight: '700' }}>より正確なカロリー計算</Text>
              をお届けします。
            </Text>
          </View>
        </Card>

        {connected && (
          <Card style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: tokens.fontLarge,
                fontWeight: '800',
                color: tokens.green,
                marginBottom: 8,
              }}
            >
              ✓ 連携中のデータ
            </Text>
            <Text
              style={{
                fontSize: tokens.fontSmall,
                color: tokens.textMuted,
                marginBottom: 8,
              }}
            >
              最終同期: {healthData.lastSynced}
            </Text>
            <DataRow
              icon="👟"
              label="今日の歩数"
              value={healthData.steps?.toLocaleString() || '0'}
              unit="歩"
            />
            <DataRow
              icon="❤️"
              label="心拍数"
              value={healthData.heartRate || '--'}
              unit="bpm"
            />
            <DataRow
              icon="⚖️"
              label="体重"
              value={healthData.weight || '--'}
              unit="kg"
            />
            <DataRow
              icon="💉"
              label="血圧"
              value={`${healthData.bloodPressureSys || '--'}/${healthData.bloodPressureDia || '--'}`}
              unit="mmHg"
            />
            <DataRow
              icon="😴"
              label="睡眠時間"
              value={healthData.sleepHours || '--'}
              unit="時間"
            />
          </Card>
        )}

        <Card style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <LockIcon size={24} color={tokens.green} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: tokens.fontBody,
                fontWeight: '700',
                marginBottom: 4,
              }}
            >
              データの安全性について
            </Text>
            <Text
              style={{ fontSize: tokens.fontSub, color: tokens.textSub, lineHeight: 24 }}
            >
              ヘルスケアデータは暗号化して安全に保管されます。
            </Text>
          </View>
        </Card>
      </ScrollView>
      <View
        style={{
          padding: 20,
          paddingBottom: 28,
          borderTopWidth: 2,
          borderTopColor: tokens.border,
          backgroundColor: tokens.card,
        }}
      >
        {!connected ? (
          <BigButton
            onPress={doConnect}
            disabled={syncing}
            icon={syncing ? undefined : <LinkIcon size={24} color="#fff" />}
            color={tokens.blue}
          >
            {syncing ? '接続中...' : 'ヘルスケアとつなげる'}
          </BigButton>
        ) : (
          <TouchableOpacity
            onPress={disconnectHealth}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: tokens.touchMin,
              borderRadius: tokens.radiusSm,
              borderWidth: 2,
              borderColor: tokens.danger,
            }}
          >
            <Text
              style={{
                fontSize: tokens.fontBody,
                fontWeight: '600',
                color: tokens.danger,
              }}
            >
              ヘルスケアとの接続をやめる
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};
