import React, { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { useApp } from '@/context/AppContext';
import { RootStackParamList } from '@/types';
import { Header } from '@/components/Header';
import { MealDetailView } from '@/components/MealDetailView';
import { BottomNav } from '@/components/BottomNav';
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

  const handleNav = (key: string) => {
    const tabName = key === 'home' ? 'Home' : key === 'record' ? 'Record' : 'Settings';
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            state: {
              routes: [{ name: tabName }],
            },
          },
        ],
      })
    );
  };

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
      <BottomNav current="" onNav={handleNav} />
    </SafeAreaView>
  );
};
