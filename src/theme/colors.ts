// 앱 테마 팔레트
// - 라이트/다크 두 테마 지원, 각 테마는 동일한 키 세트를 노출
// - 화면/컴포넌트는 useTheme() 훅으로 현재 팔레트를 받아 사용
export type ThemeName = 'light' | 'dark';

export type Palette = {
  // 배경
  primaryBg: string;        // 화면 전체 바탕
  mirrorBg: string;         // 미러 디스플레이 영역 기본 배경
  buttonBg: string;         // 카드/보조 버튼/입력창 배경
  // 텍스트
  mirrorText: string;       // 강조 색상 (링크/슬라이더/탭 라벨용)
  normalText: string;       // 바탕 위 본문 텍스트
  mutedText: string;        // 보조 라벨/힌트
  onAccent: string;         // accent 배경 위에 올리는 텍스트/아이콘
  onAccentMuted: string;    // accent 배경 위의 보조 텍스트 (ModeTab 힌트 등)
  // 강조/상태
  accent: string;
  success: string;
  warning: string;
  // 보더
  border: string;
};

// 다크 — 기존 팔레트 (Phase 1~4 디자인 그대로)
export const darkPalette: Palette = {
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
};

// 라이트 — 밝고 친근한 톤
export const lightPalette: Palette = {
  primaryBg: '#fafbff',
  mirrorBg: '#f1f3f9',
  buttonBg: '#eef0f8',
  mirrorText: '#4f46e5',
  normalText: '#1f2937',
  mutedText: '#6b7280',
  onAccent: '#ffffff',
  onAccentMuted: '#ede4ff',
  accent: '#7b2fff',
  success: '#10b981',
  warning: '#f59e0b',
  border: '#e5e7eb',
};

export const PALETTES: Record<ThemeName, Palette> = {
  light: lightPalette,
  dark: darkPalette,
};

// 호환용 — 기존 import 처가 많아 유지. 신규 코드는 useTheme() 사용 권장.
export const colors: Palette = lightPalette;
