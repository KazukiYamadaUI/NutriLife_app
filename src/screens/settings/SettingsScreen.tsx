import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { RootStackParamList } from '@/types';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import {
  UserIcon,
  ChartIcon,
  BellIcon,
  ActivityIcon,
  HeartIcon,
  DocIcon,
} from '@/components/Icons';
import { tokens } from '@/theme/tokens';
import { styles } from '@/theme/styles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const MenuItem: React.FC<{
  label: string;
  icon?: React.ReactNode;
  desc?: string;
  tag?: string;
  onPress: () => void;
  danger?: boolean;
}> = ({ label, icon, desc, tag, onPress, danger }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 20,
      backgroundColor: tokens.card,
      borderBottomWidth: 1,
      borderBottomColor: tokens.border,
      minHeight: tokens.touchMin + 8,
    }}
  >
    {icon}
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            fontSize: tokens.fontLarge,
            fontWeight: '600',
            color: danger ? tokens.danger : tokens.text,
          }}
        >
          {label}
        </Text>
        {tag && (
          <View
            style={{
              backgroundColor: tokens.blueLight,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: tokens.fontSmall, fontWeight: '700', color: tokens.blue }}>
              {tag}
            </Text>
          </View>
        )}
      </View>
      {desc && (
        <Text style={{ fontSize: tokens.fontSmall, color: tokens.textMuted, marginTop: 2 }}>
          {desc}
        </Text>
      )}
    </View>
    <Text style={{ color: tokens.textMuted, fontSize: tokens.fontTitle }}>›</Text>
  </TouchableOpacity>
);

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { healthData } = useApp();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <Header title="せってい" />
      <ScrollView style={{ flex: 1 }}>
        <Card
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            margin: 16,
            marginBottom: 8,
            padding: 20,
          }}
        >
          <View style={[styles.avatarCircle, { width: 64, height: 64 }]}>
            <UserIcon size={32} color={tokens.green} />
          </View>
          <View>
            <Text
              style={{
                fontWeight: '800',
                fontSize: tokens.fontTitle,
                color: tokens.text,
              }}
            >
              {user?.displayName || 'ユーザー'}
            </Text>
            {user?.phone && (
              <Text style={{ fontSize: tokens.fontSub, color: tokens.textMuted }}>
                {user.phone}
              </Text>
            )}
            {(user?.height || user?.weight) && (
              <Text
                style={{
                  fontSize: tokens.fontSmall,
                  color: tokens.textMuted,
                  marginTop: 2,
                }}
              >
                {user.height ? `${user.height}cm` : ''}　
                {user.weight ? `${user.weight}kg` : ''}
              </Text>
            )}
          </View>
        </Card>

        <Text style={styles.sectionLabel}>アカウント</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            label="プロフィール編集"
            icon={<UserIcon size={22} color={tokens.green} />}
            onPress={() => navigation.navigate('ProfileEdit')}
          />
          <MenuItem
            label="通知設定"
            icon={<BellIcon size={22} color={tokens.green} />}
            onPress={() => {}}
          />
        </View>

        <Text style={styles.sectionLabel}>AI解析をもっと正確に</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            label="食事量・運動量"
            icon={<ActivityIcon size={22} color={tokens.orange} />}
            desc="ふだんの生活スタイルを教えてください"
            onPress={() => navigation.navigate('Lifestyle')}
          />
          <MenuItem
            label="ヘルスケア連携"
            icon={<HeartIcon size={22} color={tokens.danger} />}
            desc={healthData?.connected ? '連携中 ✓' : 'iOSヘルスケアと接続'}
            tag={healthData?.connected ? 'ON' : ''}
            onPress={() => navigation.navigate('HealthKit')}
          />
        </View>

        <Text style={styles.sectionLabel}>そのほか</Text>
        <View style={[styles.menuGroup, { marginBottom: 24 }]}>
          <MenuItem
            label="利用規約"
            icon={<DocIcon size={22} color={tokens.textMuted} />}
            onPress={() => navigation.navigate('Terms')}
          />
          <MenuItem label="ログアウト" onPress={logout} danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
