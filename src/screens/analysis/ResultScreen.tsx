import React from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
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

  if (!currentAnalysis) {
    navigation.goBack();
    return null;
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
