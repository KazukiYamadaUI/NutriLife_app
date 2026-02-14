import React from 'react';
import Svg, {
  Circle,
  Line,
  Polyline,
  Polygon,
  Rect,
  Path,
  Text as SvgText,
  G,
} from 'react-native-svg';
import { tokens } from '@/theme/tokens';

interface IconProps {
  size?: number;
  color?: string;
}

const IconWrap: React.FC<IconProps & { children: React.ReactNode }> = ({
  children,
  size = 28,
  color = tokens.text,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </Svg>
);

export const CameraIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <Circle cx="12" cy="13" r="3" />
  </IconWrap>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </IconWrap>
);

export const ChartIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Line x1="18" y1="20" x2="18" y2="10" />
    <Line x1="12" y1="20" x2="12" y2="4" />
    <Line x1="6" y1="20" x2="6" y2="14" />
  </IconWrap>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </IconWrap>
);

export const UserIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </IconWrap>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Line x1="19" y1="12" x2="5" y2="12" />
    <Polyline points="12 19 5 12 12 5" />
  </IconWrap>
);

export const ThumbUpIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </IconWrap>
);

export const ThumbDownIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </IconWrap>
);

export const LockIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </IconWrap>
);

export const HeartIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0L12 5.34l-.77-.76a5.4 5.4 0 0 0-7.65 7.65l.77.76L12 20.64l7.65-7.65.77-.76a5.4 5.4 0 0 0 0-7.65z" />
  </IconWrap>
);

export const ActivityIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </IconWrap>
);

export const LinkIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </IconWrap>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <Polyline points="22 4 12 14.01 9 11.01" />
  </IconWrap>
);

export const RefreshIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Polyline points="23 4 23 10 17 10" />
    <Path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </IconWrap>
);

export const ChevronLIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Polyline points="15 18 9 12 15 6" />
  </IconWrap>
);

export const ChevronRIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Polyline points="9 18 15 12 9 6" />
  </IconWrap>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <Line x1="16" y1="2" x2="16" y2="6" />
    <Line x1="8" y1="2" x2="8" y2="6" />
    <Line x1="3" y1="10" x2="21" y2="10" />
  </IconWrap>
);

export const ImageIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <Circle cx="8.5" cy="8.5" r="1.5" />
    <Polyline points="21 15 16 10 5 21" />
  </IconWrap>
);

export const DocIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <Polyline points="14 2 14 8 20 8" />
    <Line x1="16" y1="13" x2="8" y2="13" />
    <Line x1="16" y1="17" x2="8" y2="17" />
  </IconWrap>
);

export const BellIcon: React.FC<IconProps> = ({ size = 28, color = tokens.text }) => (
  <IconWrap size={size} color={color}>
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </IconWrap>
);
