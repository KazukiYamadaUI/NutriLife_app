import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types';
import { Header } from '@/components/Header';
import { MealDetailView } from '@/components/MealDetailView';
import { tokens } from '@/theme/tokens';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MealDetail'>;
  route: RouteProp<RootStackParamList, 'MealDetail'>;
};

export const MealLogDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { log } = route.params;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <Header title={`${log.name}のきろく`} onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            paddingHorizontal: 16,
            paddingTop: 12,
          }}
        >
          <Text
            style={{
              fontSize: tokens.fontSub,
              fontWeight: '700',
              color: tokens.textMuted,
            }}
          >
            📅 {log.date}
          </Text>
          <Text
            style={{
              fontSize: tokens.fontSub,
              fontWeight: '700',
              color: tokens.green,
            }}
          >
            🕐 {log.time}
          </Text>
        </View>
        <MealDetailView analysis={log} showFeedback={false} />
      </ScrollView>
    </SafeAreaView>
  );
};
