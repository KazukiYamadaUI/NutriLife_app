import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { CameraIcon, ImageIcon, HomeIcon } from '@/components/Icons';
import { AppLogo } from '@/components/AppLogo';
import { tokens } from '@/theme/tokens';
import { styles } from '@/theme/styles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AnalysisFailed'>;
};

export const AnalysisFailedScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          gap: 20,
        }}
      >
        <AppLogo size={64} />

        <Text
          style={{
            fontSize: tokens.fontTitle,
            fontWeight: '800',
            color: tokens.text,
            textAlign: 'center',
          }}
        >
          解析できませんでした
        </Text>

        <Text
          style={{
            fontSize: tokens.fontBody,
            color: tokens.textSub,
            textAlign: 'center',
            lineHeight: 28,
          }}
        >
          画像の解析中にエラーが発生しました。{'\n'}
          通信状況を確認して、もう一度お試しください。
        </Text>

        <View
          style={[
            styles.card,
            { width: '100%', marginTop: 4, gap: 10 },
          ]}
        >
          <Text
            style={{
              fontSize: tokens.fontSub,
              fontWeight: '700',
              color: tokens.green,
              marginBottom: 2,
            }}
          >
            うまくいかないときは
          </Text>
          {[
            'Wi-Fi やモバイル通信が有効か確認する',
            '少し時間をおいてから再度お試しください',
            '写真を変えて試してみましょう',
          ].map((tip, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: tokens.fontSub, color: tokens.green, lineHeight: 24 }}>
                {'\u2022'}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: tokens.fontSub,
                  color: tokens.textSub,
                  lineHeight: 24,
                }}
              >
                {tip}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ width: '100%', gap: 12, marginTop: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.replace('Camera', { mode: 'camera' })}
            style={[
              styles.bigBtn,
              { backgroundColor: tokens.green },
            ]}
          >
            <CameraIcon size={22} color="#fff" />
            <Text style={[styles.bigBtnText, { color: '#fff' }]}>
              もう一度撮影する
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.replace('Camera', { mode: 'album' })}
            style={[
              styles.bigBtn,
              {
                backgroundColor: tokens.card,
                borderWidth: 2,
                borderColor: tokens.green,
              },
            ]}
          >
            <ImageIcon size={22} color={tokens.green} />
            <Text style={[styles.bigBtnText, { color: tokens.green }]}>
              アルバムから選び直す
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.popToTop()}
            style={[
              styles.bigBtn,
              {
                backgroundColor: tokens.bg,
                borderWidth: 2,
                borderColor: tokens.border,
              },
            ]}
          >
            <HomeIcon size={20} color={tokens.textMuted} />
            <Text style={[styles.bigBtnText, { color: tokens.textMuted, fontSize: tokens.fontBody }]}>
              ホームに戻る
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
