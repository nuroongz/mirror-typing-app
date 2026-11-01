// 설정 화면
// 테마(라이트/다크), 폰트 크기, 미러 배경/텍스트, 햅틱, 언어, 화면 방향, 훈련 알림,
// 통계/온보딩 다시 보기, 초기화
import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { THEME_PALETTES, ThemeColors, ThemeMode } from '../theme/colors';
import { useTheme, useThemedStyles } from '../theme/useTheme';
import { fontSize as fontSizeTokens, fonts } from '../theme/typography';
import { TopBar } from '../components/TopBar';
import {
  LANGUAGE_OPTIONS,
  Language,
  MIRROR_BG_OPTIONS,
  MIRROR_TEXT_OPTIONS,
  MirrorBgKey,
  MirrorTextKey,
  NOTIFICATION_TIME_PRESETS,
  ORIENTATION_OPTIONS,
  OrientationLock,
  THEME_OPTIONS,
  useSettings,
} from '../context/SettingsContext';
import { useNavigator } from '../navigation/AppNavigator';

// 배경색 위 글자색 결정 (밝은 배경이면 진한 글자)
const isLightColor = (hex: string): boolean => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
};

export const SettingsScreen: React.FC = () => {
  const { settings, update, reset } = useSettings();
  const { navigate, showOnboarding } = useNavigator();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const handleReset = () => {
    Alert.alert('설정 초기화', '모든 설정을 기본값으로 되돌릴까요?', [
      { text: '취소', style: 'cancel' },
      { text: '초기화', style: 'destructive', onPress: reset },
    ]);
  };

  return (
    <View style={styles.root}>
      <TopBar
        title="설정"
        leftLabel="← 뒤로"
        onLeftPress={() => navigate('home')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* 앱 테마 */}
        <Section title="테마">
          <Row label="화면 테마" value={THEME_OPTIONS[settings.theme].label}>
            <View style={styles.themeRow}>
              {(Object.keys(THEME_OPTIONS) as ThemeMode[]).map((k) => {
                const opt = THEME_OPTIONS[k];
                const preview = THEME_PALETTES[k];
                const active = settings.theme === k;
                return (
                  <Pressable
                    key={k}
                    onPress={() => update({ theme: k })}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${opt.label} 모드`}
                    style={({ pressed }) => [
                      styles.themeCard,
                      {
                        backgroundColor: preview.primaryBg,
                        borderColor: active ? colors.accent : colors.border,
                      },
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text style={styles.themeIcon}>{opt.icon}</Text>
                    <Text style={[styles.themeLabel, { color: preview.normalText }]}>
                      {opt.label}
                    </Text>
                    <View style={styles.themePreviewRow}>
                      <View
                        style={[styles.themePreviewBar, { backgroundColor: preview.buttonBg }]}
                      />
                      <View style={[styles.themePreviewDot, { backgroundColor: preview.accent }]} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Row>
        </Section>

        {/* 디스플레이 폰트 크기 */}
        <Section title="디스플레이">
          <Row label="미러 폰트 크기" value={`${settings.mirrorFontSize}px`}>
            <Slider
              style={styles.slider}
              minimumValue={fontSizeTokens.mirrorMin}
              maximumValue={fontSizeTokens.mirrorMax}
              step={1}
              value={settings.mirrorFontSize}
              onValueChange={(v) => update({ mirrorFontSize: v })}
              minimumTrackTintColor={colors.accent}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.mirrorText}
            />
          </Row>

          <Row label="미러 배경색">
            <View style={styles.chipsRow}>
              {(Object.keys(MIRROR_BG_OPTIONS) as MirrorBgKey[]).map((k) => {
                const opt = MIRROR_BG_OPTIONS[k];
                const active = settings.mirrorBg === k;
                const chipBg = opt.color ?? colors.mirrorBg; // 테마 맞춤 → 현재 테마 색
                return (
                  <Pressable
                    key={k}
                    onPress={() => update({ mirrorBg: k })}
                    style={({ pressed }) => [
                      styles.chip,
                      { backgroundColor: chipBg, borderColor: active ? colors.accent : colors.border },
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isLightColor(chipBg) ? '#111111' : '#ffffff' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Row>

          <Row label="미러 텍스트 색상">
            <View style={styles.chipsRow}>
              {(Object.keys(MIRROR_TEXT_OPTIONS) as MirrorTextKey[]).map((k) => {
                const opt = MIRROR_TEXT_OPTIONS[k];
                const active = settings.mirrorText === k;
                return (
                  <Pressable
                    key={k}
                    onPress={() => update({ mirrorText: k })}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: colors.buttonBg,
                        borderColor: active ? colors.accent : colors.border,
                      },
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <View
                      style={[styles.swatch, { backgroundColor: opt.color ?? colors.mirrorText }]}
                    />
                    <Text style={styles.chipText}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Row>
        </Section>

        {/* 인터랙션 */}
        <Section title="인터랙션">
          <Row label="햅틱 피드백">
            <Switch
              value={settings.hapticEnabled}
              onValueChange={(v) => update({ hapticEnabled: v })}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.switchThumb}
            />
          </Row>
        </Section>

        {/* 훈련 언어 */}
        <Section title="훈련">
          <Row label="언어">
            <View style={styles.chipsRow}>
              {(Object.keys(LANGUAGE_OPTIONS) as Language[]).map((k) => {
                const opt = LANGUAGE_OPTIONS[k];
                const active = settings.language === k;
                return (
                  <Pressable
                    key={k}
                    onPress={() => update({ language: k })}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: colors.buttonBg,
                        borderColor: active ? colors.accent : colors.border,
                      },
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text style={styles.chipText}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.subHint}>
              {LANGUAGE_OPTIONS[settings.language].hint}
            </Text>
          </Row>
        </Section>

        {/* 화면 방향 */}
        <Section title="화면">
          <Row label="화면 방향 고정">
            <View style={styles.chipsRow}>
              {(Object.keys(ORIENTATION_OPTIONS) as OrientationLock[]).map((k) => {
                const active = settings.orientationLock === k;
                return (
                  <Pressable
                    key={k}
                    onPress={() => update({ orientationLock: k })}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: colors.buttonBg,
                        borderColor: active ? colors.accent : colors.border,
                      },
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text style={styles.chipText}>{ORIENTATION_OPTIONS[k]}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Row>
        </Section>

        {/* 훈련 알림 */}
        <Section title="알림">
          <Row label="훈련 알림">
            <Switch
              value={settings.notificationEnabled}
              onValueChange={(v) => update({ notificationEnabled: v })}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.switchThumb}
            />
          </Row>
          <Row label="알림 시간" value={settings.notificationTime}>
            <View style={styles.chipsRow}>
              {NOTIFICATION_TIME_PRESETS.map((t) => {
                const active = settings.notificationTime === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => update({ notificationTime: t })}
                    disabled={!settings.notificationEnabled}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: colors.buttonBg,
                        borderColor: active ? colors.accent : colors.border,
                      },
                      pressed && styles.chipPressed,
                      !settings.notificationEnabled && styles.chipDisabled,
                    ]}
                  >
                    <Text style={styles.chipText}>{t}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Row>
        </Section>

        {/* 액션 */}
        <Section title="기타">
          <Pressable
            onPress={() => navigate('stats')}
            style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>📊 통계 보기</Text>
          </Pressable>
          <Pressable
            onPress={showOnboarding}
            style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>온보딩 다시 보기</Text>
          </Pressable>
          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
          >
            <Text style={[styles.actionText, styles.destructive]}>설정 초기화</Text>
          </Pressable>
        </Section>

        <Text style={styles.footnote}>v0.1.0 · Mirror Typing Brain Trainer</Text>
      </ScrollView>
    </View>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
};

const Row: React.FC<{ label: string; value?: string; children: React.ReactNode }> = ({
  label,
  value,
  children,
}) => {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      <View style={styles.rowHead}>
        <Text style={styles.rowLabel}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      <View style={styles.rowBody}>{children}</View>
    </View>
  );
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.mutedText,
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.buttonBg,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowDisabled: {
    opacity: 0.55,
  },
  rowHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    color: colors.normalText,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  rowValue: {
    color: colors.mirrorText,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  rowBody: {
    marginTop: 4,
  },
  rowHint: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 4,
  },
  disabledText: {
    color: colors.mutedText,
  },
  slider: {
    flex: 1,
    height: 36,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
  },
  chipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.normalText,
  },
  subHint: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 6,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  themeCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  themeIcon: {
    fontSize: 20,
  },
  themeLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 4,
  },
  themePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  themePreviewBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  themePreviewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.mutedText, // 흰색 스와치도 밝은 카드 위에서 보이도록
  },
  actionRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  actionText: {
    color: colors.mirrorText,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  destructive: {
    color: colors.warning,
  },
  pressed: {
    opacity: 0.6,
  },
  footnote: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
  },
});
