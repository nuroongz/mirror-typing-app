// 분할 모드용 정상 방향 텍스트 박스 (좌측에 배치)
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

export const NormalView: React.FC<Props> = ({
  text,
  fontSize,
  bgColor,
  textColor,
  label = 'NORMAL',
  style,
}) => (
  <View style={[styles.area, { backgroundColor: bgColor }, style]}>
    <Text style={styles.label}>{label}</Text>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={[styles.text, { color: textColor, fontSize, lineHeight: fontSize * 1.4 }]}
      >
        {text}
      </Text>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  area: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
  },
  label: {
    color: palette.mutedText,
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 8,
  },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  text: { fontFamily: fonts.bold },
});
