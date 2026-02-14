import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { tokens } from '@/theme/tokens';

interface ScoreRingProps {
  score: number;
  size?: number;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ score, size = 110 }) => {
  const sw = Math.max(size * 0.09, 4);
  const r = (size - sw * 2) / 2;
  const circ = Math.PI * 2 * r;
  const color = score >= 80 ? tokens.success : score >= 60 ? tokens.orange : tokens.danger;
  const fs = size <= 48 ? size * 0.4 : size <= 70 ? size * 0.36 : size * 0.32;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: '-90deg' }], position: 'absolute' }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth={sw}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeDasharray={`${circ}`}
          strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={{ fontSize: fs, fontWeight: '800', color, lineHeight: fs * 1.2 }}>
        {score}
      </Text>
    </View>
  );
};
