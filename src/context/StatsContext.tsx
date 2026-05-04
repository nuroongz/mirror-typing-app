// 훈련 세션 기록 + 누적 통계 컨텍스트
// - 세션 종료 시 addSession() 호출
// - 최근 50개만 보관 (스토리지 부담 최소화)
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
import { TrainingLevel } from '../data/words';

// 무제한 = 0
export type TimerOption = 0 | 30 | 60;

export type SessionRecord = {
  id: string;
  level: TrainingLevel;
  timer: TimerOption;
  durationMs: number;       // 실제 경과 시간
  totalChars: number;       // 시도된 모든 프롬프트의 글자 수 합
  correctChars: number;     // 정답 글자 수 합
  accuracy: number;         // 0~100 (%)
  cpm: number;              // 분당 정답 글자 수
  wpm: number;              // = cpm / 5 (영문 환산)
  completedPrompts: number; // 완료(=정확히 입력)한 프롬프트 수
  attemptedPrompts: number; // 시도한 프롬프트 수 (skip 포함)
  timestamp: number;
};

const MAX_SESSIONS = 50;

type StatsContextValue = {
  sessions: SessionRecord[];      // 최신 → 과거 순
  lastSession: SessionRecord | null;
  hydrated: boolean;
  addSession: (s: Omit<SessionRecord, 'id' | 'timestamp'>) => SessionRecord;
  clearAll: () => Promise<void>;
};

const StatsContext = createContext<StatsContextValue | undefined>(undefined);

const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [lastSession, setLastSession] = useState<SessionRecord | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // 디스크에서 로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.stats);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as SessionRecord[];
          if (Array.isArray(parsed)) {
            setSessions(parsed);
          }
        }
      } catch {
        // 손상된 데이터는 무시
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 변경 시 저장
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(sessions)).catch(() => {});
  }, [sessions, hydrated]);

  const addSession = useCallback(
    (s: Omit<SessionRecord, 'id' | 'timestamp'>): SessionRecord => {
      const record: SessionRecord = {
        ...s,
        id: generateId(),
        timestamp: Date.now(),
      };
      setSessions((prev) => [record, ...prev].slice(0, MAX_SESSIONS));
      setLastSession(record);
      return record;
    },
    [],
  );

  const clearAll = useCallback(async () => {
    setSessions([]);
    setLastSession(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.stats);
  }, []);

  const value = useMemo<StatsContextValue>(
    () => ({ sessions, lastSession, hydrated, addSession, clearAll }),
    [sessions, lastSession, hydrated, addSession, clearAll],
  );

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
};

export const useStats = (): StatsContextValue => {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error('useStats 는 StatsProvider 내부에서만 사용할 수 있습니다');
  return ctx;
};

// 세션 배열에서 누적 지표 산출
export type Aggregate = {
  totalSessions: number;
  totalDurationMs: number;
  avgAccuracy: number;
  avgCpm: number;
  avgWpm: number;
  totalCompleted: number;
  byLevel: Record<TrainingLevel, number>;
};

export const aggregate = (sessions: ReadonlyArray<SessionRecord>): Aggregate => {
  const base: Aggregate = {
    totalSessions: sessions.length,
    totalDurationMs: 0,
    avgAccuracy: 0,
    avgCpm: 0,
    avgWpm: 0,
    totalCompleted: 0,
    byLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
  };
  if (sessions.length === 0) return base;
  let accSum = 0;
  let cpmSum = 0;
  let wpmSum = 0;
  for (const s of sessions) {
    base.totalDurationMs += s.durationMs;
    accSum += s.accuracy;
    cpmSum += s.cpm;
    wpmSum += s.wpm;
    base.totalCompleted += s.completedPrompts;
    base.byLevel[s.level] += 1;
  }
  base.avgAccuracy = accSum / sessions.length;
  base.avgCpm = cpmSum / sessions.length;
  base.avgWpm = wpmSum / sessions.length;
  return base;
};

// ms → "1분 23초" 같은 표시 문자열
export const formatDuration = (ms: number): string => {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec}초`;
  return `${min}분 ${sec}초`;
};
