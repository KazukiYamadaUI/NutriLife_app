import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { tokens } from '@/theme/tokens';
import { styles } from '@/theme/styles';

interface SelectButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const SelectButton: React.FC<SelectButtonProps> = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.selectBtn, selected && { borderColor: tokens.green, backgroundColor: tokens.greenLight }]}
  >
    <Text style={[styles.selectBtnText, selected && { color: tokens.green, fontWeight: '700' }]}>
      {label}
    </Text>
  </TouchableOpacity>
);
