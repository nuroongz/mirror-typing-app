// 앱 전체에서 사용하는 컬러 팔레트
export const colors = {
  // 배경
  primaryBg: '#0f0f1a',
  mirrorBg: '#1a1a2e',
  buttonBg: '#2d2d4e',
  // 텍스트
  mirrorText: '#00d4ff',
  normalText: '#ffffff',
  mutedText: '#8a8aa0',
  // 강조/상태
  accent: '#7b2fff',
  success: '#00ff88',
  warning: '#ffb700',
  // 보더
  border: '#2d2d4e',
} as const;

export type ColorKey = keyof typeof colors;
