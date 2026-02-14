import React from 'react';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { tokens } from '@/theme/tokens';

interface RadarChartProps {
  data: number[];
  labels: string[];
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, labels, size = 260 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 36;
  const n = labels.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, v: number) => ({
    x: cx + r * (v / 100) * Math.cos(angle(i)),
    y: cy + r * (v / 100) * Math.sin(angle(i)),
  });
  const gridLevels = [25, 50, 75, 100];

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map((lv) => (
        <Polygon
          key={lv}
          points={Array.from({ length: n })
            .map((_, i) => {
              const p = pt(i, lv);
              return `${p.x},${p.y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth={lv === 100 ? 1.5 : 0.8}
        />
      ))}
      {Array.from({ length: n }).map((_, i) => {
        const p = pt(i, 100);
        return (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#e0e0e0"
            strokeWidth={0.8}
          />
        );
      })}
      <Polygon
        points={data
          .map((v, i) => {
            const p = pt(i, v);
            return `${p.x},${p.y}`;
          })
          .join(' ')}
        fill="rgba(26,92,58,0.18)"
        stroke={tokens.green}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {data.map((v, i) => {
        const p = pt(i, v);
        return <Circle key={i} cx={p.x} cy={p.y} r={4} fill={tokens.green} />;
      })}
      {labels.map((l, i) => {
        const p = pt(i, 118);
        const anchor = Math.abs(p.x - cx) < 5 ? 'middle' : p.x > cx ? 'start' : 'end';
        return (
          <SvgText
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            alignmentBaseline="middle"
            fontSize={13}
            fontWeight="700"
            fill={tokens.textSub}
          >
            {l}
          </SvgText>
        );
      })}
    </Svg>
  );
};
