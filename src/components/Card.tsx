import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { styles } from '@/theme/styles';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style: extra }) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.card, extra] as any}
    >
      {children}
    </Wrapper>
  );
};
