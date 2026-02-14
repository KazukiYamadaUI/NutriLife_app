import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { RootStackParamList } from '@/types';
import { BigButton } from '@/components/BigButton';
import { AppLogo } from '@/components/AppLogo';
import { LockIcon } from '@/components/Icons';
import { tokens } from '@/theme/tokens';
import { styles } from '@/theme/styles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
};

export const AuthScreen: React.FC<Props> = ({ navigation }) => {
  const { sendCode, verifyCode } = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [ld, setLd] = useState(false);
  const [err, setErr] = useState('');

  const send = async () => {
    if (phone.length < 11) {
      setErr('電話番号は11桁で入力してください');
      return;
    }
    setErr('');
    setLd(true);
    try {
      await sendCode(phone);
      setStep('code');
    } catch (e) {
      setErr('送信に失敗しました。もう一度お試しください。');
    } finally {
      setLd(false);
    }
  };

  const verify = async () => {
    if (code.length < 4) {
      setErr('4桁の認証番号を入力してください');
      return;
    }
    setErr('');
    setLd(true);
    try {
      await verifyCode(phone, code);
      // Navigation is handled by the RootNavigator based on auth state
    } catch (e) {
      setErr('認証に失敗しました。コードを確認してください。');
      setLd(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.greenLight }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.authContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: 16 }}>
            <AppLogo size={120} />
          </View>
          <Text style={styles.authTitle}>NutriLife</Text>
          <Text style={styles.authSub}>撮るだけ かんたん 栄養チェック</Text>
          <View style={{ width: '100%', maxWidth: 360 }}>
            {step === 'phone' ? (
              <>
                <Text style={styles.label}>電話番号を入力してください</Text>
                <TextInput
                  placeholder="09012345678"
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 11))}
                  keyboardType="number-pad"
                  maxLength={11}
                  style={styles.inputCenter}
                />
                {err ? <Text style={styles.errText}>{err}</Text> : null}
                <View style={{ marginTop: 16 }}>
                  <BigButton onPress={send} disabled={ld}>
                    {ld ? '送信中...' : '確認の番号を送る'}
                  </BigButton>
                </View>
                <Text style={styles.authHint}>
                  ショートメッセージ（SMS）で{'\n'}4桁の番号が届きます
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.authHint, { marginBottom: 4 }]}>
                  <Text style={{ fontWeight: '700' }}>{phone}</Text> に送信しました
                </Text>
                <Text style={[styles.label, { textAlign: 'center' }]}>届いた4桁の番号を入力</Text>
                <TextInput
                  placeholder="1234"
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 4))}
                  keyboardType="number-pad"
                  maxLength={4}
                  style={[
                    styles.inputCenter,
                    { fontSize: 32, fontWeight: '800', letterSpacing: 12 },
                  ]}
                />
                {err ? <Text style={[styles.errText, { textAlign: 'center' }]}>{err}</Text> : null}
                <View style={{ marginTop: 16 }}>
                  <BigButton onPress={verify} disabled={ld}>
                    {ld ? '確認中...' : 'ログイン'}
                  </BigButton>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setStep('phone');
                    setCode('');
                    setErr('');
                  }}
                  style={styles.linkBtn}
                >
                  <Text style={styles.linkBtnText}>← 電話番号をなおす</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          <View style={styles.lockRow}>
            <LockIcon size={18} color={tokens.textMuted} />
            <Text style={styles.lockText}>あなたの情報は安全に守られています</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
