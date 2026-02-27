import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { AppLogo } from '@/components/AppLogo';
import { LockIcon } from '@/components/Icons';
import { tokens } from '@/theme/tokens';

export const AnalyzingScreen: React.FC = () => {
  const { lifestyle, healthData } = useApp();

  const msgs = ['画像を送信中…', '食材を確認中…', '栄養を計算中…'];
  if (lifestyle?.portionSize) msgs.push('食事量をもとに調整中…');
  if (healthData?.connected) msgs.push('ヘルスケアデータを参照中…');
  msgs.push('アドバイスを準備中…');

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % msgs.length), 1800);
    return () => clearInterval(t);
  }, []);

  const pct = ((idx + 1) / msgs.length) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          gap: 24,
        }}
      >
        <AppLogo size={80} />
        <Text
          style={{
            fontSize: tokens.fontTitle,
            fontWeight: '700',
            color: tokens.text,
            textAlign: 'center',
          }}
        >
          {msgs[idx]}
        </Text>
        <View
          style={{
            width: '80%',
            maxWidth: 300,
            height: 10,
            backgroundColor: '#e0e0e0',
            borderRadius: 5,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: tokens.green,
              borderRadius: 5,
            }}
          />
        </View>
        <Text style={{ fontSize: tokens.fontSub, color: tokens.textMuted }}>
          しばらくお待ちください
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <LockIcon size={16} color={tokens.textMuted} />
          <Text style={{ fontSize: tokens.fontSmall, color: tokens.textMuted }}>
            画像は安全に処理されています
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
