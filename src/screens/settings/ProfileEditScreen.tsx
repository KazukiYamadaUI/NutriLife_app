import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { RootStackParamList } from '@/types';
import { Header } from '@/components/Header';
import { SelectButton } from '@/components/SelectButton';
import { UserIcon } from '@/components/Icons';
import { tokens } from '@/theme/tokens';
import { styles } from '@/theme/styles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileEdit'>;
};

export const ProfileEditScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [gender, setGender] = useState(user?.gender || 'other');
  const [birth, setBirth] = useState(user?.birthYear || '');
  const [height, setHeight] = useState(user?.height || '');
  const [weight, setWeight] = useState(user?.weight || '');

  const handleSave = () => {
    updateUser({
      ...user!,
      displayName: name,
      gender: gender as any,
      birthYear: birth,
      height,
      weight,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <Header
        title="プロフィール編集"
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            onPress={handleSave}
            style={{ minHeight: tokens.touchMin, justifyContent: 'center' }}
          >
            <Text style={{ color: tokens.green, fontSize: tokens.fontBody, fontWeight: '700' }}>
              保存
            </Text>
          </TouchableOpacity>
        }
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <View style={[styles.avatarCircle, { width: 90, height: 90 }]}>
            <UserIcon size={45} color={tokens.green} />
          </View>
        </View>
        <View>
          <Text style={styles.label}>ニックネーム</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} />
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
        <View>
          <Text style={styles.label}>生まれた年</Text>
          <TextInput
            placeholder="例：1958"
            value={birth}
            onChangeText={setBirth}
            keyboardType="number-pad"
            style={styles.inputCenter}
          />
        </View>
        <View>
          <Text style={styles.label}>身長（cm）</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TextInput
              placeholder="160"
              value={height}
              onChangeText={setHeight}
              keyboardType="number-pad"
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
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              style={[styles.inputCenter, { flex: 1 }]}
            />
            <Text style={{ fontSize: tokens.fontLarge, fontWeight: '700' }}>kg</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
