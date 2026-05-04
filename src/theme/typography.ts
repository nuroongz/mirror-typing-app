// 타이포그래피 토큰 - Noto Sans KR 패밀리
export const fonts = {
  bold: 'NotoSansKR_700Bold',
  medium: 'NotoSansKR_500Medium',
  regular: 'NotoSansKR_400Regular',
} as const;

// 폰트 크기 기본값 및 범위 (미러 디스플레이용)
export const fontSize = {
  mirrorDefault: 32,
  mirrorMin: 20,
  mirrorMax: 60,
  input: 18,
  button: 14,
} as const;
