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
import { colors } from './src/theme/colors';
import { SettingsProvider } from './src/context/SettingsContext';
import { StatsProvider } from './src/context/StatsContext';
import { AppNavigator } from './src/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync().catch(() => {
  // 이미 숨겨졌어도 무시
});

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
    <SafeAreaView style={styles.safe} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <SettingsProvider>
        <StatsProvider>
          <AppNavigator />
        </StatsProvider>
      </SettingsProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.primaryBg,
  },
});
