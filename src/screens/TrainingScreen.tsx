// 뇌 훈련 세션 화면
// - phase 'setup': 레벨/타이머 선택
// - phase 'play': 미러 디스플레이로 제시어 표시 + 입력 + 진행률/시간 표시
// - 세션 종료 시 StatsContext.addSession() 호출 후 ResultScreen 으로 이동
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { colors } from '../theme/colors';
import { fontSize, fonts } from '../theme/typography';
import { TopBar } from '../components/TopBar';
import { MirrorView } from '../components/MirrorView';
import { useNavigator } from '../navigation/AppNavigator';
import { resolveMirrorColors, useSettings } from '../context/SettingsContext';
import {
  LEVEL_HINTS,
  LEVEL_LABELS,
  TrainingLevel,
  WORDS_BY_LEVEL,
  shuffle,
} from '../data/words';
import { TimerOption, useStats } from '../context/StatsContext';
import { useHaptic } from '../hooks/useHaptic';

// 입력값과 정답 사이의 정답 글자 수 (앞에서부터 일치하는 길이)
const correctPrefixLen = (typed: string, target: string): number => {
  const len = Math.min(typed.length, target.length);
  let i = 0;
  while (i < len && typed[i] === target[i]) i++;
  return i;
};

const LEVELS: TrainingLevel[] = [1, 2, 3, 4];
const TIMERS: TimerOption[] = [30, 60, 0]; // 0 = 무제한
const PROMPTS_PER_SESSION_LIMIT = 30;

export const TrainingScreen: React.FC = () => {
  // 훈련 중 화면 꺼짐 방지
  useKeepAwake();

  const { navigate } = useNavigator();
  const { settings } = useSettings();
  const { addSession } = useStats();
  const haptic = useHaptic();
  const { bg: mirrorBg, text: mirrorText } = resolveMirrorColors(settings);

  const [phase, setPhase] = useState<'setup' | 'play'>('setup');
  const [level, setLevel] = useState<TrainingLevel>(2);
  const [timer, setTimer] = useState<TimerOption>(60);

  // play 상태
  const [prompts, setPrompts] = useState<string[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [input, setInput] = useState<string>('');
  const startedAtRef = useRef<number>(0);
  const [now, setNow] = useState<number>(0); // 1초마다 갱신용

  // 누적치
  const totalCharsRef = useRef<number>(0);
  const correctCharsRef = useRef<number>(0);
  const completedRef = useRef<number>(0);
  const attemptedRef = useRef<number>(0);

  // 세션 종료 (정상 / 시간 초과 / 끝내기)
  const finalize = useCallback(() => {
    const durationMs = Math.max(1, Date.now() - startedAtRef.current);
    const accuracy =
      totalCharsRef.current > 0
        ? (correctCharsRef.current / totalCharsRef.current) * 100
        : 0;
    const minutes = durationMs / 60000;
    const cpm = correctCharsRef.current / minutes;
    const wpm = cpm / 5;
    addSession({
      level,
      timer,
      durationMs,
      totalChars: totalCharsRef.current,
      correctChars: correctCharsRef.current,
      accuracy,
      cpm: Number.isFinite(cpm) ? cpm : 0,
      wpm: Number.isFinite(wpm) ? wpm : 0,
      completedPrompts: completedRef.current,
      attemptedPrompts: attemptedRef.current,
    });
    navigate('result');
  }, [addSession, level, timer, navigate]);

  // 1초 단위 타이머 (남은 시간 갱신, 무제한이면 카운트만 올림)
  useEffect(() => {
    if (phase !== 'play') return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [phase]);

  // 시간 만료 감지
  useEffect(() => {
    if (phase !== 'play' || timer === 0) return;
    const elapsed = now - startedAtRef.current;
    if (elapsed >= timer * 1000) {
      finalize();
    }
  }, [now, phase, timer, finalize]);

  const startSession = useCallback(() => {
    const all = WORDS_BY_LEVEL[level];
    const list = shuffle(all).slice(0, PROMPTS_PER_SESSION_LIMIT);
    setPrompts(list);
    setIndex(0);
    setInput('');
    totalCharsRef.current = 0;
    correctCharsRef.current = 0;
    completedRef.current = 0;
    attemptedRef.current = 0;
    startedAtRef.current = Date.now();
    setNow(Date.now());
    setPhase('play');
    haptic('medium');
  }, [level, haptic]);

  // 한 프롬프트 완료/스킵 처리 (햅틱 동반)
  const advance = useCallback(
    (mode: 'completed' | 'skipped') => {
      const target = prompts[index];
      if (!target) return;
      const correct =
        mode === 'completed' ? target.length : correctPrefixLen(input, target);
      totalCharsRef.current += target.length;
      correctCharsRef.current += correct;
      attemptedRef.current += 1;
      if (mode === 'completed') {
        completedRef.current += 1;
        haptic('success');
      } else {
        haptic('warning');
      }

      const next = index + 1;
      if (next >= prompts.length) {
        finalize();
        return;
      }
      setIndex(next);
      setInput('');
    },
    [prompts, index, input, finalize, haptic],
  );

  // 프롬프트 변경 시 fade-in 애니메이션
  const promptFade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (phase !== 'play') return;
    promptFade.setValue(0);
    Animated.timing(promptFade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [phase, index, promptFade]);

  // 입력값이 정답과 정확히 일치하면 자동 다음 프롬프트
  useEffect(() => {
    if (phase !== 'play') return;
    const target = prompts[index];
    if (target && input === target) {
      advance('completed');
    }
  }, [phase, prompts, index, input, advance]);

  // 화면 렌더링 ---
  if (phase === 'setup') {
    return (
      <View style={styles.root}>
        <TopBar title="뇌 훈련 세션" leftLabel="← 뒤로" onLeftPress={() => navigate('home')} />
        <ScrollView contentContainerStyle={styles.setupContent}>
          <Text style={styles.setupHeading}>🧠 훈련 설정</Text>
          <Text style={styles.setupSub}>레벨과 시간을 선택하세요</Text>

          <Text style={styles.sectionTitle}>레벨</Text>
          <View style={styles.optionsCol}>
            {LEVELS.map((lv) => {
              const active = level === lv;
              return (
                <Pressable
                  key={lv}
                  onPress={() => setLevel(lv)}
                  style={({ pressed }) => [
                    styles.levelRow,
                    active && styles.levelRowActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.levelLabel, active && styles.levelLabelActive]}>
                    {LEVEL_LABELS[lv]}
                  </Text>
                  <Text style={styles.levelHint}>{LEVEL_HINTS[lv]}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>시간</Text>
          <View style={styles.optionsRow}>
            {TIMERS.map((t) => {
              const active = timer === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTimer(t)}
                  style={({ pressed }) => [
                    styles.timerChip,
                    active && styles.timerChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.timerLabel, active && styles.timerLabelActive]}>
                    {t === 0 ? '무제한' : `${t}초`}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={startSession}
            style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}
          >
            <Text style={styles.startBtnText}>시작하기</Text>
          </Pressable>

          <Text style={styles.helpText}>
            제시어가 미러 영역에 거꾸로 표시됩니다. 화면을 거울에 비추거나, 머릿속에서 뒤집어
            읽으면서 입력창에 정확히 입력해 보세요.
          </Text>
        </ScrollView>
      </View>
    );
  }

  // play phase
  const target = prompts[index] ?? '';
  const elapsedMs = now - startedAtRef.current;
  const remainingSec = timer === 0 ? null : Math.max(0, Math.ceil(timer - elapsedMs / 1000));
  const correctNow = correctPrefixLen(input, target);
  const liveAccuracy =
    input.length === 0 ? 100 : Math.round((correctNow / input.length) * 100);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TopBar
        title={LEVEL_LABELS[level]}
        leftLabel="끝내기"
        onLeftPress={finalize}
      />

      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>남은시간</Text>
          <Text style={styles.statusValue}>
            {remainingSec === null ? '∞' : `${remainingSec}s`}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>진행</Text>
          <Text style={styles.statusValue}>
            {index + 1} / {prompts.length}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>정확도</Text>
          <Text style={[styles.statusValue, { color: colors.success }]}>{liveAccuracy}%</Text>
        </View>
      </View>

      <Animated.View style={[styles.promptArea, { opacity: promptFade }]}>
        <MirrorView
          text={target}
          fontSize={settings.mirrorFontSize}
          bgColor={mirrorBg}
          textColor={mirrorText}
          label="PROMPT"
        />
      </Animated.View>

      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="제시어를 입력하세요"
        placeholderTextColor={colors.mutedText}
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        autoFocus
        multiline
        textAlignVertical="top"
      />

      <View style={styles.actions}>
        <Pressable
          onPress={() => advance('skipped')}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionSecondary,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionText}>건너뛰기</Text>
        </Pressable>
        <Pressable
          onPress={() => advance(input === target ? 'completed' : 'skipped')}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionPrimary,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionText}>다음</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  // setup
  setupContent: {
    paddingBottom: 40,
  },
  setupHeading: {
    color: colors.normalText,
    fontFamily: fonts.bold,
    fontSize: 22,
    marginTop: 12,
  },
  setupSub: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.mutedText,
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 8,
  },
  optionsCol: {
    gap: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelRow: {
    backgroundColor: colors.buttonBg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelRowActive: {
    borderColor: colors.accent,
  },
  levelLabel: {
    color: colors.normalText,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  levelLabelActive: {
    color: colors.mirrorText,
  },
  levelHint: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  timerChip: {
    flex: 1,
    backgroundColor: colors.buttonBg,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  timerChipActive: {
    borderColor: colors.accent,
  },
  timerLabel: {
    color: colors.normalText,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  timerLabelActive: {
    color: colors.mirrorText,
  },
  startBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  startBtnText: {
    color: colors.normalText,
    fontFamily: fonts.medium,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  helpText: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 24,
  },
  // play
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.buttonBg,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusLabel: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusValue: {
    color: colors.normalText,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginTop: 2,
  },
  promptArea: {
    flex: 1,
    marginBottom: 12,
  },
  input: {
    minHeight: 80,
    maxHeight: 160,
    backgroundColor: colors.buttonBg,
    color: colors.normalText,
    fontFamily: fonts.regular,
    fontSize: fontSize.input,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: {
    backgroundColor: colors.accent,
  },
  actionSecondary: {
    backgroundColor: colors.buttonBg,
  },
  actionText: {
    color: colors.normalText,
    fontFamily: fonts.medium,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});

