// 앱 전체에서 사용하는 컬러 팔레트 (라이트 / 다크)
// - 화면에서는 직접 import 하지 말고 useTheme() / useThemedStyles() 로 접근
// - 두 팔레트는 같은 키를 가져야 함 (ThemeColors 타입으로 강제)

export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  // 배경
  primaryBg: string; // 화면 배경
  mirrorBg: string; // 미러 디스플레이 기본(테마 맞춤) 배경
  buttonBg: string; // 카드/보조 버튼/입력창 배경
  // 텍스트
  mirrorText: string; // 강조 텍스트(링크, 값) + 미러 기본(테마 맞춤) 글자색
  normalText: string; // 본문 텍스트
  mutedText: string; // 보조 텍스트
  onAccent: string; // accent 배경 위 텍스트
  onAccentMuted: string; // accent 배경 위 보조 텍스트
  // 강조/상태
  accent: string;
  success: string;
  warning: string;
  // 보더
  border: string;
  // 컨트롤
  switchThumb: string;
};

// 다크 모드: 기존 어두운 테마 값 그대로 유지
export const darkColors: ThemeColors = {
  primaryBg: '#0f0f1a',
  mirrorBg: '#1a1a2e',
  buttonBg: '#2d2d4e',
  mirrorText: '#00d4ff',
  normalText: '#ffffff',
  mutedText: '#8a8aa0',
  onAccent: '#ffffff',
  onAccentMuted: '#e7d8ff',
  accent: '#7b2fff',
  success: '#00ff88',
  warning: '#ffb700',
  border: '#2d2d4e',
  switchThumb: '#ffffff',
};

// 라이트 모드: 흰 배경 + 진한 텍스트 + 밝고 친근한 포인트 컬러
// (본문/보조 텍스트는 흰 배경·카드 배경 모두에서 WCAG AA 4.5:1 이상)
export const lightColors: ThemeColors = {
  primaryBg: '#ffffff',
  mirrorBg: '#f4f0ff', // 연한 라벤더
  buttonBg: '#f3f4fa', // 연회색 카드
  mirrorText: '#6a3df0', // 친근한 보라
  normalText: '#1f2140', // 진한 네이비
  mutedText: '#6b6f85',
  onAccent: '#ffffff',
  onAccentMuted: '#e7d8ff',
  accent: '#7b2fff',
  success: '#0f8a4c',
  warning: '#c2410c',
  border: '#e3e5ef',
  switchThumb: '#ffffff',
};

export const THEME_PALETTES: Record<ThemeMode, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};
