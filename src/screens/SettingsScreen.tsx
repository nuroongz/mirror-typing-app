// 설정 화면
// 활성 섹션: 테마, 디스플레이, 인터랙션, 훈련, 화면, 알림, 기타
import React, { useMemo } from 'react';
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
import { Palette, ThemeName } from '../theme/colors';
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
import { useTheme } from '../hooks/useTheme';
import { useHaptic } from '../hooks/useHaptic';

export const SettingsScreen: React.FC = () => {
  const { settings, update, reset } = useSettings();
  const { navigate, showOnboarding } = useNavigator();
  const palette = useTheme();
  const haptic = useHaptic();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  const handleReset = () => {
    Alert.alert('설정 초기화', '모든 설정을 기본값으로 되돌릴까요?', [
      { text: '취소', style: 'cancel' },
      { text: '초기화', style: 'destructive', onPress: reset },
    ]);
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );

  const Row: React.FC<{
    label: string;
    value?: string;
    children: React.ReactNode;
  }> = ({ label, value, children }) => (
    <View style={styles.row}>
      <View style={styles.rowHead}>
        <Text style={styles.rowLabel}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      <View style={styles.rowBody}>{children}</View>
    </View>
  );

  return (
    <View style={styles.root}>
      <TopBar
        title="설정"
        leftLabel="← 뒤로"
        onLeftPress={() => navigate('home')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* 테마 */}
        <Section title="테마">
          <Row label="앱 테마" value={THEME_OPTIONS[settings.theme]}>
            <View style={styles.chipsRow}>
              {(Object.keys(THEME_OPTIONS) as ThemeName[]).map((k) => {
                const active = settings.theme === k;
                return (
                  <Pressable
                    key={k}
                    onPress={() => {
                      haptic('light');
                      update({ theme: k });
                    }}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: palette.buttonBg,
                        borderColor: active ? palette.accent : palette.border,
                      },
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text style={styles.chipText}>
                      {k === 'light' ? '☀️' : '🌙'} {THEME_OPTIONS[k]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Row>
        </Section>

        {/* 디스플레이 */}
        <Section title="디스플레이">
          <Row label="미러 폰트 크기" value={`${settings.mirrorFontSize}px`}>
            <Slider
              style={styles.slider}
              minimumValue={fontSizeTokens.mirrorMin}
              maximumValue={fontSizeTokens.mirrorMax}
              step={1}
              value={settings.mirrorFontSize}
              onValueChange={(v) => update({ mirrorFontSize: v })}
              minimumTrackTintColor={palette.accent}
              maximumTrackTintColor={palette.border}
              thumbTintColor={palette.mirrorText}
            />
          </Row>

          <Row label="미러 배경색">
            <View style={styles.chipsRow}>
              {(Object.keys(MIRROR_BG_OPTIONS) as MirrorBgKey[]).map((k) => {
                const opt = MIRROR_BG_OPTIONS[k];
                const active = settings.mirrorBg === k;
                return (
                  <Pressable
                    key={k}
                    onPress={() => update({ mirrorBg: k })}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: opt.color,
                        borderColor: active ? palette.accent : palette.border,
                      },
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: opt.color === '#ffffff' ? '#111' : '#fff' },
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
                        backgroundColor: palette.buttonBg,
                        borderColor: active ? palette.accent : palette.border,
                      },
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <View style={[styles.swatch, { backgroundColor: opt.color }]} />
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
              trackColor={{ false: palette.border, true: palette.accent }}
              thumbColor={palette.normalText}
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
                        backgroundColor: palette.buttonBg,
                        borderColor: active ? palette.accent : palette.border,
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
                        backgroundColor: palette.buttonBg,
                        borderColor: active ? palette.accent : palette.border,
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
              trackColor={{ false: palette.border, true: palette.accent }}
              thumbColor={palette.normalText}
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
                        backgroundColor: palette.buttonBg,
                        borderColor: active ? palette.accent : palette.border,
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

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: palette.primaryBg,
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
      color: palette.mutedText,
      fontFamily: fonts.medium,
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: palette.buttonBg,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    row: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.border,
    },
    rowHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rowLabel: {
      color: palette.normalText,
      fontFamily: fonts.medium,
      fontSize: 14,
    },
    rowValue: {
      color: palette.mirrorText,
      fontFamily: fonts.medium,
      fontSize: 13,
    },
    rowBody: {
      marginTop: 4,
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
      color: palette.normalText,
    },
    subHint: {
      color: palette.mutedText,
      fontFamily: fonts.regular,
      fontSize: 11,
      marginTop: 6,
    },
    swatch: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    actionRow: {
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.border,
    },
    actionText: {
      color: palette.mirrorText,
      fontFamily: fonts.medium,
      fontSize: 14,
    },
    destructive: {
      color: palette.warning,
    },
    pressed: {
      opacity: 0.6,
    },
    footnote: {
      color: palette.mutedText,
      fontFamily: fonts.regular,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 16,
    },
  });
