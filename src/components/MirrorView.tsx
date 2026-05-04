// 좌우 반전된 텍스트 박스 (재사용)
// - 자식 텍스트만 반전, 라벨은 다시 한 번 반전해 정상 표시
import React from 'react';
import { ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { fonts } from '../theme/typography';
import { colors as palette } from '../theme/colors';

type Props = {
  text: string;
  fontSize: number;
  bgColor: string;
  textColor: string;
  label?: string;
  style?: ViewStyle;
};

export const MirrorView: React.FC<Props> = ({
  text,
  fontSize,
  bgColor,
  textColor,
  label = 'MIRROR',
  style,
}) => {
  return (
    <View style={[styles.area, { backgroundColor: bgColor }, style]}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.text,
            { color: textColor, fontSize, lineHeight: fontSize * 1.4 },
          ]}
        >
          {text}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    transform: [{ scaleX: -1 }], // 핵심: 영역 전체 좌우 반전
  },
  label: {
    color: palette.mutedText,
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 8,
    transform: [{ scaleX: -1 }], // 라벨은 정상 방향으로 보이도록 다시 반전
  },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  text: { fontFamily: fonts.bold },
});
