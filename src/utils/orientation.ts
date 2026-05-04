// 화면 방향 잠금 유틸 (expo-screen-orientation)
import * as ScreenOrientation from 'expo-screen-orientation';
import { OrientationLock } from '../context/SettingsContext';

export const applyOrientationLock = async (lock: OrientationLock): Promise<void> => {
  try {
    switch (lock) {
      case 'portrait':
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        return;
      case 'landscape':
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        return;
      case 'auto':
      default:
        await ScreenOrientation.unlockAsync();
        return;
    }
  } catch {
    // 웹/시뮬레이터 미지원 환경에서는 조용히 무시
  }
};
