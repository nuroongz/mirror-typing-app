// 메인 미러 타이핑 에디터 화면
// - 3가지 모드: mirror / split / fullMirror
// - 폰트 크기 슬라이더 (즉시 영속화)
// - PDF 출력/공유
// - 우상단 설정 버튼
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Palette } from '../theme/colors';
import { fontSize, fonts } from '../theme/typography';
import { printAndShareMirror } from '../utils/print';
import { resolveMirrorColors, useSettings } from '../context/SettingsContext';
import { MirrorView } from '../components/MirrorView';
import { NormalView } from '../components/NormalView';
import { ModeTabs } from '../components/ModeTabs';
import { TopBar } from '../components/TopBar';
import { useNavigator } from '../navigation/AppNavigator';
import { useHaptic } from '../hooks/useHaptic';
import { useTheme } from '../hooks/useTheme';

const PLACEHOLDER = '여기에 타이핑하세요... 거울에 비춰보세요 🪞';

export const HomeScreen: React.FC = () => {
  const { settings, update } = useSettings();
  const { navigate } = useNavigator();
  const haptic = useHaptic();
  const palette = useTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const [text, setText] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const { bg: mirrorBg, text: mirrorText } = resolveMirrorColors(settings);
  const displayText = text || PLACEHOLDER;

  const handleClear = useCallback(() => {
    setText('');
    haptic('light');
  }, [haptic]);

  const handlePrint = useCallback(async () => {
    if (!text.trim()) {
      haptic('warning');
      Alert.alert('출력할 내용이 없어요', '먼저 텍스트를 입력해 주세요.');
      return;
    }
    try {
      setIsPrinting(true);
      haptic('medium');
      await printAndShareMirror(text, settings.mirrorFontSize);
      haptic('success');
    } catch (err) {
      haptic('error');
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      Alert.alert('PDF 출력 실패', message);
    } finally {
      setIsPrinting(false);
    }
  }, [text, settings.mirrorFontSize, haptic]);

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

      <ModeTabs
        value={settings.mode}
        onChange={(mode) => {
          haptic('light');
          update({ mode });
        }}
      />

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
          minimumTrackTintColor={palette.accent}
          maximumTrackTintColor={palette.border}
          thumbTintColor={palette.mirrorText}
        />
        <Text style={styles.controlValue}>{settings.mirrorFontSize}px</Text>
      </View>

      <View style={inputWrapStyle}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={PLACEHOLDER}
          placeholderTextColor={palette.mutedText}
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
          <Text style={styles.buttonSecondaryText}>지우기</Text>
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
          <Text style={styles.buttonPrimaryText}>
            {isPrinting ? '출력 중...' : 'PDF 출력 / 공유'}
          </Text>
        </Pressable>
      </View>
      <Pressable
        onPress={Keyboard.dismiss}
        style={{ flex: 1 }}
        accessible={false}
      />
    </KeyboardAvoidingView>
  );
};

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: palette.primaryBg,
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
      color: palette.mutedText,
      fontFamily: fonts.medium,
      fontSize: 12,
      width: 36,
    },
    slider: {
      flex: 1,
      height: 36,
    },
    controlValue: {
      color: palette.normalText,
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
      backgroundColor: palette.buttonBg,
      color: palette.normalText,
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
      backgroundColor: palette.accent,
    },
    buttonSecondary: {
      backgroundColor: palette.buttonBg,
    },
    buttonPressed: {
      transform: [{ scale: 0.95 }],
      opacity: 0.9,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonPrimaryText: {
      color: palette.onAccent,
      fontFamily: fonts.medium,
      fontSize: fontSize.button,
      letterSpacing: 0.5,
    },
    buttonSecondaryText: {
      color: palette.normalText,
      fontFamily: fonts.medium,
      fontSize: fontSize.button,
      letterSpacing: 0.5,
    },
  });
