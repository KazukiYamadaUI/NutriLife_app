import React, { useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '@/context/AppContext';
import { RootStackParamList } from '@/types';
import { Header } from '@/components/Header';
import { MealDetailView } from '@/components/MealDetailView';
import { tokens } from '@/theme/tokens';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
};

export const ResultScreen: React.FC<Props> = ({ navigation }) => {
  const { currentAnalysis, sendFeedback } = useApp();

  useEffect(() => {
    if (!currentAnalysis) {
      navigation.goBack();
    }
  }, [currentAnalysis, navigation]);

  if (!currentAnalysis) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: tokens.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={tokens.green} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <Header title="けっかを見る" onBack={() => navigation.popToTop()} />
      <ScrollView style={{ flex: 1 }}>
        <MealDetailView
          analysis={currentAnalysis}
          showFeedback
          onFeedback={(t) => sendFeedback('current', t)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
