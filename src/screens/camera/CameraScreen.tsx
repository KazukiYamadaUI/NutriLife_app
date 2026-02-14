import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';
import { RootStackParamList } from '@/types';
import { Header } from '@/components/Header';
import { BigButton } from '@/components/BigButton';
import {
  CameraIcon,
  ImageIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from '@/components/Icons';
import { tokens } from '@/theme/tokens';
import { styles } from '@/theme/styles';

const { width: SCREEN_W } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Camera'>;
  route: RouteProp<RootStackParamList, 'Camera'>;
};

export const CameraScreen: React.FC<Props> = ({ navigation, route }) => {
  const initMode = route.params?.mode || 'camera';
  const { analyzeMeal } = useApp();
  const [mode, setMode] = useState(initMode);
  const [capturing, setCapturing] = useState(false);
  const [selImg, setSelImg] = useState<{ id: number; emoji: string; label: string; bg: string } | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const albumItems = [
    { id: 1, emoji: '🍛', label: 'カレーライス', bg: '#fef3c7' },
    { id: 2, emoji: '🍣', label: 'お寿司', bg: '#fce7f3' },
    { id: 3, emoji: '🥗', label: 'サラダ', bg: '#dcfce7' },
    { id: 4, emoji: '🍜', label: 'ラーメン', bg: '#fef9c3' },
    { id: 5, emoji: '🍱', label: 'お弁当', bg: '#e0f2fe' },
    { id: 6, emoji: '🐟', label: '焼き魚定食', bg: '#f3e8ff' },
    { id: 7, emoji: '🥪', label: 'サンドイッチ', bg: '#fff7ed' },
    { id: 8, emoji: '🍙', label: 'おにぎり', bg: '#ecfdf5' },
    { id: 9, emoji: '🍝', label: 'パスタ', bg: '#fef2f2' },
  ];

  const handleCapture = async () => {
    setCapturing(true);
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        if (photo) {
          navigation.replace('Analyzing');
          await analyzeMeal(photo.uri);
          navigation.replace('Result');
          return;
        }
      }
      // Fallback: use mock if camera unavailable
      navigation.replace('Analyzing');
      await analyzeMeal('mock://camera');
      navigation.replace('Result');
    } catch {
      navigation.goBack();
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        setCapturing(true);
        navigation.replace('Analyzing');
        await analyzeMeal(result.assets[0].uri);
        navigation.replace('Result');
      }
    } catch {
      Alert.alert('エラー', '写真の選択に失敗しました');
    }
  };

  const handleConfirmAlbum = async () => {
    setCapturing(true);
    try {
      navigation.replace('Analyzing');
      await analyzeMeal('mock://album');
      navigation.replace('Result');
    } catch {
      navigation.goBack();
    }
  };

  // Album mode
  if (mode === 'album') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
        <Header title="写真を選ぶ" onBack={() => navigation.goBack()} />
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 8,
            gap: 8,
            backgroundColor: tokens.card,
          }}
        >
          <TouchableOpacity
            onPress={() => setMode('camera')}
            style={[styles.modeBtn, { borderColor: tokens.border }]}
          >
            <CameraIcon size={20} color={tokens.textMuted} />
            <Text style={{ fontSize: tokens.fontSub, color: tokens.textSub }}>撮影する</Text>
          </TouchableOpacity>
          <View
            style={[
              styles.modeBtn,
              { backgroundColor: tokens.green, borderColor: tokens.green },
            ]}
          >
            <ImageIcon size={20} color="#fff" />
            <Text style={{ fontSize: tokens.fontSub, color: '#fff', fontWeight: '700' }}>
              写真を選ぶ
            </Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <TouchableOpacity style={styles.filePickBtn} onPress={handlePickImage}>
            <ImageIcon size={24} color={tokens.green} />
            <Text style={{ fontSize: tokens.fontBody, fontWeight: '700', color: tokens.green }}>
              スマホの写真から選ぶ
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: tokens.fontSub,
              fontWeight: '700',
              color: tokens.textMuted,
              marginBottom: 10,
            }}
          >
            最近の写真（デモ）
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {albumItems.map((item) => {
              const w = (SCREEN_W - 32 - 16) / 3;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelImg(item)}
                  style={[
                    styles.albumItem,
                    {
                      width: w,
                      height: w,
                      backgroundColor: item.bg,
                      borderColor:
                        selImg?.id === item.id ? tokens.green : 'transparent',
                    },
                  ]}
                >
                  <Text style={{ fontSize: 40 }}>{item.emoji}</Text>
                  <Text
                    style={{
                      fontSize: tokens.fontSmall,
                      fontWeight: '600',
                      color: tokens.textSub,
                    }}
                  >
                    {item.label}
                  </Text>
                  {selImg?.id === item.id && (
                    <View style={styles.albumCheck}>
                      <CheckCircleIcon size={18} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
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
          {capturing ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                minHeight: 56,
              }}
            >
              <ActivityIndicator color={tokens.green} />
              <Text style={{ fontSize: tokens.fontBody, fontWeight: '600' }}>
                記録ありがとうございます！
              </Text>
            </View>
          ) : (
            <BigButton
              onPress={handleConfirmAlbum}
              disabled={!selImg}
              color={tokens.orangeBg}
              style={{ minHeight: 64 }}
            >
              {selImg ? `「${selImg.label}」をしらべる` : '写真を選んでね'}
            </BigButton>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Camera mode
  const hasPermission = permission?.granted;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            minHeight: tokens.touchMin,
          }}
        >
          <ArrowLeftIcon size={24} color="#fff" />
          <Text
            style={{ color: '#fff', fontSize: tokens.fontBody, fontWeight: '600' }}
          >
            もどる
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingBottom: 8,
          gap: 8,
        }}
      >
        <View
          style={[
            styles.modeBtn,
            {
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderColor: 'rgba(255,255,255,0.3)',
            },
          ]}
        >
          <CameraIcon size={18} color="#fff" />
          <Text style={{ fontSize: tokens.fontSub, color: '#fff', fontWeight: '700' }}>
            撮影する
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setMode('album')}
          style={[styles.modeBtn, { borderColor: 'rgba(255,255,255,0.2)' }]}
        >
          <ImageIcon size={18} color="rgba(255,255,255,0.7)" />
          <Text style={{ fontSize: tokens.fontSub, color: 'rgba(255,255,255,0.7)' }}>
            写真を選ぶ
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {hasPermission ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
          />
        ) : (
          <View
            style={{
              width: 260,
              height: 260,
              borderWidth: 3,
              borderColor: 'rgba(255,255,255,0.35)',
              borderRadius: 20,
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: tokens.fontBody }}>
              カメラプレビュー
            </Text>
            <TouchableOpacity
              onPress={requestPermission}
              style={{
                marginTop: 12,
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: tokens.green,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>
                カメラを使えるようにする
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {capturing && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(255,255,255,0.85)',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <ActivityIndicator size="large" color={tokens.green} />
            <Text
              style={{ fontSize: tokens.fontBody, fontWeight: '600', marginTop: 12 }}
            >
              記録ありがとうございます！
            </Text>
          </View>
        )}
      </View>

      <Text
        style={{
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center',
          fontSize: tokens.fontSub,
          marginHorizontal: 20,
          marginBottom: 12,
          lineHeight: 24,
        }}
      >
        🍽️ 食べかけや、パックのままでもOKです
      </Text>
      <View style={{ alignItems: 'center', paddingBottom: 36 }}>
        <TouchableOpacity
          onPress={handleCapture}
          disabled={capturing}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#fff',
            borderWidth: 5,
            borderColor: 'rgba(255,255,255,0.4)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: 31,
              backgroundColor: capturing ? '#ccc' : tokens.orangeBg,
            }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
