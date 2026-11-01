// 앱 진입점 - 폰트 로딩, 스플래시 핸들링, 설정/네비게이션 Provider 조립
import React, { useCallback, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
} from '@expo-google-fonts/noto-sans-kr';
import { lightPalette } from './src/theme/colors';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { SettingsBridge } from './src/context/SettingsBridge';
import { StatsProvider } from './src/context/StatsContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useTheme } from './src/hooks/useTheme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // 이미 숨겨졌어도 무시
});

// SettingsProvider 안에서 테마를 구독해 SafeAreaView/StatusBar 색을 바꾸는 쉘
const ThemedShell: React.FC<{ onLayout: () => void; children: React.ReactNode }> = ({
  onLayout,
  children,
}) => {
  const palette = useTheme();
  const { settings } = useSettings();
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: palette.primaryBg }]}
      onLayout={onLayout}
    >
      <StatusBar style={settings.theme === 'light' ? 'dark' : 'light'} />
      {children}
    </SafeAreaView>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      onLayoutRootView();
    }
  }, [fontsLoaded, onLayoutRootView]);

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  return (
    <SettingsProvider>
      <ThemedShell onLayout={onLayoutRootView}>
        <SettingsBridge />
        <StatsProvider>
          <AppNavigator />
        </StatsProvider>
      </ThemedShell>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  loading: {
    flex: 1,
    // 폰트 로딩 중에는 라이트 테마(기본값) 바탕색 사용
    backgroundColor: lightPalette.primaryBg,
  },
});
