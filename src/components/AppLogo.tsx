import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { tokens } from '@/theme/tokens';

interface AppLogoProps {
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 120 }) => {
  const borderRadius = size * 0.22;
  const iconSize = size * 0.5;
  const fontSize = size * 0.14;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: tokens.greenLight,
        borderWidth: 2,
        borderColor: tokens.green,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke={tokens.green}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Leaf / plant icon */}
        <Path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 8-8 12z" />
        <Path d="M12 10v6" />
        <Path d="M9 13l3-3 3 3" />
      </Svg>
      <Text
        style={{
          fontSize,
          fontWeight: '800',
          color: tokens.green,
          marginTop: 2,
          letterSpacing: 1,
        }}
      >
        NutriLife
      </Text>
    </View>
  );
};
