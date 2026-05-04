// 첫 실행 시 보여주는 3슬라이드 온보딩
// - 가로 페이징 ScrollView
// - 하단 페이지 인디케이터 + 다음/시작 버튼
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useNavigator } from '../navigation/AppNavigator';

type Slide = {
  emoji: string;
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    emoji: '🪞',
    title: '거울 글씨 훈련이란?',
    description:
      '입력한 텍스트가 좌우로 반전되어 표시됩니다.\n화면을 거울에 비추면 정상 글씨로 보여요.',
  },
  {
    emoji: '🧠',
    title: '뇌를 깨우는 훈련',
    description: '공간 인지 능력과 집중력을 동시에 향상시킵니다.\n좌뇌가 강하게 자극됩니다.',
  },
  {
    emoji: '🖨️',
    title: '출력해서도 사용하세요',
    description:
      'PDF로 출력 후 거울 앞에서 따라 적어보세요.\n장시간 훈련에 가장 효과적입니다.',
  },
];

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useNavigator();
  const scrollRef = useRef<ScrollView>(null);
  const [width, setWidth] = useState<number>(Dimensions.get('window').width);
  const [page, setPage] = useState<number>(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / Math.max(width, 1));
      if (next !== page) setPage(next);
    },
    [page, width],
  );

  const goNext = useCallback(() => {
    if (page < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true });
    } else {
      completeOnboarding();
    }
  }, [page, width, completeOnboarding]);

  const skip = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  return (
    <View
      style={styles.root}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <View style={styles.skipRow}>
        <Pressable
          onPress={skip}
          style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
        >
          <Text style={styles.skipText}>건너뛰기</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scroll}
      >
        {SLIDES.map((slide, idx) => (
          <View key={idx} style={[styles.slide, { width }]}>
            <Text style={styles.emoji}>{slide.emoji}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((_, idx) => (
          <View
            key={idx}
            style={[styles.dot, idx === page && styles.dotActive]}
          />
        ))}
      </View>

      <Pressable
        onPress={goNext}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <Text style={styles.ctaText}>
          {page < SLIDES.length - 1 ? '다음' : '시작하기'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 0,
    paddingVertical: 16,
  },
  skipRow: {
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: {
    color: colors.mutedText,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  scroll: { flex: 1 },
  slide: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 96,
    marginBottom: 28,
  },
  title: {
    color: colors.normalText,
    fontFamily: fonts.bold,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.buttonBg,
  },
  dotActive: {
    backgroundColor: colors.mirrorText,
    width: 24,
  },
  cta: {
    marginHorizontal: 24,
    marginBottom: 8,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.normalText,
    fontFamily: fonts.medium,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
