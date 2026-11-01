// 테마 훅
// - 설정(SettingsContext)의 theme 값으로 현재 팔레트를 결정
// - useThemedStyles(makeStyles): 팔레트가 바뀔 때만 StyleSheet 를 다시 생성
import { useMemo } from 'react';
import { useSettings } from '../context/SettingsContext';
import { THEME_PALETTES, ThemeColors, ThemeMode } from './colors';

export type Theme = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
};

const THEMES: Record<ThemeMode, Theme> = {
  light: { mode: 'light', isDark: false, colors: THEME_PALETTES.light },
  dark: { mode: 'dark', isDark: true, colors: THEME_PALETTES.dark },
};

export const useTheme = (): Theme => {
  const { settings } = useSettings();
  // 손상된 값이 저장되어 있어도 기본(라이트)으로 안전하게 동작
  return THEMES[settings.theme] ?? THEMES.light;
};

export const useThemedStyles = <T>(factory: (c: ThemeColors) => T): T => {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
};
