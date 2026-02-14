import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@/types';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { RecordScreen } from '@/screens/record/RecordScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { HomeIcon, ChartIcon, SettingsIcon } from '@/components/Icons';
import { tokens } from '@/theme/tokens';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 2,
          borderTopColor: tokens.border,
          backgroundColor: tokens.card,
          paddingBottom: Platform.OS === 'ios' ? 20 : 6,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarActiveTintColor: tokens.green,
        tabBarInactiveTintColor: tokens.textMuted,
        tabBarLabelStyle: {
          fontSize: tokens.fontSub,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen as any}
        options={{
          tabBarLabel: 'ホーム',
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Record"
        component={RecordScreen as any}
        options={{
          tabBarLabel: 'きろく',
          tabBarIcon: ({ color, size }) => <ChartIcon size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen as any}
        options={{
          tabBarLabel: 'せってい',
          tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
