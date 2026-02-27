import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { tokens } from '@/theme/tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: tokens.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const CardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View
    style={[
      {
        backgroundColor: tokens.card,
        borderRadius: tokens.radius,
        padding: 20,
        borderWidth: 1,
        borderColor: tokens.border,
        gap: 12,
      },
      style,
    ]}
  >
    <Skeleton width="60%" height={24} />
    <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'space-around' }}>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Skeleton width={50} height={32} borderRadius={4} />
        <Skeleton width={40} height={14} />
      </View>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Skeleton width={50} height={32} borderRadius={4} />
        <Skeleton width={40} height={14} />
      </View>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Skeleton width={50} height={32} borderRadius={4} />
        <Skeleton width={40} height={14} />
      </View>
    </View>
  </View>
);

export const MealCardSkeleton: React.FC = () => (
  <View
    style={{
      backgroundColor: tokens.card,
      borderRadius: tokens.radius,
      padding: 14,
      borderWidth: 1,
      borderColor: tokens.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginBottom: 8,
    }}
  >
    <Skeleton width={48} height={48} borderRadius={24} />
    <View style={{ flex: 1, gap: 6 }}>
      <Skeleton width="70%" height={18} />
      <Skeleton width="30%" height={14} />
    </View>
    <Skeleton width={40} height={24} />
  </View>
);
