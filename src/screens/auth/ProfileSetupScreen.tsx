import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { RootStackParamList } from '@/types';
import { Header } from '@/components/Header';
import { BigButton } from '@/components/BigButton';
import { Card } from '@/components/Card';
import { SelectButton } from '@/components/SelectButton';
import { UserIcon } from '@/components/Icons';
import { tokens } from '@/theme/tokens';
import { styles } from '@/theme/styles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileSetup'>;
};

export const ProfileSetupScreen: React.FC<Props> = ({ navigation }) => {
  const { completeProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birth, setBirth] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const totalSteps = 2;

  const handleComplete = () => {
    completeProfile({
      displayName: name || 'ユーザー',
      gender: (gender as any) || 'other',
      birthYear: birth,
      height,
      weight,
    });
  };

  const renderStep0 = () => (
    <View style={{ gap: 20 }}>
      <View style={{ alignItems: 'center' }}>
        <View style={[styles.avatarCircle, { width: 80, height: 80 }]}>
          <UserIcon size={40} color={tokens.green} />
        </View>
      </View>
      <View>
        <Text style={styles.label}>ニックネーム</Text>
        <TextInput placeholder="例：田中太郎" value={name} onChangeText={setName} style={styles.input} />
      </View>
      <View>
        <Text style={styles.label}>性別</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {([['male', '男性'], ['female', '女性'], ['other', '答えない']] as const).map(
            ([v, l]) => (
              <SelectButton
                key={v}
                label={l}
                selected={gender === v}
                onPress={() => setGender(v)}
              />
            )
          )}
        </View>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={{ gap: 20 }}>
      <Card style={{ backgroundColor: tokens.orangeLight, borderColor: '#f5d9b3' }}>
        <Text style={{ fontSize: tokens.fontBody, color: tokens.text, lineHeight: 28 }}>
          🤖 身長・体重・年齢をもとに、あなたに必要な
          <Text style={{ fontWeight: '700' }}>カロリーや栄養素</Text>
          をAIが正確に計算します。
        </Text>
      </Card>
      <View>
        <Text style={styles.label}>生まれた年（4桁）</Text>
        <TextInput
          placeholder="例：1958"
          value={birth}
          onChangeText={(t) => setBirth(t.replace(/[^0-9]/g, '').slice(0, 4))}
          keyboardType="number-pad"
          maxLength={4}
          style={styles.inputCenter}
        />
      </View>
      <View>
        <Text style={styles.label}>身長（cm）</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TextInput
            placeholder="160"
            value={height}
            onChangeText={(t) => setHeight(t.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            maxLength={3}
            style={[styles.inputCenter, { flex: 1 }]}
          />
          <Text style={{ fontSize: tokens.fontLarge, fontWeight: '700' }}>cm</Text>
        </View>
      </View>
      <View>
        <Text style={styles.label}>体重（kg）</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TextInput
            placeholder="60"
            value={weight}
            onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, '').slice(0, 5))}
            keyboardType="decimal-pad"
            style={[styles.inputCenter, { flex: 1 }]}
          />
          <Text style={{ fontSize: tokens.fontLarge, fontWeight: '700' }}>kg</Text>
        </View>
      </View>
      <Text
        style={{
          fontSize: tokens.fontSmall,
          color: tokens.textMuted,
          lineHeight: 22,
        }}
      >
        ※ あとから「せってい」でいつでも変更できます。{'\n'}入力しなくても始められます。
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <Header
        title={step === 0 ? 'あなたのことを教えてください' : 'からだの情報'}
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
      />
      <View
        style={{
          flexDirection: 'row',
          gap: 6,
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
      >
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: i <= step ? tokens.green : '#e0e0e0',
            }}
          />
        ))}
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {step === 0 ? renderStep0() : renderStep1()}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10, padding: 20, paddingBottom: 28 }}>
        {step > 0 && (
          <BigButton
            onPress={() => setStep(step - 1)}
            color={tokens.card}
            textColor={tokens.text}
            style={{ flex: 0, minWidth: 100, borderWidth: 2, borderColor: tokens.border }}
          >
            もどる
          </BigButton>
        )}
        {step < totalSteps - 1 ? (
          <BigButton onPress={() => setStep(step + 1)} disabled={!name} style={{ flex: 1 }}>
            つぎへ →
          </BigButton>
        ) : (
          <BigButton onPress={handleComplete} style={{ flex: 1 }}>
            はじめる →
          </BigButton>
        )}
      </View>
    </SafeAreaView>
  );
};
