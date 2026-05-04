// 메인 미러 타이핑 에디터 화면 (Phase 2)
// - 3가지 모드: mirror / split / fullMirror
// - 폰트 크기 슬라이더 (즉시 영속화)
// - PDF 출력/공유
// - 우상단 ⚙ 설정 버튼으로 SettingsScreen 진입
import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import { fontSize, fonts } from '../theme/typography';
import { printAndShareMirror } from '../utils/print';
import { resolveMirrorColors, useSettings } from '../context/SettingsContext';
import { MirrorView } from '../components/MirrorView';
import { NormalView } from '../components/NormalView';
import { ModeTabs } from '../components/ModeTabs';
import { TopBar } from '../components/TopBar';
import { useNavigator } from '../navigation/AppNavigator';

const PLACEHOLDER = '여기에 타이핑하세요... 거울에 비춰보세요 🪞';

export const HomeScreen: React.FC = () => {
  const { settings, update } = useSettings();
  const { navigate } = useNavigator();
  const [text, setText] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const { bg: mirrorBg, text: mirrorText } = resolveMirrorColors(settings);
  const displayText = text || PLACEHOLDER;

  const handleClear = useCallback(() => setText(''), []);

  const handlePrint = useCallback(async () => {
    if (!text.trim()) {
      Alert.alert('출력할 내용이 없어요', '먼저 텍스트를 입력해 주세요.');
      return;
    }
    try {
      setIsPrinting(true);
      await printAndShareMirror(text, settings.mirrorFontSize);
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      Alert.alert('PDF 출력 실패', message);
    } finally {
      setIsPrinting(false);
    }
  }, [text, settings.mirrorFontSize]);

  // 모드별 디스플레이 영역
  const renderDisplay = () => {
    if (settings.mode === 'split') {
      return (
        <View style={styles.splitWrap}>
          <NormalView
            style={styles.splitChild}
            text={displayText}
            fontSize={settings.mirrorFontSize}
            bgColor={mirrorBg}
            textColor={mirrorText}
            label="NORMAL"
          />
          <View style={styles.splitGap} />
          <MirrorView
            style={styles.splitChild}
            text={displayText}
            fontSize={settings.mirrorFontSize}
            bgColor={mirrorBg}
            textColor={mirrorText}
            label="MIRROR"
          />
        </View>
      );
    }
    // mirror, fullMirror 공통: 상단에 미러 디스플레이
    return (
      <MirrorView
        text={displayText}
        fontSize={settings.mirrorFontSize}
        bgColor={mirrorBg}
        textColor={mirrorText}
        style={styles.singleArea}
      />
    );
  };

  // 완전 미러 모드: 입력창 자체도 좌우 반전
  const inputWrapStyle =
    settings.mode === 'fullMirror' ? [styles.inputWrap, styles.inputWrapMirrored] : styles.inputWrap;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TopBar
        title="Mirror Typing"
        leftLabel="🧠 훈련"
        onLeftPress={() => navigate('training')}
        rightLabel="설정"
        onRightPress={() => navigate('settings')}
      />

      <ModeTabs value={settings.mode} onChange={(mode) => update({ mode })} />

      {renderDisplay()}

      <View style={styles.controlsRow}>
        <Text style={styles.controlLabel}>크기</Text>
        <Slider
          style={styles.slider}
          minimumValue={fontSize.mirrorMin}
          maximumValue={fontSize.mirrorMax}
          step={1}
          value={settings.mirrorFontSize}
          onValueChange={(v) => update({ mirrorFontSize: v })}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.mirrorText}
        />
        <Text style={styles.controlValue}>{settings.mirrorFontSize}px</Text>
      </View>

      <View style={inputWrapStyle}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={PLACEHOLDER}
          placeholderTextColor={colors.mutedText}
          multiline
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleClear}
          style={({ pressed }) => [
            styles.button,
            styles.buttonSecondary,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>지우기</Text>
        </Pressable>
        <Pressable
          onPress={handlePrint}
          disabled={isPrinting}
          style={({ pressed }) => [
            styles.button,
            styles.buttonPrimary,
            pressed && styles.buttonPressed,
            isPrinting && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {isPrinting ? '출력 중...' : 'PDF 출력 / 공유'}
          </Text>
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
  singleArea: {
    marginBottom: 12,
  },
  splitWrap: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 12,
  },
  splitChild: {
    flex: 1,
  },
  splitGap: {
    width: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  controlLabel: {
    color: colors.mutedText,
    fontFamily: fonts.medium,
    fontSize: 12,
    width: 36,
  },
  slider: {
    flex: 1,
    height: 36,
  },
  controlValue: {
    color: colors.normalText,
    fontFamily: fonts.medium,
    fontSize: 12,
    width: 48,
    textAlign: 'right',
  },
  inputWrap: {
    marginBottom: 12,
  },
  inputWrapMirrored: {
    transform: [{ scaleX: -1 }],
  },
  input: {
    minHeight: 96,
    maxHeight: 160,
    backgroundColor: colors.buttonBg,
    color: colors.normalText,
    fontFamily: fonts.regular,
    fontSize: fontSize.input,
    borderRadius: 12,
    padding: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
  },
  buttonSecondary: {
    backgroundColor: colors.buttonBg,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.normalText,
    fontFamily: fonts.medium,
    fontSize: fontSize.button,
    letterSpacing: 0.5,
  },
});
