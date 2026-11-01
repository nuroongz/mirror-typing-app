// 현재 테마에 맞는 팔레트를 반환하는 훅
// - settings.theme 변경 시 자동 재구독
// - 각 화면/컴포넌트는 이 훅으로 palette 를 받아 styles 를 구성
import { useSettings } from '../context/SettingsContext';
import { PALETTES, Palette } from '../theme/colors';

export const useTheme = (): Palette => {
  const { settings } = useSettings();
  return PALETTES[settings.theme];
};
