import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { tokens } from '@/theme/tokens';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
  Notifications?.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch {
  // Simulator環境ではネイティブモジュール未搭載のため正常動作
}

interface ReminderConfig {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

interface TimeValue {
  hour: number;
  minute: number;
}

interface ReminderTimes {
  breakfast: TimeValue;
  lunch: TimeValue;
  dinner: TimeValue;
}

type MealKey = keyof ReminderConfig;

const DEFAULT_TIMES: ReminderTimes = {
  breakfast: { hour: 8, minute: 0 },
  lunch: { hour: 12, minute: 0 },
  dinner: { hour: 19, minute: 0 },
};

const STORAGE_KEY_CONFIG = '@nutrilife/reminder_config';
const STORAGE_KEY_TIMES = '@nutrilife/reminder_times';

function formatTime(hour: number, minute: number): string {
  return `${hour}:${minute.toString().padStart(2, '0')}`;
}

async function requestPermissions(): Promise<boolean> {
  if (!Notifications) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function scheduleReminder(hour: number, minute: number, title: string, body: string) {
  if (!Notifications) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

async function cancelAll() {
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

const TimePickerModal: React.FC<{
  visible: boolean;
  currentHour: number;
  currentMinute: number;
  onConfirm: (hour: number, minute: number) => void;
  onCancel: () => void;
}> = ({ visible, currentHour, currentMinute, onConfirm, onCancel }) => {
  const [hour, setHour] = useState(currentHour);
  const [minute, setMinute] = useState(currentMinute);

  useEffect(() => {
    if (visible) {
      setHour(currentHour);
      setMinute(currentMinute);
    }
  }, [visible, currentHour, currentMinute]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: tokens.card,
            borderRadius: tokens.radius,
            padding: 24,
            width: Dimensions.get('window').width - 48,
            maxWidth: 360,
          }}
        >
          <Text
            style={{
              fontSize: tokens.fontTitle,
              fontWeight: '700',
              color: tokens.text,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            通知時間を設定
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 24,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: tokens.fontSmall, color: tokens.textMuted, marginBottom: 8 }}>
                時
              </Text>
              <View
                style={{
                  backgroundColor: tokens.bg,
                  borderRadius: tokens.radiusSm,
                  height: 200,
                  width: 80,
                  overflow: 'hidden',
                }}
              >
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 80 }}
                >
                  {HOURS.map((h) => (
                    <TouchableOpacity
                      key={h}
                      onPress={() => setHour(h)}
                      style={{
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: hour === h ? tokens.greenLight : 'transparent',
                        borderRadius: 8,
                        marginHorizontal: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: hour === h ? tokens.fontTitle : tokens.fontBody,
                          fontWeight: hour === h ? '700' : '400',
                          color: hour === h ? tokens.green : tokens.textSub,
                        }}
                      >
                        {h}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Text
              style={{
                fontSize: tokens.fontTitle,
                fontWeight: '700',
                color: tokens.text,
                marginTop: 24,
              }}
            >
              :
            </Text>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: tokens.fontSmall, color: tokens.textMuted, marginBottom: 8 }}>
                分
              </Text>
              <View
                style={{
                  backgroundColor: tokens.bg,
                  borderRadius: tokens.radiusSm,
                  height: 200,
                  width: 80,
                  overflow: 'hidden',
                }}
              >
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 80 }}
                >
                  {MINUTES.map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setMinute(m)}
                      style={{
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: minute === m ? tokens.greenLight : 'transparent',
                        borderRadius: 8,
                        marginHorizontal: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: minute === m ? tokens.fontTitle : tokens.fontBody,
                          fontWeight: minute === m ? '700' : '400',
                          color: minute === m ? tokens.green : tokens.textSub,
                        }}
                      >
                        {m.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          <Text
            style={{
              fontSize: tokens.fontHero,
              fontWeight: '800',
              color: tokens.text,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            {formatTime(hour, minute)}
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                height: tokens.touchMin,
                borderRadius: tokens.radiusSm,
                backgroundColor: tokens.bg,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: tokens.fontBody, fontWeight: '600', color: tokens.textSub }}>
                キャンセル
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(hour, minute)}
              style={{
                flex: 1,
                height: tokens.touchMin,
                borderRadius: tokens.radiusSm,
                backgroundColor: tokens.green,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: tokens.fontBody, fontWeight: '600', color: '#fff' }}>
                設定
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const MEAL_META: Record<MealKey, { emoji: string; label: string; notifTitle: string; notifBody: string }> = {
  breakfast: { emoji: '🍳', label: '朝食リマインダー', notifTitle: '🍳 朝食の時間です', notifBody: '朝食を記録しましょう！' },
  lunch: { emoji: '🍱', label: '昼食リマインダー', notifTitle: '🍱 昼食の時間です', notifBody: '昼食を記録しましょう！' },
  dinner: { emoji: '🍽️', label: '夕食リマインダー', notifTitle: '🍽️ 夕食の時間です', notifBody: '夕食を記録しましょう！' },
};

export const NotifSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [config, setConfig] = useState<ReminderConfig>({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [times, setTimes] = useState<ReminderTimes>(DEFAULT_TIMES);
  const [pickerTarget, setPickerTarget] = useState<MealKey | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [savedConfig, savedTimes] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_CONFIG),
          AsyncStorage.getItem(STORAGE_KEY_TIMES),
        ]);
        if (savedConfig) setConfig(JSON.parse(savedConfig));
        if (savedTimes) setTimes({ ...DEFAULT_TIMES, ...JSON.parse(savedTimes) });
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const syncReminders = useCallback(
    async (newConfig: ReminderConfig, newTimes: ReminderTimes) => {
      if (!Notifications) {
        Alert.alert('通知機能が利用できません', 'アプリを再ビルドしてください。');
        return;
      }

      await cancelAll();

      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('通知の許可', '設定アプリから通知を許可してください。');
        return;
      }

      for (const key of ['breakfast', 'lunch', 'dinner'] as MealKey[]) {
        if (newConfig[key]) {
          const meta = MEAL_META[key];
          const t = newTimes[key];
          await scheduleReminder(t.hour, t.minute, meta.notifTitle, meta.notifBody);
        }
      }

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig)),
        AsyncStorage.setItem(STORAGE_KEY_TIMES, JSON.stringify(newTimes)),
      ]);
    },
    [],
  );

  const handleToggle = async (key: MealKey, value: boolean) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    await syncReminders(newConfig, times);
  };

  const handleTimeConfirm = async (hour: number, minute: number) => {
    if (!pickerTarget) return;
    const newTimes = { ...times, [pickerTarget]: { hour, minute } };
    setTimes(newTimes);
    setPickerTarget(null);
    if (config[pickerTarget]) {
      await syncReminders(config, newTimes);
    } else {
      await AsyncStorage.setItem(STORAGE_KEY_TIMES, JSON.stringify(newTimes));
    }
  };

  if (!loaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.bg }}>
      <Header title="食事リマインダー" onBack={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text
          style={{
            fontSize: tokens.fontBody,
            color: tokens.textSub,
            lineHeight: 28,
            marginBottom: 20,
          }}
        >
          食事の時間に通知でお知らせします。{'\n'}
          時刻をタップすると変更できます。
        </Text>

        {(['breakfast', 'lunch', 'dinner'] as MealKey[]).map((key) => {
          const meta = MEAL_META[key];
          const t = times[key];
          return (
            <Card key={key} style={{ marginBottom: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: tokens.fontLarge,
                      fontWeight: '700',
                      color: tokens.text,
                    }}
                  >
                    {meta.emoji} {meta.label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setPickerTarget(key)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 4,
                      alignSelf: 'flex-start',
                      backgroundColor: tokens.bg,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.fontSub,
                        fontWeight: '600',
                        color: tokens.green,
                      }}
                    >
                      毎日 {formatTime(t.hour, t.minute)}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.fontSmall,
                        color: tokens.textMuted,
                        marginLeft: 6,
                      }}
                    >
                      変更
                    </Text>
                  </TouchableOpacity>
                </View>
                <Switch
                  value={config[key]}
                  onValueChange={(v) => handleToggle(key, v)}
                  trackColor={{ false: tokens.border, true: tokens.greenLight }}
                  thumbColor={config[key] ? tokens.green : '#f4f3f4'}
                />
              </View>
            </Card>
          );
        })}

        <Text
          style={{
            fontSize: tokens.fontSmall,
            color: tokens.textMuted,
            textAlign: 'center',
            marginTop: 16,
            lineHeight: 22,
          }}
        >
          ※ 通知の受信にはデバイスの通知設定で{'\n'}
          NutriLife の通知を許可する必要があります
        </Text>
      </ScrollView>

      <TimePickerModal
        visible={pickerTarget !== null}
        currentHour={pickerTarget ? times[pickerTarget].hour : 8}
        currentMinute={pickerTarget ? times[pickerTarget].minute : 0}
        onConfirm={handleTimeConfirm}
        onCancel={() => setPickerTarget(null)}
      />
    </SafeAreaView>
  );
};
