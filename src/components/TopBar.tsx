// 상단바 - 좌측 타이틀, 우측 설정 진입 버튼
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Props = {
  title: string;
  rightLabel?: string;
  onRightPress?: () => void;
  leftLabel?: string;
  onLeftPress?: () => void;
};

export const TopBar: React.FC<Props> = ({
  title,
  rightLabel,
  onRightPress,
  leftLabel,
  onLeftPress,
}) => (
  <View style={styles.bar}>
    <View style={styles.side}>
      {leftLabel ? (
        <Pressable
          onPress={onLeftPress}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnText}>{leftLabel}</Text>
        </Pressable>
      ) : null}
    </View>
    <Text style={styles.title}>{title}</Text>
    <View style={[styles.side, styles.sideRight]}>
      {rightLabel ? (
        <Pressable
          onPress={onRightPress}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnText}>{rightLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  bar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  side: {
    width: 80,
    flexDirection: 'row',
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  title: {
    flex: 1,
    color: colors.normalText,
    fontFamily: fonts.bold,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnPressed: { opacity: 0.6 },
  btnText: {
    color: colors.mirrorText,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
});
