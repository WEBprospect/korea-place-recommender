// CARE - Configuration
// API 키 및 설정값들

// 카카오 API 키 (실제 키로 교체 필요)
// 카카오 개발자 콘솔에서 발급받은 REST API 키를 입력하세요
const KAKAO_API_KEY = 'YOUR_ACTUAL_KAKAO_API_KEY_HERE';

// OpenAI API 설정
const CARE_CONFIG = {
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
    OPENAI_ENDPOINT: 'https://api.openai.com/v1/chat/completions'
};

// 앱 설정
const APP_CONFIG = {
    name: 'CARE',
    version: '1.0.1',
    description: 'Customized AI Recommendation Engine',
    maxRecommendations: 6,
    defaultCategory: 'FD6', // 맛집
    searchRadius: 20000 // 20km
};

// 카테고리 코드 매핑
const CATEGORY_CODES = {
    '맛집': 'FD6',
    '음식점': 'FD6',
    '카페': 'CE7',
    '문화시설': 'CT1',
    '관광명소': 'AT4',
    '숙박': 'AD5',
    '대형마트': 'MT1',
    '편의점': 'CS2',
    '병원': 'HP8',
    '약국': 'PM9'
};

// 지역 매핑
const LOCATION_MAPPING = {
    '강남': '강남구',
    '강남구': '강남구',
    '강남역': '강남구',
    '홍대': '홍대',
    '홍익대': '홍대',
    '홍익대학교': '홍대',
    '이태원': '이태원',
    '이태원동': '이태원',
    '신촌': '신촌',
    '신촌역': '신촌',
    '명동': '명동',
    '명동역': '명동',
    '건대': '건대',
    '건국대': '건대',
    '건국대학교': '건대',
    '성수': '성수',
    '성수동': '성수',
    '월곡': '월곡',
    '월곡동': '월곡',
    '신림': '신림',
    '신림동': '신림',
    '잠실': '잠실',
    '잠실동': '잠실',
    '송파': '송파구',
    '송파구': '송파구',
    '마포': '마포구',
    '마포구': '마포구',
    '서초': '서초구',
    '서초구': '서초구',
    '용산': '용산구',
    '용산구': '용산구'
};

// 예산 레벨
const BUDGET_LEVELS = {
    'low': '저렴',
    'medium': '적당',
    'high': '고급',
    'premium': '프리미엄'
};

// 무드/상황
const MOOD_TYPES = {
    'date': '데이트',
    'family': '가족',
    'friends': '친구',
    'alone': '혼자',
    'business': '비즈니스',
    'healing': '힐링'
};

// 시간대
const TIME_PERIODS = {
    'morning': '아침',
    'lunch': '점심',
    'afternoon': '오후',
    'evening': '저녁',
    'dawn': '새벽'
};

// 의도
const INTENT_TYPES = {
    'eat': '식사',
    'drink': '음료',
    'shop': '쇼핑',
    'play': '놀이',
    'rest': '휴식',
    'study': '공부',
    'exercise': '운동'
};
