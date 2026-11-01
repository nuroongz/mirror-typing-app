// 앱 진입점 - 폰트 로딩, 스플래시 핸들링, 설정/테마/네비게이션 Provider 조립
import React, { useEffect } from 'react';
import { Appearance, Platform, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
} from '@expo-google-fonts/noto-sans-kr';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { SettingsBridge } from './src/context/SettingsBridge';
import { StatsProvider } from './src/context/StatsContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useTheme } from './src/theme/useTheme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // 이미 숨겨졌어도 무시
});

// 테마가 적용된 루트
// - 폰트 + 저장된 설정 로드가 모두 끝날 때까지 스플래시 유지 (테마 깜빡임 방지)
// - 상태바 / 네이티브 UI(Alert, 키보드 등) 색상 모드를 앱 테마와 동기화
const ThemedRoot: React.FC<{ fontsLoaded: boolean }> = ({ fontsLoaded }) => {
  const { hydrated } = useSettings();
  const { mode, isDark, colors } = useTheme();
  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {
        // 이미 숨겨졌어도 무시
      });
    }
  }, [ready]);

  useEffect(() => {
    if (!hydrated || Platform.OS === 'web') return;
    try {
      Appearance.setColorScheme(mode);
    } catch {
      // 미지원 플랫폼/OS 버전은 무시
    }
  }, [hydrated, mode]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.primaryBg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {ready ? (
        <>
          <SettingsBridge />
          <StatsProvider>
            <AppNavigator />
          </StatsProvider>
        </>
      ) : null}
    </SafeAreaView>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
  });

  return (
    <SettingsProvider>
      <ThemedRoot fontsLoaded={fontsLoaded} />
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
