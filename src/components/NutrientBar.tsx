import React from 'react';
import { View, Text } from 'react-native';
import { tokens } from '@/theme/tokens';

interface NutrientBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color: string;
  status?: 'good' | 'low' | '';
}

export const NutrientBar: React.FC<NutrientBarProps> = ({
  label,
  value,
  max,
  unit = 'g',
  color,
  status,
}) => {
  const pct = Math.min((value / max) * 100, 100);
  const sc = status === 'good' ? tokens.success : status === 'low' ? tokens.orange : tokens.textMuted;
  const st = status === 'good' ? '✓ 足りています' : status === 'low' ? '△ 少し不足' : '';

  return (
    <View style={{ marginBottom: 14 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 5,
        }}
      >
        <Text style={{ fontSize: tokens.fontBody, fontWeight: '700', color: tokens.text }}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ fontSize: tokens.fontLarge, fontWeight: '800', color }}>
            {value}
            {unit}
          </Text>
          {st ? (
            <Text style={{ fontSize: tokens.fontSmall, fontWeight: '600', color: sc }}>{st}</Text>
          ) : null}
        </View>
      </View>
      <View
        style={{
          height: 12,
          backgroundColor: '#e8e8e8',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 6,
          }}
        />
      </View>
    </View>
  );
};
