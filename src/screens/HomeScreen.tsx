// 메인 미러 타이핑 에디터 화면 (Phase 1 MVP)
// - 상단: 좌우 반전된 미러 디스플레이
// - 중앙: 폰트 크기 조절 슬라이더
// - 하단: 멀티라인 입력창 + 액션 버튼(지우기 / PDF 출력)
import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import { fontSize, fonts } from '../theme/typography';
import { printAndShareMirror } from '../utils/print';

const PLACEHOLDER = '여기에 타이핑하세요... 거울에 비춰보세요 🪞';

export const HomeScreen: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [mirrorFontSize, setMirrorFontSize] = useState<number>(fontSize.mirrorDefault);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // 입력 초기화
  const handleClear = useCallback(() => {
    if (!text) return;
    setText('');
  }, [text]);

  // PDF 출력 + 공유
  const handlePrint = useCallback(async () => {
    if (!text.trim()) {
      Alert.alert('출력할 내용이 없어요', '먼저 텍스트를 입력해 주세요.');
      return;
    }
    try {
      setIsPrinting(true);
      await printAndShareMirror(text, mirrorFontSize);
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      Alert.alert('PDF 출력 실패', message);
    } finally {
      setIsPrinting(false);
    }
  }, [text, mirrorFontSize]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 미러 디스플레이 영역 - 전체 View 를 scaleX(-1) 로 좌우 반전 */}
      <View style={styles.mirrorArea}>
        <Text style={styles.mirrorLabel}>MIRROR</Text>
        <ScrollView
          style={styles.mirrorScroll}
          contentContainerStyle={styles.mirrorScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              styles.mirrorText,
              { fontSize: mirrorFontSize, lineHeight: mirrorFontSize * 1.4 },
            ]}
            // 거울 비추기 핵심: 좌우 반전
            // (한 줄짜리 transform 으로 자식 텍스트 전체가 미러링된다)
          >
            {text || PLACEHOLDER}
          </Text>
        </ScrollView>
      </View>

      {/* 폰트 크기 슬라이더 */}
      <View style={styles.controlsRow}>
        <Text style={styles.controlLabel}>크기</Text>
        <Slider
          style={styles.slider}
          minimumValue={fontSize.mirrorMin}
          maximumValue={fontSize.mirrorMax}
          step={1}
          value={mirrorFontSize}
          onValueChange={setMirrorFontSize}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.mirrorText}
        />
        <Text style={styles.controlValue}>{mirrorFontSize}px</Text>
      </View>

      {/* 입력창 */}
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

      {/* 액션 버튼 */}
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
    paddingTop: 12,
    paddingBottom: 16,
  },
  mirrorArea: {
    flex: 1,
    backgroundColor: colors.mirrorBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    transform: [{ scaleX: -1 }], // 핵심: 좌우 반전
  },
  mirrorLabel: {
    color: colors.mutedText,
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 8,
    // 라벨도 함께 뒤집히지 않도록 한번 더 반전
    transform: [{ scaleX: -1 }],
  },
  mirrorScroll: {
    flex: 1,
  },
  mirrorScrollContent: {
    flexGrow: 1,
  },
  mirrorText: {
    color: colors.mirrorText,
    fontFamily: fonts.bold,
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
  input: {
    minHeight: 96,
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
