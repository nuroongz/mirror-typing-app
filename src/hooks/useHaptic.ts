// 햅틱 피드백 훅
// - 설정의 hapticEnabled 가 true 일 때만 동작
// - 실패 시 조용히 무시 (기기 미지원 등)
import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../context/SettingsContext';

export type HapticKind = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const useHaptic = () => {
  const { settings } = useSettings();
  return useCallback(
    async (kind: HapticKind = 'light'): Promise<void> => {
      if (!settings.hapticEnabled) return;
      try {
        switch (kind) {
          case 'light':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            return;
          case 'medium':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return;
          case 'heavy':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            return;
          case 'success':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return;
          case 'warning':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return;
          case 'error':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
      } catch {
        // 햅틱 미지원 환경(웹, 시뮬레이터 등)에서는 무시
      }
    },
    [settings.hapticEnabled],
  );
};
