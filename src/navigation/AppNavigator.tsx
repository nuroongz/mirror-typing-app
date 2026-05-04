// 가벼운 상태 기반 라우터
// - react-navigation 도입은 Phase 3+ 화면이 늘어났을 때 검토
// - Phase 2 시점에는 Onboarding / Home / Settings 3개만 다루므로 컨텍스트로 충분
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../storage/keys';
import { colors } from '../theme/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TrainingScreen } from '../screens/TrainingScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { StatsScreen } from '../screens/StatsScreen';

export type RouteName = 'home' | 'settings' | 'onboarding' | 'training' | 'result' | 'stats';

type NavigatorContextValue = {
  navigate: (route: RouteName) => void;
  completeOnboarding: () => Promise<void>;
  showOnboarding: () => Promise<void>; // 설정에서 다시 보기
};

const NavigatorContext = createContext<NavigatorContextValue | undefined>(undefined);

export const useNavigator = (): NavigatorContextValue => {
  const ctx = useContext(NavigatorContext);
  if (!ctx) throw new Error('useNavigator 는 AppNavigator 내부에서만 사용할 수 있습니다');
  return ctx;
};

export const AppNavigator: React.FC = () => {
  const [route, setRoute] = useState<RouteName | null>(null); // null = 결정 전
  const [fadeAnim] = useState(() => new Animated.Value(1));

  // 최초 진입 시 온보딩 완료 여부 확인
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const done = await AsyncStorage.getItem(STORAGE_KEYS.onboardingComplete);
        if (cancelled) return;
        setRoute(done === 'true' ? 'home' : 'onboarding');
      } catch {
        if (!cancelled) setRoute('onboarding');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 모든 라우트 전환은 fade 300ms 적용
  const navigate = useCallback(
    (next: RouteName) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setRoute(next);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    },
    [fadeAnim],
  );

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingComplete, 'true');
    navigate('home');
  }, [navigate]);

  const showOnboarding = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.onboardingComplete);
    navigate('onboarding');
  }, [navigate]);

  const value = useMemo<NavigatorContextValue>(
    () => ({ navigate, completeOnboarding, showOnboarding }),
    [navigate, completeOnboarding, showOnboarding],
  );

  // 라우트 결정 전: 짧은 로딩
  if (route === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.mirrorText} />
      </View>
    );
  }

  return (
    <NavigatorContext.Provider value={value}>
      <Animated.View style={[styles.fill, { opacity: fadeAnim }]}>
        {route === 'onboarding' && <OnboardingScreen />}
        {route === 'home' && <HomeScreen />}
        {route === 'settings' && <SettingsScreen />}
        {route === 'training' && <TrainingScreen />}
        {route === 'result' && <ResultScreen />}
        {route === 'stats' && <StatsScreen />}
      </Animated.View>
    </NavigatorContext.Provider>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  loading: {
    flex: 1,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
