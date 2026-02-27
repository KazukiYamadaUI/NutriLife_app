import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

export interface ThemeTokens {
  green: string;
  greenLight: string;
  greenMid: string;
  orange: string;
  orangeLight: string;
  orangeBg: string;
  text: string;
  textSub: string;
  textMuted: string;
  bg: string;
  card: string;
  border: string;
  danger: string;
  dangerLight: string;
  success: string;
  successLight: string;
  blue: string;
  blueLight: string;
  radius: number;
  radiusSm: number;
  fontHero: number;
  fontTitle: number;
  fontLarge: number;
  fontBody: number;
  fontSub: number;
  fontSmall: number;
  touchMin: number;
  isDark: boolean;
}

const lightTokens: ThemeTokens = {
  green: '#1a5c3a',
  greenLight: '#e8f5ec',
  greenMid: '#2d8a5e',
  orange: '#d4710a',
  orangeLight: '#fff4e6',
  orangeBg: '#f97316',
  text: '#1a1a1a',
  textSub: '#4a4a4a',
  textMuted: '#6b6b6b',
  bg: '#f7f7f5',
  card: '#ffffff',
  border: '#d4d4d4',
  danger: '#c0392b',
  dangerLight: '#fde8e8',
  success: '#1a7a42',
  successLight: '#e8f8ee',
  blue: '#1d4ed8',
  blueLight: '#eff6ff',
  radius: 16,
  radiusSm: 12,
  fontHero: 32,
  fontTitle: 24,
  fontLarge: 20,
  fontBody: 18,
  fontSub: 16,
  fontSmall: 14,
  touchMin: 52,
  isDark: false,
};

const darkTokens: ThemeTokens = {
  ...lightTokens,
  green: '#34d399',
  greenLight: '#1a2e25',
  greenMid: '#4ade80',
  orange: '#fb923c',
  orangeLight: '#2a2118',
  orangeBg: '#f97316',
  text: '#f5f5f5',
  textSub: '#c0c0c0',
  textMuted: '#888888',
  bg: '#111111',
  card: '#1e1e1e',
  border: '#333333',
  danger: '#ef4444',
  dangerLight: '#2a1616',
  success: '#22c55e',
  successLight: '#162a1e',
  blue: '#60a5fa',
  blueLight: '#172035',
  isDark: true,
};

interface ThemeContextType {
  theme: ThemeTokens;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTokens,
  isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const value = useMemo(
    () => ({
      theme: isDark ? darkTokens : lightTokens,
      isDark,
    }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
