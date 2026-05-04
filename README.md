# 🪞 Mirror Typing Brain Trainer

타이핑한 텍스트를 실시간으로 좌우 반전(미러링) 하여 보여주는 뇌 훈련용 모바일 앱입니다.
화면을 거울에 비추거나, PDF로 출력해 거울 앞에 두면 정상 글씨로 읽을 수 있습니다.
좌뇌 활성화 · 공간 인지 능력 · 집중력 향상을 목적으로 합니다.

## ✅ 현재 상태 — Phase 2

**Phase 1 (MVP)**
- [x] HomeScreen 미러 타이핑 에디터
- [x] 기본 미러링 동작 (`transform: scaleX(-1)`)
- [x] 폰트 크기 조절 슬라이더 (20 ~ 60 px)
- [x] PDF 출력 / 공유 기능 (`expo-print` + `expo-sharing`)

**Phase 2**
- [x] 3가지 모드 — 미러 / 분할 / 완전미러 (`ModeTabs`)
- [x] 온보딩 3슬라이드 (가로 페이징)
- [x] 설정 화면 — 폰트 크기, 미러 배경/텍스트 색상, 햅틱, 온보딩 다시 보기, 초기화
- [x] AsyncStorage 자동 영속화
- [x] 라우트 fade transition (300ms)

**다음 (Phase 3)**
- [ ] 뇌 훈련 세션 (레벨 1~4 한글 제시어, 30/60초 타이머)
- [ ] 통계 대시보드 (정확도 · WPM · 누적 시간)

## 🛠 기술 스택

- Expo (React Native) — iOS / Android / Web
- TypeScript
- React Native StyleSheet
- expo-print, expo-sharing — PDF 변환 및 공유
- @expo-google-fonts/noto-sans-kr — 한글 폰트
- @react-native-community/slider — 폰트 크기 슬라이더
- @react-native-async-storage/async-storage — 향후 설정 저장용

## 🚀 실행 방법

### 1. 의존성 설치

```bash
npm install
# 또는 Expo 권장 방식:
npx expo install
```

### 2. Expo 개발 서버 시작

```bash
npx expo start
```

QR 코드가 표시되면 모바일에서 **Expo Go** 앱으로 스캔하면 바로 실행됩니다.

- iOS 시뮬레이터: 터미널에서 `i`
- Android 에뮬레이터: 터미널에서 `a`
- 웹 브라우저: 터미널에서 `w`

### 3. 타입 체크

```bash
npm run tsc
```

## 🪞 거울에 비추는 방법 (사용 가이드)

### 방법 A — 화면을 직접 비추기

1. 앱을 실행하고 입력창에 한글/영문을 타이핑합니다.
2. 상단 미러 영역의 글씨가 좌우 반전된 상태로 보입니다.
3. **스마트폰 화면을 작은 손거울 앞**에 들이대 보세요.
4. 거울 속에서는 정상 글씨로 또렷하게 읽힙니다.
5. 폰트 크기 슬라이더로 글씨를 키우면 더 선명하게 보입니다.

### 방법 B — PDF 로 출력해서 사용하기

1. 입력창에 훈련하고 싶은 문장을 입력합니다.
2. 하단의 **`PDF 출력 / 공유`** 버튼을 누릅니다.
3. 생성된 PDF 를 프린터로 인쇄합니다 (A4 권장).
4. 출력물의 **거울 글씨 영역**을 거울 앞에 둡니다.
5. 거울에 비친 글씨를 읽거나, 따라 적으며 훈련합니다.

> 💡 **팁**: 인쇄물이 두꺼울수록 거울 반사 시 글자가 선명합니다.
> 너무 작은 폰트는 거울에서 흐려질 수 있으니 48 px 이상을 권장합니다 (PDF는 자동으로 보장됩니다).

## 🧠 왜 거울 글씨 훈련인가?

- **좌뇌 활성화** — 익숙한 패턴(정상 글씨)을 의도적으로 뒤집어 인지하려 노력하면, 언어와 분석을 담당하는 좌뇌가 강하게 자극됩니다.
- **공간 인지** — 좌우 반전된 시각 정보를 두뇌가 다시 정상 방향으로 매핑하는 과정에서 공간 지각력이 향상됩니다.
- **집중력 / 작업 기억** — 평소보다 느리게 읽고 쓰게 되어 짧은 시간에 깊은 몰입을 유도합니다.

## 📂 폴더 구조

```
mirror-typing-app/
├── App.tsx                  # 진입점, 폰트/스플래시 처리
├── app.json                 # Expo 설정
├── package.json
├── tsconfig.json
├── babel.config.js
├── assets/                  # 아이콘 · 스플래시 (Phase 4 에서 추가)
└── src/
    ├── screens/
    │   ├── HomeScreen.tsx          # 미러 타이핑 에디터 (3모드)
    │   ├── OnboardingScreen.tsx    # 첫 실행 3슬라이드
    │   └── SettingsScreen.tsx      # 설정 (폰트/색상/햅틱/리셋)
    ├── components/
    │   ├── MirrorView.tsx          # 좌우 반전 표시 박스
    │   ├── NormalView.tsx          # 정상 방향 표시 박스 (분할 모드)
    │   ├── ModeTabs.tsx            # 미러/분할/완전미러 탭
    │   └── TopBar.tsx              # 상단바
    ├── context/
    │   └── SettingsContext.tsx     # 전역 설정 + AsyncStorage 영속화
    ├── navigation/
    │   └── AppNavigator.tsx        # 상태 기반 라우터 + fade transition
    ├── storage/
    │   └── keys.ts                 # AsyncStorage 키 모음
    ├── theme/
    │   ├── colors.ts
    │   └── typography.ts
    ├── utils/
    │   └── print.ts                # PDF 출력 유틸
    ├── hooks/                      # (Phase 3+ 에서 사용)
    └── data/                       # 훈련 단어 목록 (Phase 3)
```

## 🎨 컬러 팔레트

| 용도 | HEX |
|---|---|
| Primary BG | `#0f0f1a` |
| Mirror BG | `#1a1a2e` |
| Mirror Text | `#00d4ff` |
| Normal Text | `#ffffff` |
| Accent | `#7b2fff` |
| Success | `#00ff88` |
| Warning | `#ffb700` |
| Button BG | `#2d2d4e` |

## 🗺 로드맵

- **Phase 2** — 분할 모드 / 완전 미러 모드, 온보딩 (3슬라이드), 설정 화면
- **Phase 3** — 뇌 훈련 세션 (레벨 1~4 제시어, 30/60초 타이머), 통계 대시보드
- **Phase 4** — 애니메이션 polish, `expo-keep-awake` 화면 꺼짐 방지, 스토어 배포

## 📜 라이선스

내부 프로토타입 단계 — 별도 명시 시까지 모든 권리 보유 (All Rights Reserved).
