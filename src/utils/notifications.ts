// 매일 훈련 알림 스케줄링 유틸 (expo-notifications)
// - foreground 에서도 배너 표시되도록 핸들러 한 번 설정
// - 권한 요청 → Android 채널 셋업 → 매일 반복 알림 등록
// - 토글 OFF / 시간 변경 시에는 모두 취소 후 재등록
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let handlerConfigured = false;

const configureHandlerOnce = (): void => {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

export const setupNotificationChannel = async (): Promise<void> => {
  configureHandlerOnce();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('training-reminder', {
      name: '훈련 알림',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#7b2fff',
    });
  }
};

// 권한 확인 + 미부여 시 요청. true 반환 시 등록 가능 상태
export const ensureNotificationPermission = async (): Promise<boolean> => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
    },
  });
  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
};

// 'HH:mm' → { hour, minute } 변환 (실패 시 20:00)
export const parseTimeString = (hhmm: string): { hour: number; minute: number } => {
  const [h, m] = hhmm.split(':').map((v) => Number.parseInt(v, 10));
  if (Number.isFinite(h) && Number.isFinite(m) && h >= 0 && h < 24 && m >= 0 && m < 60) {
    return { hour: h, minute: m };
  }
  return { hour: 20, minute: 0 };
};

export const cancelAllTrainingReminders = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// 매일 반복 알림 등록 (이전 등록은 모두 취소 후 재등록)
export const scheduleDailyTraining = async (hhmm: string): Promise<void> => {
  await cancelAllTrainingReminders();
  const { hour, minute } = parseTimeString(hhmm);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🪞 거울 글씨 훈련 시간!',
      body: '오늘도 뇌를 깨워볼까요?',
      sound: 'default',
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      channelId: 'training-reminder',
    },
  });
};
