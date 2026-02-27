import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { Header } from '@/components/Header';
import { tokens } from '@/theme/tokens';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Terms'>;
};

export const TermsScreen: React.FC<Props> = ({ navigation }) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
    <Header title="利用規約" onBack={() => navigation.goBack()} />
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
      <Text
        style={{
          fontSize: tokens.fontBody,
          color: tokens.text,
          lineHeight: 32,
          marginBottom: 10,
        }}
      >
        本利用規約（以下「本規約」）は、NutriLife運営事務局（以下「当社」）が提供するアプリケーション「NutriLife」（以下「本アプリ」）の利用条件を定めるものです。
      </Text>
      <Text
        style={{
          fontSize: tokens.fontLarge,
          fontWeight: '800',
          color: tokens.green,
          marginTop: 28,
          marginBottom: 8,
        }}
      >
        第1条（サービスの概要）
      </Text>
      <Text style={{ fontSize: tokens.fontBody, color: tokens.text, lineHeight: 32 }}>
        本アプリは、利用者が撮影または選択した食事の写真をAIで解析し、推定カロリー・栄養素の表示、食事に関するアドバイスを行うサービスです。
      </Text>
      <Text
        style={{
          fontSize: tokens.fontLarge,
          fontWeight: '800',
          color: tokens.green,
          marginTop: 28,
          marginBottom: 8,
        }}
      >
        第2条（利用登録）
      </Text>
      <Text style={{ fontSize: tokens.fontBody, color: tokens.text, lineHeight: 32 }}>
        本アプリの利用にあたっては、電話番号によるSMS認証が必要です。虚偽の情報を登録した場合、当社はサービス提供を停止できるものとします。
      </Text>
      <Text
        style={{
          fontSize: tokens.fontLarge,
          fontWeight: '800',
          color: tokens.green,
          marginTop: 28,
          marginBottom: 8,
        }}
      >
        第3条（個人情報の取り扱い）
      </Text>
      <Text style={{ fontSize: tokens.fontBody, color: tokens.text, lineHeight: 32 }}>
        当社は、利用者の個人情報を適切に管理し、サービスの提供・改善の目的にのみ利用します。第三者への提供は、法令に基づく場合を除き、利用者の同意なく行いません。
      </Text>
      <Text
        style={{
          fontSize: tokens.fontLarge,
          fontWeight: '800',
          color: tokens.green,
          marginTop: 28,
          marginBottom: 8,
        }}
      >
        第4条（AI解析に関する免責事項）
      </Text>
      <Text style={{ fontSize: tokens.fontBody, color: tokens.text, lineHeight: 32 }}>
        本アプリのAI解析結果は推定値であり、正確性を保証するものではありません。本アプリは医療機器ではなく、医療診断を目的としたものではありません。健康上の判断は、必ず医師等の専門家にご相談ください。
      </Text>
      <Text
        style={{
          fontSize: tokens.fontLarge,
          fontWeight: '800',
          color: tokens.green,
          marginTop: 28,
          marginBottom: 8,
        }}
      >
        第5条（禁止事項）
      </Text>
      <Text style={{ fontSize: tokens.fontBody, color: tokens.text, lineHeight: 32 }}>
        利用者は、以下の行為を行ってはならないものとします。{'\n'}
        （1）法令に違反する行為{'\n'}
        （2）当社のサーバーに過度な負荷をかける行為{'\n'}
        （3）他の利用者または第三者の権利を侵害する行為{'\n'}
        （4）不正アクセスやリバースエンジニアリング
      </Text>
      <Text
        style={{
          fontSize: tokens.fontSmall,
          color: tokens.textMuted,
          marginTop: 40,
          textAlign: 'center',
          lineHeight: 22,
        }}
      >
        最終更新日：2026年1月1日{'\n'}NutriLife運営事務局
      </Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  </SafeAreaView>
);
