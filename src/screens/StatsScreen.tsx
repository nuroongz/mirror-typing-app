// 통계 대시보드 화면
// - 누적 지표 + 레벨별 시도 횟수 + 최근 세션 목록
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { TopBar } from '../components/TopBar';
import { aggregate, formatDuration, useStats } from '../context/StatsContext';
import { useNavigator } from '../navigation/AppNavigator';
import { LEVEL_LABELS, TrainingLevel } from '../data/words';

const formatDate = (ts: number): string => {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${m}.${day} ${h}:${min}`;
};

export const StatsScreen: React.FC = () => {
  const { sessions, clearAll } = useStats();
  const { navigate } = useNavigator();
  const agg = aggregate(sessions);

  const handleClear = () => {
    Alert.alert('통계 초기화', '모든 세션 기록을 삭제할까요? 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => clearAll() },
    ]);
  };

  return (
    <View style={styles.root}>
      <TopBar title="통계" leftLabel="← 뒤로" onLeftPress={() => navigate('home')} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* 누적 카드 */}
        <View style={styles.bigGrid}>
          <BigStat label="총 세션" value={`${agg.totalSessions}`} accent />
          <BigStat label="총 시간" value={formatDuration(agg.totalDurationMs)} />
          <BigStat label="평균 정확도" value={`${agg.avgAccuracy.toFixed(1)}%`} />
          <BigStat label="평균 CPM" value={agg.avgCpm.toFixed(0)} />
        </View>

        {/* 레벨별 분포 */}
        <Text style={styles.sectionTitle}>레벨별 시도</Text>
        <View style={styles.card}>
          {([1, 2, 3, 4] as TrainingLevel[]).map((lv) => {
            const count = agg.byLevel[lv];
            const pct = agg.totalSessions > 0 ? (count / agg.totalSessions) * 100 : 0;
            return (
              <View key={lv} style={styles.barRow}>
                <Text style={styles.barLabel}>{LEVEL_LABELS[lv]}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.barCount}>{count}</Text>
              </View>
            );
          })}
        </View>

        {/* 최근 세션 */}
        <Text style={styles.sectionTitle}>최근 세션</Text>
        {sessions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>아직 기록된 세션이 없습니다.</Text>
            <Pressable
              onPress={() => navigate('training')}
              style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}
            >
              <Text style={styles.startBtnText}>지금 시작하기</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            {sessions.slice(0, 20).map((s) => (
              <View key={s.id} style={styles.sessionRow}>
                <View style={styles.sessionHead}>
                  <Text style={styles.sessionTitle}>{LEVEL_LABELS[s.level]}</Text>
                  <Text style={styles.sessionDate}>{formatDate(s.timestamp)}</Text>
                </View>
                <View style={styles.sessionBody}>
                  <Text style={styles.sessionMetric}>
                    정확도{' '}
                    <Text style={styles.sessionStrong}>{s.accuracy.toFixed(0)}%</Text>
                  </Text>
                  <Text style={styles.sessionMetric}>
                    CPM <Text style={styles.sessionStrong}>{s.cpm.toFixed(0)}</Text>
                  </Text>
                  <Text style={styles.sessionMetric}>
                    {formatDuration(s.durationMs)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {sessions.length > 0 ? (
          <Pressable
            onPress={handleClear}
            style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}
          >
            <Text style={styles.clearText}>통계 초기화</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
};

const BigStat: React.FC<{ label: string; value: string; accent?: boolean }> = ({
  label,
  value,
  accent,
}) => (
  <View style={[styles.bigCard, accent && styles.bigCardAccent]}>
    <Text style={styles.bigLabel}>{label}</Text>
    <Text style={[styles.bigValue, accent && { color: colors.mirrorText }]}>{value}</Text>
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
  bigGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  bigCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.buttonBg,
    borderRadius: 14,
    padding: 16,
  },
  bigCardAccent: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  bigLabel: {
    color: colors.mutedText,
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  bigValue: {
    color: colors.normalText,
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  sectionTitle: {
    color: colors.mutedText,
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.buttonBg,
    borderRadius: 14,
    padding: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  barLabel: {
    color: colors.normalText,
    fontFamily: fonts.regular,
    fontSize: 12,
    width: 130,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    backgroundColor: colors.accent,
  },
  barCount: {
    width: 32,
    textAlign: 'right',
    color: colors.mirrorText,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  sessionRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sessionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sessionTitle: {
    color: colors.normalText,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  sessionDate: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  sessionBody: {
    flexDirection: 'row',
    gap: 16,
  },
  sessionMetric: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  sessionStrong: {
    color: colors.normalText,
    fontFamily: fonts.bold,
  },
  emptyCard: {
    backgroundColor: colors.buttonBg,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginBottom: 16,
  },
  startBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  startBtnText: {
    color: colors.normalText,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  clearBtn: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  clearText: {
    color: colors.warning,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
