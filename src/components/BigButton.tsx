import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { tokens } from '@/theme/tokens';
import { styles } from '@/theme/styles';

interface BigButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  color?: string;
  textColor?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}

export const BigButton: React.FC<BigButtonProps> = ({
  children,
  onPress,
  color = tokens.green,
  textColor = '#fff',
  icon,
  style: extra,
  disabled,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
    style={[
      styles.bigBtn,
      { backgroundColor: disabled ? tokens.border : color, opacity: disabled ? 0.6 : 1 },
      extra,
    ]}
  >
    {icon}
    <Text style={[styles.bigBtnText, { color: disabled ? tokens.textMuted : textColor }]}>{children}</Text>
  </TouchableOpacity>
);
