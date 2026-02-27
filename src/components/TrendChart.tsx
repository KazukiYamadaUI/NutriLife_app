import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Line, Circle, Rect } from 'react-native-svg';
import { tokens } from '@/theme/tokens';

interface DataPoint {
  label: string;
  value: number;
}

interface TrendChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  title: string;
  unit: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  color = tokens.green,
  height = 160,
  title,
  unit,
}) => {
  if (data.length < 2) {
    return (
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Text style={{ color: tokens.textMuted, fontSize: tokens.fontSub }}>
          データが不足しています（2日以上必要）
        </Text>
      </View>
    );
  }

  const width = 300;
  const padding = { top: 10, bottom: 30, left: 10, right: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value), 0);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.value - minVal) / range) * chartH;
    return { x, y, ...d };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View>
      <Text
        style={{
          fontSize: tokens.fontBody,
          fontWeight: '700',
          color: tokens.text,
          marginBottom: 8,
        }}
      >
        {title}（{unit}）
      </Text>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Rect x={0} y={0} width={width} height={height} fill="transparent" />
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = padding.top + chartH * (1 - f);
          return (
            <Line
              key={f}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke={tokens.border}
              strokeWidth={0.5}
            />
          );
        })}
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />
        ))}
      </Svg>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: padding.left,
          marginTop: -20,
        }}
      >
        {data.length <= 7 ? (
          data.map((d, i) => (
            <Text
              key={i}
              style={{
                fontSize: 10,
                color: tokens.textMuted,
                textAlign: 'center',
              }}
            >
              {d.label}
            </Text>
          ))
        ) : (
          <>
            <Text style={{ fontSize: 10, color: tokens.textMuted }}>{data[0].label}</Text>
            <Text style={{ fontSize: 10, color: tokens.textMuted }}>
              {data[data.length - 1].label}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};
