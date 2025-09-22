// 카페 데이터 자동 생성 스크립트
const regions = [
    // 강남구
    { name: "역삼", region: "강남구", phoneStart: "1111" },
    { name: "삼성", region: "강남구", phoneStart: "1112" },
    { name: "신사", region: "강남구", phoneStart: "1113" },
    { name: "압구정", region: "강남구", phoneStart: "1114" },
    { name: "청담", region: "강남구", phoneStart: "1115" },
    
    // 마포구
    { name: "홍대", region: "마포구", phoneStart: "2001" },
    { name: "합정", region: "마포구", phoneStart: "2002" },
    { name: "망원", region: "마포구", phoneStart: "2003" },
    { name: "상수", region: "마포구", phoneStart: "2004" },
    { name: "마포", region: "마포구", phoneStart: "2005" },
    { name: "공덕", region: "마포구", phoneStart: "2006" },
    
    // 영등포구
    { name: "여의도", region: "영등포구", phoneStart: "3001" },
    { name: "영등포", region: "영등포구", phoneStart: "3002" },
    { name: "당산", region: "영등포구", phoneStart: "3003" },
    
    // 종로구
    { name: "종로", region: "종로구", phoneStart: "4001" },
    { name: "광화문", region: "종로구", phoneStart: "4002" },
    { name: "인사동", region: "종로구", phoneStart: "4003" },
    
    // 중구
    { name: "동대문", region: "중구", phoneStart: "5001" },
    { name: "명동", region: "중구", phoneStart: "5002" },
    { name: "충무로", region: "중구", phoneStart: "5003" },
    
    // 용산구
    { name: "용산", region: "용산구", phoneStart: "6001" },
    { name: "이태원", region: "용산구", phoneStart: "6002" },
    { name: "한남", region: "용산구", phoneStart: "6003" },
    
    // 성동구
    { name: "성수", region: "성동구", phoneStart: "7001" },
    { name: "건대입구", region: "성동구", phoneStart: "7002" },
    
    // 성북구
    { name: "성북", region: "성북구", phoneStart: "8001" },
    { name: "고려대", region: "성북구", phoneStart: "8002" },
    
    // 송파구
    { name: "송파", region: "송파구", phoneStart: "9001" },
    { name: "잠실", region: "송파구", phoneStart: "9002" },
    
    // 노원구
    { name: "노원", region: "노원구", phoneStart: "1001" },
    { name: "중계", region: "노원구", phoneStart: "1002" },
    { name: "상계", region: "노원구", phoneStart: "1003" },
    
    // 서대문구
    { name: "신촌", region: "서대문구", phoneStart: "1101" },
    { name: "연희", region: "서대문구", phoneStart: "1102" },
    { name: "이대", region: "서대문구", phoneStart: "1103" },
    { name: "연희동", region: "서대문구", phoneStart: "1104" },
    
    // 양천구
    { name: "목동", region: "양천구", phoneStart: "1201" },
    { name: "신정", region: "양천구", phoneStart: "1202" },
    
    // 강북구
    { name: "수유", region: "강북구", phoneStart: "1301" },
    { name: "쌍문", region: "강북구", phoneStart: "1302" },
    
    // 동대문구
    { name: "청량리", region: "동대문구", phoneStart: "1401" },
    { name: "DDP", region: "동대문구", phoneStart: "1402" },
    
    // 강남구 추가
    { name: "가로수길", region: "강남구", phoneStart: "1501" },
    
    // 중구 추가
    { name: "남대문시장", region: "중구", phoneStart: "1601" },
    { name: "을지로", region: "중구", phoneStart: "1602" },
    
    // 송파구 추가
    { name: "석촌호수", region: "송파구", phoneStart: "1701" },
    
    // 영등포구 추가
    { name: "문래동", region: "영등포구", phoneStart: "1801" },
    
    // 종로구 추가
    { name: "혜화대학로", region: "종로구", phoneStart: "1901" }
];

const cafeCategories = [
    "일반 카페", "디저트 카페", "베이커리 카페", "루프탑 카페", "테마 카페",
    "티룸", "브런치 카페", "스터디 카페", "프리미엄 카페", "24시간 카페",
    "전통 다방", "감성 카페", "드라이브 카페", "테이크아웃 카페", "뷰티플레이스 카페",
    "북카페", "애견 카페", "고양이 카페", "갤러리 카페", "뮤직 카페"
];

const nameSuffixes = ["정원", "향기", "궁전", "고운", "맛나", "정원2", "향기2", "궁전2", "고운2", "맛나2"];

function generateCafeData() {
    let allCafeData = [];
    let currentPart = 1;
    let currentData = [];
    let partCount = 0;
    
    regions.forEach((region, regionIndex) => {
        console.log(`지역 ${region.name} 카페 데이터 생성 중...`);
        
        for (let i = 0; i < 20; i++) {
            const cafe = {
                name: `${region.name}${nameSuffixes[i % nameSuffixes.length]}카페`,
                address: `서울시 ${region.region} ${region.name}동 ${String(i + 1).padStart(3, '0')}-${String(i + 1).padStart(2, '0')}`,
                phone: `02-${region.phoneStart}-${String(i + 1).padStart(4, '0')}`,
                category: cafeCategories[i],
                rating: (4.0 + Math.random() * 0.6).toFixed(1),
                price_range: getPriceRange(cafeCategories[i]),
                description: `${region.name}의 ${getDescription(cafeCategories[i])}입니다.`,
                features: [cafeCategories[i], region.name, "단체석", getPurpose(cafeCategories[i])],
                region: region.region,
                budget: getBudget(cafeCategories[i]),
                people: getPeople(cafeCategories[i]),
                mood: getMood(cafeCategories[i]),
                time: getTime(cafeCategories[i]),
                purpose: getPurpose(cafeCategories[i])
            };
            
            currentData.push(cafe);
            allCafeData.push(cafe);
            
            // 100개씩 나누어서 파일 생성
            if (currentData.length >= 100) {
                const fileName = `cafe_places_part${currentPart}.js`;
                const content = generateFileContent(currentData, currentPart);
                console.log(`${fileName} 생성 완료 - ${currentData.length}개 카페`);
                currentData = [];
                currentPart++;
            }
        }
    });
    
    // 마지막 남은 데이터 처리
    if (currentData.length > 0) {
        const fileName = `cafe_places_part${currentPart}.js`;
        const content = generateFileContent(currentData, currentPart);
        console.log(`${fileName} 생성 완료 - ${currentData.length}개 카페`);
    }
    
    console.log(`총 ${allCafeData.length}개의 카페 데이터 생성 완료!`);
    return allCafeData;
}

function getPriceRange(category) {
    const priceRanges = {
        "일반 카페": "4천원~8천원",
        "디저트 카페": "5천원~9천원",
        "베이커리 카페": "3천원~7천원",
        "루프탑 카페": "6천원~1만원",
        "테마 카페": "4천원~8천원",
        "티룸": "5천원~9천원",
        "브런치 카페": "8천원~1만2천원",
        "스터디 카페": "3천원~7천원",
        "프리미엄 카페": "8천원~1만5천원",
        "24시간 카페": "3천원~7천원",
        "전통 다방": "4천원~8천원",
        "감성 카페": "5천원~9천원",
        "드라이브 카페": "4천원~8천원",
        "테이크아웃 카페": "3천원~7천원",
        "뷰티플레이스 카페": "6천원~1만원",
        "북카페": "4천원~8천원",
        "애견 카페": "5천원~9천원",
        "고양이 카페": "4천원~8천원",
        "갤러리 카페": "6천원~1만원",
        "뮤직 카페": "4천원~8천원"
    };
    return priceRanges[category] || "4천원~8천원";
}

function getDescription(category) {
    const descriptions = {
        "일반 카페": "대표",
        "디저트 카페": "인기",
        "베이커리 카페": "맛있는",
        "루프탑 카페": "고급",
        "테마 카페": "합리적인",
        "티룸": "대표",
        "브런치 카페": "인기",
        "스터디 카페": "맛있는",
        "프리미엄 카페": "고급",
        "24시간 카페": "합리적인",
        "전통 다방": "대표",
        "감성 카페": "인기",
        "드라이브 카페": "맛있는",
        "테이크아웃 카페": "합리적인",
        "뷰티플레이스 카페": "고급",
        "북카페": "대표",
        "애견 카페": "인기",
        "고양이 카페": "맛있는",
        "갤러리 카페": "고급",
        "뮤직 카페": "합리적인"
    };
    return descriptions[category] || "대표";
}

function getBudget(category) {
    const budgets = {
        "프리미엄 카페": "비싼",
        "루프탑 카페": "비싼",
        "뷰티플레이스 카페": "비싼",
        "갤러리 카페": "비싼",
        "브런치 카페": "적당한",
        "일반 카페": "적당한",
        "디저트 카페": "적당한",
        "티룸": "적당한",
        "감성 카페": "적당한",
        "북카페": "적당한",
        "애견 카페": "적당한",
        "고양이 카페": "적당한",
        "뮤직 카페": "적당한",
        "베이커리 카페": "저렴한",
        "스터디 카페": "저렴한",
        "24시간 카페": "저렴한",
        "드라이브 카페": "저렴한",
        "테이크아웃 카페": "저렴한",
        "테마 카페": "저렴한",
        "전통 다방": "저렴한"
    };
    return budgets[category] || "적당한";
}

function getPeople(category) {
    const people = {
        "북카페": "4-5",
        "전통 다방": "4-5",
        "티룸": "4-5",
        "베이커리 카페": "4-5",
        "일반 카페": "3-4",
        "디저트 카페": "2-3",
        "루프탑 카페": "2-3",
        "테마 카페": "3-4",
        "브런치 카페": "2-3",
        "스터디 카페": "3-4",
        "프리미엄 카페": "2-3",
        "24시간 카페": "3-4",
        "감성 카페": "2-3",
        "드라이브 카페": "3-4",
        "테이크아웃 카페": "3-4",
        "뷰티플레이스 카페": "2-3",
        "애견 카페": "2-3",
        "고양이 카페": "3-4",
        "갤러리 카페": "2-3",
        "뮤직 카페": "3-4"
    };
    return people[category] || "3-4";
}

function getMood(category) {
    const moods = {
        "프리미엄 카페": "고급스러운",
        "루프탑 카페": "고급스러운",
        "뷰티플레이스 카페": "고급스러운",
        "갤러리 카페": "고급스러운",
        "디저트 카페": "로맨틱한",
        "브런치 카페": "로맨틱한",
        "감성 카페": "로맨틱한",
        "애견 카페": "로맨틱한",
        "북카페": "편안한",
        "전통 다방": "편안한",
        "티룸": "편안한",
        "베이커리 카페": "편안한",
        "일반 카페": "활발한",
        "테마 카페": "활발한",
        "스터디 카페": "활발한",
        "24시간 카페": "활발한",
        "드라이브 카페": "활발한",
        "테이크아웃 카페": "활발한",
        "고양이 카페": "활발한",
        "뮤직 카페": "활발한"
    };
    return moods[category] || "활발한";
}

function getTime(category) {
    const times = {
        "브런치 카페": "점심",
        "베이커리 카페": "점심",
        "북카페": "점심",
        "전통 다방": "점심",
        "티룸": "점심",
        "일반 카페": "점심",
        "테마 카페": "점심",
        "스터디 카페": "점심",
        "24시간 카페": "점심",
        "드라이브 카페": "점심",
        "테이크아웃 카페": "점심",
        "고양이 카페": "점심",
        "뮤직 카페": "점심",
        "디저트 카페": "저녁",
        "루프탑 카페": "저녁",
        "프리미엄 카페": "저녁",
        "감성 카페": "저녁",
        "뷰티플레이스 카페": "저녁",
        "애견 카페": "저녁",
        "갤러리 카페": "저녁"
    };
    return times[category] || "점심";
}

function getPurpose(category) {
    const purposes = {
        "디저트 카페": "데이트",
        "루프탑 카페": "데이트",
        "브런치 카페": "데이트",
        "프리미엄 카페": "데이트",
        "감성 카페": "데이트",
        "뷰티플레이스 카페": "데이트",
        "애견 카페": "데이트",
        "갤러리 카페": "데이트",
        "북카페": "가족모임",
        "전통 다방": "가족모임",
        "티룸": "가족모임",
        "베이커리 카페": "가족모임",
        "일반 카페": "친구모임",
        "테마 카페": "친구모임",
        "스터디 카페": "친구모임",
        "24시간 카페": "친구모임",
        "드라이브 카페": "친구모임",
        "테이크아웃 카페": "친구모임",
        "고양이 카페": "친구모임",
        "뮤직 카페": "친구모임"
    };
    return purposes[category] || "친구모임";
}

function generateFileContent(data, partNumber) {
    return `// 카페 데이터 Part${partNumber}
const cafePlacesPart${partNumber} = ${JSON.stringify(data, null, 4)};

function addCafePlacesPart${partNumber}() {
    console.log('카페 장소 데이터 Part${partNumber} 로드 중...');
    console.log('총 추가할 카페 수:', cafePlacesPart${partNumber}.length);
}`;
}

// 실행
generateCafeData();
