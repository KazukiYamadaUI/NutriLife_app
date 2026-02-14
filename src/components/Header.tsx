import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { tokens } from '@/theme/tokens';
import { ArrowLeftIcon } from './Icons';
import { styles } from '@/theme/styles';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, right }) => (
  <View style={styles.header}>
    {onBack ? (
      <TouchableOpacity onPress={onBack} style={styles.headerBack}>
        <ArrowLeftIcon size={28} color={tokens.green} />
      </TouchableOpacity>
    ) : (
      <View style={{ width: 52 }} />
    )}
    <Text style={styles.headerTitle} numberOfLines={1}>
      {title}
    </Text>
    {right ? <View style={{ minWidth: 52 }}>{right}</View> : <View style={{ width: 52 }} />}
  </View>
);
