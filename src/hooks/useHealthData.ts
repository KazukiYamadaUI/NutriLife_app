import { useState, useEffect, useCallback } from 'react';
import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
} from 'react-native-health';
import { Platform } from 'react-native';

// ─── 型定義 ───────────────────────────────────────────────

/** HealthKit の初期化状態 */
type HealthKitStatus = 'idle' | 'initializing' | 'ready' | 'unavailable' | 'error';

/** 歩数データ */
export interface StepData {
  /** 今日の歩数 */
  steps: number;
  /** データ取得日時 */
  date: string;
}

/** useHealthData フックの返り値 */
export interface UseHealthDataReturn {
  /** HealthKit の初期化状態 */
  status: HealthKitStatus;
  /** HealthKit が利用可能か */
  isAvailable: boolean;
  /** 今日の歩数データ */
  todaySteps: StepData | null;
  /** データ読み込み中か */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** HealthKit を初期化し権限をリクエストする */
  initialize: () => Promise<void>;
  /** 今日の歩数を取得する */
  fetchTodaySteps: () => Promise<void>;
  /** データを再取得する */
  refresh: () => Promise<void>;
}

// ─── 権限設定 ─────────────────────────────────────────────

const permissions: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.Steps],
    write: [AppleHealthKit.Constants.Permissions.Steps],
  },
};

// ─── ヘルパー関数 ─────────────────────────────────────────

/** 今日の開始時刻（00:00:00）を ISO 文字列で返す */
function getTodayStartDate(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

// ─── カスタムフック ───────────────────────────────────────

/**
 * ヘルスケア（Apple HealthKit）の歩数データを取得するカスタムフック
 *
 * @example
 * ```tsx
 * const { status, todaySteps, initialize, fetchTodaySteps } = useHealthData();
 *
 * useEffect(() => {
 *   initialize();
 * }, []);
 *
 * return <Text>今日の歩数: {todaySteps?.steps ?? '--'}</Text>;
 * ```
 */
export function useHealthData(): UseHealthDataReturn {
  const [status, setStatus] = useState<HealthKitStatus>('idle');
  const [todaySteps, setTodaySteps] = useState<StepData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // iOS 以外では利用不可
  const isAvailable = Platform.OS === 'ios';

  // ── HealthKit 初期化 & 権限リクエスト ──────────────────

  const initialize = useCallback(async (): Promise<void> => {
    if (!isAvailable) {
      setStatus('unavailable');
      setError('HealthKit は iOS でのみ利用可能です');
      return;
    }

    setStatus('initializing');
    setError(null);

    return new Promise<void>((resolve) => {
      AppleHealthKit.initHealthKit(permissions, (err: string) => {
        if (err) {
          console.log('[HealthKit] 権限の取得に失敗しました:', err);
          setStatus('error');
          setError('HealthKit の権限を取得できませんでした');
          resolve();
          return;
        }

        console.log('[HealthKit] 初期化成功');
        setStatus('ready');
        setError(null);
        resolve();
      });
    });
  }, [isAvailable]);

  // ── 今日の歩数を取得 ──────────────────────────────────

  const fetchTodaySteps = useCallback(async (): Promise<void> => {
    if (status !== 'ready') {
      console.log('[HealthKit] 初期化が完了していません。先に initialize() を呼び出してください。');
      return;
    }

    setIsLoading(true);
    setError(null);

    const options = {
      date: getTodayStartDate(),
      includeManuallyAdded: true,
    };

    return new Promise<void>((resolve) => {
      AppleHealthKit.getStepCount(options, (err: string, results: HealthValue) => {
        setIsLoading(false);

        if (err) {
          console.log('[HealthKit] 歩数の取得に失敗しました:', err);
          setError('歩数データの取得に失敗しました');
          resolve();
          return;
        }

        const stepData: StepData = {
          steps: Math.floor(results.value),
          date: new Date().toISOString(),
        };

        console.log('[HealthKit] 今日の歩数:', stepData.steps);
        setTodaySteps(stepData);
        resolve();
      });
    });
  }, [status]);

  // ── リフレッシュ（再取得） ────────────────────────────

  const refresh = useCallback(async (): Promise<void> => {
    if (status !== 'ready') {
      await initialize();
    }
    await fetchTodaySteps();
  }, [status, initialize, fetchTodaySteps]);

  // ── 初期化完了時に自動的に歩数を取得 ─────────────────

  useEffect(() => {
    if (status === 'ready') {
      fetchTodaySteps();
    }
  }, [status, fetchTodaySteps]);

  return {
    status,
    isAvailable,
    todaySteps,
    isLoading,
    error,
    initialize,
    fetchTodaySteps,
    refresh,
  };
}
