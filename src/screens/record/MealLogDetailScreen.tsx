import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { MealDetailView } from '@/components/MealDetailView';
import { tokens } from '@/theme/tokens';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MealDetail'>;
  route: RouteProp<RootStackParamList, 'MealDetail'>;
};

export const MealLogDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { log } = route.params;
  const { deleteMealLog } = useApp();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      '記録を削除',
      `「${log.name}」の記録を削除しますか？この操作は取り消せません。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            if (!log.id) return;
            setDeleting(true);
            try {
              await deleteMealLog(log.id);
              navigation.goBack();
            } catch {
              Alert.alert('エラー', '削除に失敗しました。');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <Header title={`${log.name}のきろく`} onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            paddingHorizontal: 16,
            paddingTop: 12,
          }}
        >
          <Text
            style={{
              fontSize: tokens.fontSub,
              fontWeight: '700',
              color: tokens.textMuted,
            }}
          >
            📅 {log.date}
          </Text>
          <Text
            style={{
              fontSize: tokens.fontSub,
              fontWeight: '700',
              color: tokens.green,
            }}
          >
            🕐 {log.time}
          </Text>
        </View>
        <MealDetailView analysis={log} showFeedback={false} />

        {log.id && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleting}
              style={{
                minHeight: tokens.touchMin,
                borderRadius: tokens.radiusSm,
                borderWidth: 2,
                borderColor: tokens.danger,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: deleting ? 0.5 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.fontBody,
                  fontWeight: '700',
                  color: tokens.danger,
                }}
              >
                {deleting ? '削除中...' : 'この記録を削除する'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
