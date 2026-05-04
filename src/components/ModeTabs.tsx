// 미러 모드 선택 탭 - 미러 / 분할 / 완전미러
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { MirrorMode } from '../context/SettingsContext';

const TABS: ReadonlyArray<{ key: MirrorMode; label: string; hint: string }> = [
  { key: 'mirror', label: '미러', hint: '입력은 정상' },
  { key: 'split', label: '분할', hint: '정상+미러' },
  { key: 'fullMirror', label: '완전미러', hint: '입력도 반전' },
];

type Props = {
  value: MirrorMode;
  onChange: (mode: MirrorMode) => void;
};

export const ModeTabs: React.FC<Props> = ({ value, onChange }) => {
  return (
    <View style={styles.row}>
      {TABS.map((tab) => {
        const active = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              active && styles.tabActive,
              pressed && styles.tabPressed,
            ]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            <Text style={[styles.hint, active && styles.hintActive]}>{tab.hint}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.buttonBg,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  label: {
    color: colors.normalText,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  labelActive: {
    color: colors.normalText,
  },
  hint: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 10,
    marginTop: 2,
  },
  hintActive: {
    color: '#e7d8ff',
  },
});
