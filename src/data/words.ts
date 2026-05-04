// 훈련 제시어 데이터 (한국어 / 영어 / 숫자 + 혼합)
// - 각 언어 × 레벨 1~4 = 25개씩
// - getPrompts(language, level) 으로 조회
import { Language } from '../context/SettingsContext';

export type TrainingLevel = 1 | 2 | 3 | 4;

export const LEVEL_LABELS: Record<TrainingLevel, string> = {
  1: '레벨 1 · 한 글자',
  2: '레벨 2 · 단어',
  3: '레벨 3 · 짧은 구',
  4: '레벨 4 · 문장',
};

export const LEVEL_HINTS: Record<TrainingLevel, string> = {
  1: '자모/단음 단위',
  2: '2~3자/짧은 단어',
  3: '4~7자 짧은 표현',
  4: '한 문장 따라쓰기',
};

// ─── 한국어 ───────────────────────────────────────────────
const KO_L1: ReadonlyArray<string> = [
  '가', '나', '다', '라', '마', '바', '사', '아', '자', '차',
  '카', '타', '파', '하', '거', '너', '더', '러', '머', '버',
  '서', '어', '저', '처', '커',
];

const KO_L2: ReadonlyArray<string> = [
  '사과', '하늘', '바다', '나무', '강물', '달빛', '책상', '의자', '시간', '바람',
  '친구', '가족', '학교', '여행', '음악', '영화', '사랑', '행복', '노래', '그림',
  '편지', '봄날', '가을', '겨울', '햇살',
];

const KO_L3: ReadonlyArray<string> = [
  '안녕하세요', '대한민국', '거울훈련', '즐거운하루', '따뜻한차',
  '푸른하늘', '산책길', '가을바람', '봄꽃향기', '새로운시작',
  '작은행복', '마음의평화', '좋은아침', '깊은밤', '별빛하늘',
  '따스한봄날', '시원한바람', '첫눈오는날', '맑은소리', '향긋한꽃',
  '즐거운만남', '평온한오후', '빛나는별', '추억의노래', '한국의봄',
];

const KO_L4: ReadonlyArray<string> = [
  '오늘도 열심히 훈련합니다.',
  '매일 아침 거울을 보며 미소 짓습니다.',
  '작은 노력이 큰 변화를 만듭니다.',
  '천천히 걸어도 멈추지 않으면 됩니다.',
  '책 한 권이 인생을 바꿀 수 있습니다.',
  '좋은 친구는 인생의 가장 큰 선물입니다.',
  '새로운 하루는 새로운 기회입니다.',
  '마음을 비우면 평화가 찾아옵니다.',
  '꿈을 꾸는 사람은 늙지 않습니다.',
  '오늘은 어제보다 조금 더 나아집시다.',
  '따뜻한 말 한마디가 하루를 바꿉니다.',
  '자연 속에서 진정한 휴식을 찾습니다.',
  '음악은 영혼을 치유하는 약입니다.',
  '책상 앞에서 보낸 시간이 미래를 만듭니다.',
  '거울 속의 나에게 미소를 보냅니다.',
  '작은 습관이 큰 사람을 만듭니다.',
  '운동은 마음과 몸을 강하게 합니다.',
  '손글씨로 마음을 전해 봅니다.',
  '산책은 가장 단순한 행복입니다.',
  '별빛 가득한 밤하늘을 바라봅니다.',
  '책을 읽는 시간은 낭비가 아닙니다.',
  '천 리 길도 한 걸음부터 시작됩니다.',
  '노력은 결코 배신하지 않습니다.',
  '오늘도 거울 글씨로 뇌를 깨웁니다.',
  '행복은 멀리 있지 않고 곁에 있습니다.',
];

// ─── 영어 ─────────────────────────────────────────────────
const EN_L1: ReadonlyArray<string> = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
  'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
  'u', 'v', 'w', 'x', 'y',
];

const EN_L2: ReadonlyArray<string> = [
  'cat', 'dog', 'sun', 'sky', 'sea', 'tree', 'star', 'moon', 'book', 'pen',
  'red', 'blue', 'rain', 'wind', 'fire', 'milk', 'fish', 'lake', 'leaf', 'cup',
  'bird', 'door', 'rock', 'ship', 'note',
];

const EN_L3: ReadonlyArray<string> = [
  'hello', 'world', 'mirror', 'brain', 'focus', 'simple', 'happy', 'gentle',
  'fluent', 'winter', 'summer', 'spring', 'autumn', 'morning', 'evening',
  'kindly', 'bright', 'lovely', 'planet', 'motion', 'silver', 'golden',
  'velvet', 'clever', 'wonder',
];

const EN_L4: ReadonlyArray<string> = [
  'The quick brown fox jumps over the lazy dog.',
  'Practice makes a person perfect.',
  'A small step can lead to a big change.',
  'Reading a good book is a treasure.',
  'Time and tide wait for no one.',
  'Slow and steady wins the race.',
  'Every cloud has a silver lining.',
  'Better late than never.',
  'Actions speak louder than words.',
  'Knowledge is power.',
  'Learn something new every day.',
  'The early bird catches the worm.',
  'Where there is a will there is a way.',
  'Be the change you wish to see.',
  'A journey begins with a single step.',
  'Health is the greatest wealth.',
  'Honesty is the best policy.',
  'Patience is a virtue.',
  'Believe in yourself and dream big.',
  'Smile to the mirror every morning.',
  'Small habits build great character.',
  'Music heals the soul.',
  'Friendship is the gift of life.',
  'Today is a brand new day.',
  'Mirror writing wakes up the brain.',
];

// ─── 숫자 ─────────────────────────────────────────────────
const NUM_L1: ReadonlyArray<string> = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '0', '1', '2', '3', '4',
];

const NUM_L2: ReadonlyArray<string> = [
  '12', '34', '56', '78', '90', '11', '22', '33', '44', '55',
  '66', '77', '88', '99', '100', '123', '250', '365', '500', '777',
  '888', '999', '101', '202', '303',
];

const NUM_L3: ReadonlyArray<string> = [
  '1234', '5678', '9012', '1357', '2468', '1010', '2020', '3030',
  '12345', '67890', '11223', '44556', '77889', '100200', '250500',
  '365365', '500500', '777888', '999000', '12321', '45654', '78987',
  '13579', '24680', '99988',
];

const NUM_L4: ReadonlyArray<string> = [
  '010-1234-5678',
  '2024-01-15',
  '123-456-7890',
  '1+2+3+4+5=15',
  '100/4=25',
  '50% off sale',
  '14:30:45',
  '06.08.2024',
  '99.99 points',
  '50,000 won',
  '1,234,567,890',
  '+82-10-1111',
  '36.5 / 37.2',
  '90 of 100',
  '365 days',
  '12/31 23:59',
  '8:00 - 17:00',
  '3.14159265',
  '1024 x 768',
  '2024Q4',
  'No.0001',
  'ID: 9876',
  '1st of May',
  '$199.99',
  '7-Eleven',
];

// ─── 매핑 ─────────────────────────────────────────────────
const LEVELS_BY_LANG: Record<Exclude<Language, 'mix'>, Record<TrainingLevel, ReadonlyArray<string>>> = {
  ko: { 1: KO_L1, 2: KO_L2, 3: KO_L3, 4: KO_L4 },
  en: { 1: EN_L1, 2: EN_L2, 3: EN_L3, 4: EN_L4 },
  num: { 1: NUM_L1, 2: NUM_L2, 3: NUM_L3, 4: NUM_L4 },
};

// 언어/레벨에 맞는 제시어 풀 반환 ('mix' 는 세 언어 합치기)
export const getPrompts = (
  language: Language,
  level: TrainingLevel,
): ReadonlyArray<string> => {
  if (language === 'mix') {
    return [
      ...LEVELS_BY_LANG.ko[level],
      ...LEVELS_BY_LANG.en[level],
      ...LEVELS_BY_LANG.num[level],
    ];
  }
  return LEVELS_BY_LANG[language][level];
};

// Fisher-Yates 셔플 (불변)
export const shuffle = <T,>(arr: ReadonlyArray<T>): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};
