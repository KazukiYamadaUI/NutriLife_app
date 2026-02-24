import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { tokens } from '@/theme/tokens';
import { HomeIcon, ChartIcon, SettingsIcon } from './Icons';

interface BottomNavProps {
  current: string;
  onNav: (key: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ current, onNav }) => {
  const items = [
    { key: 'home', label: 'ホーム', Icon: HomeIcon },
    { key: 'record', label: 'きろく', Icon: ChartIcon },
    { key: 'settings', label: 'せってい', Icon: SettingsIcon },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 2,
        borderTopColor: tokens.border,
        backgroundColor: tokens.card,
        paddingBottom: Platform.OS === 'ios' ? 20 : 6,
        height: Platform.OS === 'ios' ? 85 : 65,
      }}
    >
      {items.map(({ key, label, Icon }) => {
        const active = current === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onNav(key)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            <Icon size={25} color={active ? tokens.green : tokens.textMuted} />
            <Text
              style={{
                fontSize: tokens.fontSub,
                fontWeight: '600',
                color: active ? tokens.green : tokens.textMuted,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
