// 앱 전역 설정 컨텍스트
// - 모드, 폰트 크기, 미러 배경/텍스트 색상, 햅틱 등을 보관
// - AsyncStorage 에 변경 즉시 자동 영속화
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../storage/keys';
import { fontSize as fontSizeTokens } from '../theme/typography';

// 미러 디스플레이 표시 모드
export type MirrorMode = 'mirror' | 'split' | 'fullMirror';

// 훈련 언어
export type Language = 'ko' | 'en' | 'num' | 'mix';
export const LANGUAGE_OPTIONS: Record<Language, { label: string; hint: string }> = {
  ko: { label: '한글', hint: '한국어 단어/문장' },
  en: { label: '영어', hint: 'English words' },
  num: { label: '숫자', hint: '0~9, 날짜/숫자열' },
  mix: { label: '혼합', hint: '세 언어를 무작위로' },
};

// 화면 방향 잠금
export type OrientationLock = 'auto' | 'portrait' | 'landscape';
export const ORIENTATION_OPTIONS: Record<OrientationLock, string> = {
  auto: '자동',
  portrait: '세로',
  landscape: '가로',
};

// 알림 시간 프리셋 (HH:mm)
export const NOTIFICATION_TIME_PRESETS: ReadonlyArray<string> = [
  '08:00',
  '09:00',
  '12:00',
  '18:00',
  '20:00',
  '21:00',
  '22:00',
];

// 미러 배경 옵션 - 키와 실제 컬러 매핑
export const MIRROR_BG_OPTIONS = {
  dark: { label: '딥블루', color: '#1a1a2e' },
  black: { label: '블랙', color: '#000000' },
  light: { label: '화이트', color: '#ffffff' },
} as const;
export type MirrorBgKey = keyof typeof MIRROR_BG_OPTIONS;

// 미러 텍스트 색상 옵션
export const MIRROR_TEXT_OPTIONS = {
  cyan: { label: '시안', color: '#00d4ff' },
  white: { label: '화이트', color: '#ffffff' },
  yellow: { label: '옐로우', color: '#ffb700' },
  black: { label: '블랙', color: '#111111' },
} as const;
export type MirrorTextKey = keyof typeof MIRROR_TEXT_OPTIONS;

// 영속화되는 설정 객체
export type Settings = {
  mode: MirrorMode;
  mirrorFontSize: number;
  mirrorBg: MirrorBgKey;
  mirrorText: MirrorTextKey;
  hapticEnabled: boolean;
  language: Language;
  orientationLock: OrientationLock;
  notificationEnabled: boolean;
  notificationTime: string; // 'HH:mm'
};

const DEFAULT_SETTINGS: Settings = {
  mode: 'mirror',
  mirrorFontSize: fontSizeTokens.mirrorDefault,
  mirrorBg: 'dark',
  mirrorText: 'cyan',
  hapticEnabled: true,
  language: 'ko',
  orientationLock: 'portrait',
  notificationEnabled: false,
  notificationTime: '20:00',
};

type SettingsContextValue = {
  settings: Settings;
  hydrated: boolean; // 디스크에서 불러오기 완료 여부
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // 최초 마운트 시 디스크에서 설정 로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.settings);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as Partial<Settings>;
          // 기본값과 병합해 신규 필드 추가시에도 안전하게 동작
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch {
        // 손상된 데이터는 무시하고 기본값 사용
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 설정이 바뀔 때마다 디스크에 저장
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings)).catch(() => {
      // 저장 실패는 치명적이지 않으므로 조용히 무시
    });
  }, [settings, hydrated]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, hydrated, update, reset }),
    [settings, hydrated, update, reset],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings 는 SettingsProvider 내부에서만 사용할 수 있습니다');
  }
  return ctx;
};

// 헬퍼: 현재 설정의 실제 색상값 추출
export const resolveMirrorColors = (settings: Settings) => ({
  bg: MIRROR_BG_OPTIONS[settings.mirrorBg].color,
  text: MIRROR_TEXT_OPTIONS[settings.mirrorText].color,
});
