// 설정값을 시스템 사이드이펙트로 반영하는 브리지 컴포넌트
// - orientationLock 변경 시: ScreenOrientation.lockAsync / unlockAsync
// - notificationEnabled / notificationTime 변경 시: schedule / cancel
// - 권한 거부 시: notificationEnabled 를 자동으로 false 로 되돌림
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useSettings } from './SettingsContext';
import { applyOrientationLock } from '../utils/orientation';
import {
  cancelAllTrainingReminders,
  ensureNotificationPermission,
  scheduleDailyTraining,
  setupNotificationChannel,
} from '../utils/notifications';

export const SettingsBridge: React.FC = () => {
  const { settings, hydrated, update } = useSettings();
  const channelReadyRef = useRef<boolean>(false);

  // 화면 방향 잠금 적용
  useEffect(() => {
    if (!hydrated) return;
    applyOrientationLock(settings.orientationLock);
  }, [hydrated, settings.orientationLock]);

  // 알림 채널 1회 셋업
  useEffect(() => {
    if (!hydrated || channelReadyRef.current) return;
    channelReadyRef.current = true;
    setupNotificationChannel().catch(() => {
      // 환경 미지원 시 무시
    });
  }, [hydrated]);

  // 알림 토글 / 시간 변경 반영
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      try {
        if (!settings.notificationEnabled) {
          await cancelAllTrainingReminders();
          return;
        }
        const granted = await ensureNotificationPermission();
        if (cancelled) return;
        if (!granted) {
          // 권한 거부 → 토글 자동 OFF, 안내
          update({ notificationEnabled: false });
          Alert.alert(
            '알림 권한이 필요해요',
            '시스템 설정에서 알림을 허용한 뒤 다시 시도해 주세요.',
          );
          return;
        }
        await scheduleDailyTraining(settings.notificationTime);
      } catch {
        // 환경 미지원 시 조용히 무시
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, settings.notificationEnabled, settings.notificationTime, update]);

  return null;
};
