import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';
import { FoodNotDetectedError } from '@/services/geminiService';
import { RootStackParamList } from '@/types';
import { Header } from '@/components/Header';
import {
  CameraIcon,
  ImageIcon,
  ArrowLeftIcon,
} from '@/components/Icons';
import { tokens } from '@/theme/tokens';
import { styles } from '@/theme/styles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Camera'>;
  route: RouteProp<RootStackParamList, 'Camera'>;
};

export const CameraScreen: React.FC<Props> = ({ navigation, route }) => {
  const initMode = route.params?.mode || 'camera';
  const { analyzeMeal } = useApp();
  const [mode, setMode] = useState(initMode);
  const [capturing, setCapturing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    setCapturing(true);
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });
        if (photo?.base64) {
          navigation.replace('Analyzing');
          await analyzeMeal(photo.base64, 'image/jpeg');
          navigation.replace('Result');
          return;
        }
      }
      navigation.replace('AnalysisFailed');
    } catch (error) {
      if (error instanceof FoodNotDetectedError) {
        navigation.replace('DetectionFailed');
      } else {
        navigation.replace('AnalysisFailed');
      }
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets[0]?.base64) {
        setCapturing(true);
        navigation.replace('Analyzing');
        await analyzeMeal(result.assets[0].base64, 'image/jpeg');
        navigation.replace('Result');
      }
    } catch (error) {
      if (error instanceof FoodNotDetectedError) {
        navigation.replace('DetectionFailed');
      } else {
        navigation.replace('AnalysisFailed');
      }
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

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          {capturing ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <ActivityIndicator color={tokens.green} />
              <Text style={{ fontSize: tokens.fontBody, fontWeight: '600' }}>
                解析中...
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.filePickBtn} onPress={handlePickImage}>
              <ImageIcon size={24} color={tokens.green} />
              <Text style={{ fontSize: tokens.fontBody, fontWeight: '700', color: tokens.green }}>
                スマホの写真から選ぶ
              </Text>
            </TouchableOpacity>
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
              解析中...
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
