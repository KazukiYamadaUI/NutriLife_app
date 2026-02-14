import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '@/context/AppContext';
import { RootStackParamList } from '@/types';
import { Header } from '@/components/Header';
import { BigButton } from '@/components/BigButton';
import { Card } from '@/components/Card';
import { CheckCircleIcon } from '@/components/Icons';
import { tokens } from '@/theme/tokens';
import { styles } from '@/theme/styles';

const { width: SCREEN_W } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Lifestyle'>;
};

export const LifestyleScreen: React.FC<Props> = ({ navigation }) => {
  const { lifestyle, setLifestyle } = useApp();
  const [portion, setPortion] = useState(lifestyle?.portionSize || '');
  const [exercise, setExercise] = useState(lifestyle?.exerciseLevel || '');
  const [appetite, setAppetite] = useState(lifestyle?.appetite || '');
  const [mealFreq, setMealFreq] = useState(lifestyle?.mealFrequency || '');
  const [walk, setWalk] = useState(lifestyle?.walkMinutes || '');

  const handleSave = () => {
    setLifestyle({
      portionSize: portion,
      exerciseLevel: exercise,
      appetite,
      mealFrequency: mealFreq,
      walkMinutes: walk,
    });
    navigation.goBack();
  };

  const OptionGrid: React.FC<{
    options: [string, string, string?][];
    value: string;
    onChange: (v: string) => void;
    cols?: number;
  }> = ({ options, value, onChange, cols = 3 }) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map(([v, l, emoji]) => {
        const w =
          cols === 4
            ? (SCREEN_W - 40 - 24) / 4
            : (SCREEN_W - 40 - 16) / 3;
        return (
          <TouchableOpacity
            key={v}
            onPress={() => onChange(v)}
            style={[
              styles.optionBtn,
              { width: w },
              value === v && {
                borderColor: tokens.green,
                backgroundColor: tokens.greenLight,
              },
            ]}
          >
            {emoji ? <Text style={{ fontSize: 24 }}>{emoji}</Text> : null}
            <Text
              style={{
                fontSize: tokens.fontSub,
                fontWeight: value === v ? '700' : '500',
                color: value === v ? tokens.green : tokens.text,
                textAlign: 'center',
              }}
            >
              {l}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <Header title="食事量・運動量" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Card
          style={{
            backgroundColor: tokens.orangeLight,
            borderColor: '#f5d9b3',
            marginBottom: 24,
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 28 }}>🤖</Text>
          <Text
            style={{
              flex: 1,
              fontSize: tokens.fontBody,
              color: tokens.text,
              lineHeight: 28,
            }}
          >
            ふだんの生活スタイルを教えていただくと、AIがより
            <Text style={{ fontWeight: '700' }}>あなたに合ったアドバイス</Text>
            をお伝えできます。
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>🍚 ふだんの食事量は？</Text>
        <OptionGrid
          value={portion}
          onChange={setPortion}
          options={[
            ['small', '少なめ', '🍙'],
            ['normal', 'ふつう', '🍱'],
            ['large', '多め', '🍛'],
          ]}
        />

        <Text style={styles.sectionTitle}>🏃 ふだんの運動量は？</Text>
        {(
          [
            ['sedentary', 'ほとんど動かない', '🏠'],
            ['light', '軽い運動', '🚶'],
            ['moderate', '適度に運動', '🏃'],
            ['active', 'よく運動する', '💪'],
          ] as const
        ).map(([v, l, emoji]) => (
          <TouchableOpacity
            key={v}
            onPress={() => setExercise(v)}
            style={[
              styles.exerciseBtn,
              exercise === v && {
                borderColor: tokens.green,
                backgroundColor: tokens.greenLight,
              },
            ]}
          >
            <Text style={{ fontSize: 28, width: 36, textAlign: 'center' }}>
              {emoji}
            </Text>
            <Text
              style={{
                flex: 1,
                fontSize: tokens.fontBody,
                fontWeight: exercise === v ? '800' : '600',
                color: exercise === v ? tokens.green : tokens.text,
              }}
            >
              {l}
            </Text>
            {exercise === v && <CheckCircleIcon size={24} color={tokens.green} />}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>🚶 1日の歩く時間（目安）</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <TextInput
            placeholder="30"
            value={walk}
            onChangeText={(t) => setWalk(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            style={[styles.inputCenter, { flex: 1 }]}
          />
          <Text style={{ fontSize: tokens.fontLarge, fontWeight: '700' }}>分くらい</Text>
        </View>
      </ScrollView>
      <View
        style={{
          padding: 20,
          paddingBottom: 28,
          borderTopWidth: 2,
          borderTopColor: tokens.border,
          backgroundColor: tokens.card,
        }}
      >
        <BigButton onPress={handleSave}>保存する</BigButton>
      </View>
    </SafeAreaView>
  );
};
