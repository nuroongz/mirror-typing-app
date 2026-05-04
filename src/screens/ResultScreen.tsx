// 훈련 결과 화면
// - StatsContext.lastSession 을 표시
// - 다시하기 / 통계 보기 / 홈으로
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { TopBar } from '../components/TopBar';
import { useStats, formatDuration } from '../context/StatsContext';
import { useNavigator } from '../navigation/AppNavigator';
import { LEVEL_LABELS } from '../data/words';

export const ResultScreen: React.FC = () => {
  const { lastSession } = useStats();
  const { navigate } = useNavigator();

  if (!lastSession) {
    return (
      <View style={styles.root}>
        <TopBar title="결과" leftLabel="← 홈" onLeftPress={() => navigate('home')} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>아직 완료된 훈련이 없습니다.</Text>
        </View>
      </View>
    );
  }

  const accuracyColor =
    lastSession.accuracy >= 90
      ? colors.success
      : lastSession.accuracy >= 70
        ? colors.warning
        : colors.mirrorText;

  return (
    <View style={styles.root}>
      <TopBar title="훈련 결과" leftLabel="← 홈" onLeftPress={() => navigate('home')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>🎯 수고하셨어요!</Text>
        <Text style={styles.subHeading}>{LEVEL_LABELS[lastSession.level]}</Text>

        <View style={styles.bigCard}>
          <Text style={styles.bigLabel}>정확도</Text>
          <Text style={[styles.bigValue, { color: accuracyColor }]}>
            {lastSession.accuracy.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.gridRow}>
          <Stat label="소요시간" value={formatDuration(lastSession.durationMs)} />
          <Stat label="완료" value={`${lastSession.completedPrompts}개`} />
        </View>
        <View style={styles.gridRow}>
          <Stat label="CPM" value={lastSession.cpm.toFixed(0)} hint="분당 글자" />
          <Stat label="WPM" value={lastSession.wpm.toFixed(1)} hint="환산 단어" />
        </View>
        <View style={styles.gridRow}>
          <Stat label="입력" value={`${lastSession.correctChars}/${lastSession.totalChars}`} />
          <Stat
            label="시도"
            value={`${lastSession.attemptedPrompts}개`}
            hint={lastSession.timer === 0 ? '무제한' : `${lastSession.timer}초 모드`}
          />
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => navigate('training')}
            style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]}
          >
            <Text style={styles.btnText}>다시하기</Text>
          </Pressable>
          <Pressable
            onPress={() => navigate('stats')}
            style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && styles.pressed]}
          >
            <Text style={styles.btnText}>통계 보기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const Stat: React.FC<{ label: string; value: string; hint?: string }> = ({
  label,
  value,
  hint,
}) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
    {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  content: {
    paddingBottom: 40,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  heading: {
    color: colors.normalText,
    fontFamily: fonts.bold,
    fontSize: 24,
    textAlign: 'center',
    marginTop: 16,
  },
  subHeading: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  bigCard: {
    backgroundColor: colors.buttonBg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  bigLabel: {
    color: colors.mutedText,
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  bigValue: {
    fontFamily: fonts.bold,
    fontSize: 56,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.buttonBg,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statLabel: {
    color: colors.mutedText,
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    color: colors.normalText,
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  statHint: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 10,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: colors.accent },
  btnSecondary: { backgroundColor: colors.buttonBg },
  btnText: {
    color: colors.normalText,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
