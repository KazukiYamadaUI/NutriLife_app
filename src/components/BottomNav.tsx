import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { tokens } from '@/theme/tokens';
import { HomeIcon, ChartIcon, SettingsIcon } from './Icons';
import { styles } from '@/theme/styles';

interface BottomNavProps {
  current: string;
  onNav: (key: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ current, onNav }) => {
  const items = [
    { key: 'home', label: 'ホーム', Icon: HomeIcon },
    { key: 'record', label: '記録', Icon: ChartIcon },
    { key: 'settings', label: '設定', Icon: SettingsIcon },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map(({ key, label, Icon }) => {
        const a = current === key;
        return (
          <TouchableOpacity key={key} onPress={() => onNav(key)} style={styles.bottomNavItem}>
            <Icon size={26} color={a ? tokens.green : tokens.textMuted} />
            <Text
              style={[
                styles.bottomNavLabel,
                { color: a ? tokens.green : tokens.textMuted, fontWeight: a ? '700' : '500' },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
