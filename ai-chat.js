// CARE 채팅 시스템 - 독립적인 추천 시스템
class CAREChat {
    constructor() {
        this.conversationHistory = [];
        this.map = null;
        this.markers = [];
        this.settingsAsked = false; // 설정 요청 여부 추적
        this.allPlaces = []; // 추천 장소 데이터
        this.currentSearchConditions = {
            category: '',
            budget: '',
            people: '',
            mood: '',
            time: '',
            purpose: ''
        };
        this.currentRegionKeyword = '';
        this.initializeElements();
        this.setupEventListeners();
        this.loadUserPreferences();
        this.loadLearningData();
        this.initializeRecommendationSystem();
        // 맵 초기화 제거됨
    }

    initializeElements() {
        this.chatContainer = document.getElementById('careChatMessages');
        this.messageInput = document.getElementById('careChatInput');
        this.sendButton = document.getElementById('careSendButton');
        this.typingIndicator = document.getElementById('careLoadingIndicator');
        
        // 디버깅을 위한 로그
        console.log('DOM 요소 초기화:');
        console.log('- chatContainer:', this.chatContainer);
        console.log('- messageInput:', this.messageInput);
        console.log('- sendButton:', this.sendButton);
        console.log('- typingIndicator:', this.typingIndicator);
    }

    setupEventListeners() {
        // null 체크 추가
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        } else {
            console.error('sendButton을 찾을 수 없습니다.');
        }
        
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        } else {
            console.error('messageInput을 찾을 수 없습니다.');
        }
    }

    // 맵 초기화 함수 제거됨

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // 사용자 메시지 추가
        this.addMessage('user', message);
        this.messageInput.value = '';
        
        // 전송 버튼 비활성화
        this.setSendButtonState(false);
        
        // 타이핑 인디케이터 표시
        this.showTypingIndicator();
        
        try {
            // 지역 키워드 추출 및 자동 설정
            if (window.setRegionFromChat) {
                window.setRegionFromChat(message);
            }
            
            // 사용자가 "다했다", "완료" 등으로 답변했는지 확인
            if (this.isSettingsCompleteResponse(message)) {
                this.hideTypingIndicator();
                this.addMessage('assistant', '좋습니다! 아래 검색 조건 설정을 이용해서 원하는 장소를 찾아보세요! 카페 또는 맛집을 선택하고 예산, 인원수, 분위기, 시간대, 목적을 설정한 후 \'조건 적용\' 버튼을 눌러주세요.');
                this.settingsAsked = true;
                this.setSendButtonState(true);
                return;
            }
            
            // 장소 추천 요청인지 먼저 확인
            const isRecommendationRequest = this.isRecommendationRequest(message);
            
            if (isRecommendationRequest) {
                // 예산/인원수 설정 확인
                const budget = this.getBudget();
                const people = this.getPeopleCount();
                
                console.log('설정 확인:', { budget, people, isRecommendationRequest, settingsAsked: this.settingsAsked });
                
                // 설정이 안 되어 있고 아직 물어보지 않았을 때만 물어보기
                if ((!budget || people < 1) && !this.settingsAsked) {
                    this.hideTypingIndicator();
                    this.addMessage('assistant', '설정 다하셨으면 아니면 완료하셨으면 원하는 장소/분위기/등등 구체적으로 설명해주세요');
                    this.settingsAsked = true; // 한 번 물어봤다고 표시
                    this.setSendButtonState(true);
                    return;
                }
                
                // 설정이 안 되어 있지만 이미 물어봤으면 기본값으로 진행
                if (!budget || people < 1) {
                    console.log('설정이 안 되어 있지만 이미 물어봤으므로 기본값으로 진행');
                    // 기본값 설정
                    this.setDefaultSettings();
                }
            }
            
            // GPT 응답 받기
            const response = await this.getAIResponse(message);
            
            // 타이핑 인디케이터 숨기기
            this.hideTypingIndicator();
            
            // GPT 응답을 그대로 표시
            console.log('AI 응답:', response);
            this.addMessage('assistant', response);
            
            // 장소 추천 요청인지 확인하고 지도에 표시
            if (isRecommendationRequest) {
                // 설정된 예산과 인원수를 고려한 추천 제공
                const budget = this.getBudget();
                const people = this.getPeopleCount();
                
                // 설정이 완료되었어도 텍스트 추천 대신 검색 조건 안내
                this.hideTypingIndicator();
                const extractedRegion = window.extractRegionFromMessage ? window.extractRegionFromMessage(message) : null;
                if (extractedRegion) {
                    this.addMessage('assistant', `"${extractedRegion}" 지역이 자동으로 선택되었습니다! 이제 카페 또는 맛집을 선택하고 예산, 인원수, 분위기, 시간대, 목적을 설정한 후 '조건 적용' 버튼을 눌러주세요.`);
                } else {
                    this.addMessage('assistant', '아래 검색 조건 설정을 이용해서 원하는 장소를 찾아보세요! 지역을 선택하고 카페 또는 맛집을 선택한 후 예산, 인원수, 분위기, 시간대, 목적을 설정하고 \'조건 적용\' 버튼을 눌러주세요.');
                }
                this.setSendButtonState(true);
                return;
                
            } else {
                // 일반 대화는 그대로 처리
                this.hideTypingIndicator();
                this.addMessage('assistant', response.text);
                this.setSendButtonState(true);
            }
            
        } catch (error) {
            console.error('AI 응답 오류:', error);
            this.hideTypingIndicator();
            
            // 오류 메시지 대신 검색 조건 안내
            this.addMessage('assistant', '아래 검색 조건 설정을 이용해서 원하는 장소를 찾아보세요! 카페 또는 맛집을 선택하고 예산, 인원수, 분위기, 시간대, 목적을 설정한 후 \'조건 적용\' 버튼을 눌러주세요.');
        } finally {
            // 전송 버튼 활성화
            this.setSendButtonState(true);
        }
    }

    async getAIResponse(userMessage) {
        console.log('GPT API 호출 시작:', userMessage);

        const response = await fetch(CARE_CONFIG.OPENAI_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CARE_CONFIG.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: '당신은 친근한 AI 어시스턴트입니다. 사용자가 장소 추천을 요청하면 다음과 같이 응답해주세요:\n\n1. 장소 추천 요청이 들어오면 "아래 검색 조건 설정을 이용해서 원하는 장소를 찾아보세요! 카페 또는 맛집을 선택하고 예산, 인원수, 분위기, 시간대, 목적을 설정한 후 \'조건 적용\' 버튼을 눌러주세요."라고 안내해주세요.\n\n2. 일반적인 대화나 질문에는 친근하게 답변해주세요.\n\n3. 추천 장소는 텍스트로 제공하지 말고 반드시 검색 조건 설정을 사용하도록 안내해주세요.'
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        console.log('API 응답 상태:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API 오류:', errorText);
            throw new Error(`API 호출 실패: ${response.status}`);
        }

        const data = await response.json();
        console.log('API 응답 데이터:', data);
        return data.choices[0].message.content;
    }

    addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const time = new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        if (this.chatContainer) {
            this.chatContainer.appendChild(messageDiv);
            this.scrollToBottom();
        } else {
            console.error('chatContainer를 찾을 수 없습니다!');
        }
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
            this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }

    setSendButtonState(enabled) {
        this.sendButton.disabled = !enabled;
        this.sendButton.style.opacity = enabled ? '1' : '0.5';
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    // 장소 추천 관련 함수들
    checkAndShowRecommendations(userMessage, aiResponse) {
        // 장소 추천 키워드 확인 (더 포괄적으로)
        const recommendationKeywords = [
            '추천', '장소', '카페', '맛집', '식당', '레스토랑', '음식점',
            '어디', '갈까', '가고싶', '보고싶', '데이트', '점심', '저녁',
            '양식', '한식', '중식', '일식', '고기', '스테이크', '파스타',
            '여자친구', '남자친구', '커플', '데이트', '만남',
            '강남', '강북', '서초', '마포', '홍대', '성북', '월곡', '강동', '천호',
            '역', '구', '동', '지역', '밥', '먹', '식사', '대학교', '친구'
        ];
        
        // 사용자 메시지에서 키워드 확인
        const userHasKeyword = recommendationKeywords.some(keyword => 
            userMessage.toLowerCase().includes(keyword)
        );
        
        // AI 응답에서 장소 정보가 있는지 확인
        const hasPlaceInfo = aiResponse.includes('**가게명**') || 
                            aiResponse.includes('**음식 종류**') ||
                            aiResponse.includes('**위치**');
        
        const hasRecommendation = userHasKeyword || hasPlaceInfo;
        
        console.log('추천 키워드 확인:', { 
            userMessage, 
            aiResponse, 
            userHasKeyword, 
            hasPlaceInfo, 
            hasRecommendation 
        });
        
        if (hasRecommendation) {
            console.log('장소 추천 요청 감지, 검색 조건 안내');
            const extractedRegion = window.extractRegionFromMessage ? window.extractRegionFromMessage(userMessage) : null;
            if (extractedRegion) {
                this.addMessage('assistant', `"${extractedRegion}" 지역이 자동으로 선택되었습니다! 이제 카페 또는 맛집을 선택하고 예산, 인원수, 분위기, 시간대, 목적을 설정한 후 '조건 적용' 버튼을 눌러주세요.`);
            } else {
                this.addMessage('assistant', '아래 검색 조건 설정을 이용해서 원하는 장소를 찾아보세요! 지역을 선택하고 카페 또는 맛집을 선택한 후 예산, 인원수, 분위기, 시간대, 목적을 설정하고 \'조건 적용\' 버튼을 눌러주세요.');
            }
        }
    }

    showRecommendations(userMessage, aiResponse) {
        // 지역 추출
        const region = this.extractRegion(userMessage);
        
        // GPT 응답에서 장소 정보 추출 시도
        let recommendations = this.extractPlacesFromGPTResponse(aiResponse, region);
        
        // GPT 응답에서 추출하지 못한 경우 기본 데이터 사용
        if (recommendations.length === 0) {
            console.log('GPT 응답에서 장소 추출 실패, 기본 데이터 사용');
            recommendations = this.getRecommendations(region);
        }
        
        // 추천 장소 표시
        this.displayRecommendations(recommendations);
        
        // 지도에 마커 표시
        this.showPlacesOnMap(recommendations);
    }

    showRecommendationsWithSettings(userMessage, aiResponse, budget, people) {
        // 지역 추출
        const region = this.extractRegion(userMessage);
        
        // GPT 응답에서 장소 정보 추출 시도
        let recommendations = this.extractPlacesFromGPTResponse(aiResponse, region);
        
        // GPT 응답에서 추출하지 못한 경우 기본 데이터 사용
        if (recommendations.length === 0) {
            console.log('GPT 응답에서 장소 추출 실패, 기본 데이터 사용');
            recommendations = this.getRecommendations(region);
        }
        
        // 예산과 인원수에 맞는 장소 필터링
        const filteredRecommendations = this.filterRecommendationsBySettings(recommendations, budget, people);
        
        // 추천 장소 표시
        this.displayRecommendations(filteredRecommendations);
        
        // 지도에 마커 표시
        this.showPlacesOnMap(filteredRecommendations);
    }

    filterRecommendationsBySettings(recommendations, budget, people) {
        // 예산에 맞는 장소 필터링 (간단한 예산 매칭)
        let filtered = recommendations;
        
        if (budget) {
            const budgetNum = this.parseBudget(budget);
            if (budgetNum > 0) {
                filtered = recommendations.filter(place => {
                    const placePrice = this.parsePriceRange(place.price_range);
                    return placePrice <= budgetNum;
                });
            }
        }
        
        // 인원수에 맞는 장소 필터링 (단체석이 있는 장소 우선)
        if (people > 4) {
            filtered = filtered.filter(place => 
                place.features.includes('단체석') || 
                place.features.includes('그룹모임') ||
                place.features.includes('대학생')
            );
        }
        
        return filtered.length > 0 ? filtered : recommendations;
    }

    parseBudget(budget) {
        // 예산 문자열을 숫자로 변환 (예: "2만원" -> 20000)
        const match = budget.match(/(\d+)(만원|천원|원)/);
        if (match) {
            const num = parseInt(match[1]);
            const unit = match[2];
            if (unit === '만원') return num * 10000;
            if (unit === '천원') return num * 1000;
            if (unit === '원') return num;
        }
        return 0;
    }

    parsePriceRange(priceRange) {
        // 가격대 문자열을 숫자로 변환 (예: "1만원~2만원" -> 20000)
        const match = priceRange.match(/(\d+)(만원|천원|원)~(\d+)(만원|천원|원)/);
        if (match) {
            const maxNum = parseInt(match[3]);
            const maxUnit = match[4];
            if (maxUnit === '만원') return maxNum * 10000;
            if (maxUnit === '천원') return maxNum * 1000;
            if (maxUnit === '원') return maxNum;
        }
        return 50000; // 기본값
    }

    extractPlacesFromGPTResponse(aiResponse, region) {
        console.log('GPT 응답에서 장소 정보 추출 시도:', aiResponse);
        
        const places = [];
        
        // GPT 응답에서 장소 정보를 더 정확하게 추출하는 정규식들
        const patterns = [
            // "1. **가게명**: **고궁** - **음식 종류**: 한정식 - **위치**: 강남역" 형태
            /\d+\.\s*\*\*가게명\*\*:\s*\*\*([^*]+)\*\*[^]*?\*\*음식 종류\*\*:\s*([^*]+)[^]*?\*\*위치\*\*:\s*([^*]+)/g,
            // "**가게명**: **고궁** - **음식 종류**: 한정식 - **위치**: 강남역" 형태
            /\*\*가게명\*\*:\s*\*\*([^*]+)\*\*[^]*?\*\*음식 종류\*\*:\s*([^*]+)[^]*?\*\*위치\*\*:\s*([^*]+)/g,
            // "1. **고궁**" 형태 (숫자로 시작하는 리스트)
            /\d+\.\s*\*\*([^*]+)\*\*/g,
            // "**고궁**" 형태 (가게명만)
            /\*\*([^*]+)\*\*/g,
            // 일반적인 장소명 패턴 (한글 + 영문 + 숫자)
            /([가-힣a-zA-Z0-9\s]+(?:카페|맛집|식당|레스토랑|하우스|점|관|집))/g,
            // 번호가 있는 리스트 형태
            /\d+\.\s*([가-힣a-zA-Z0-9\s]+)/g
        ];
        
        // 각 패턴으로 장소명 추출 시도
        for (const pattern of patterns) {
            const matches = [...aiResponse.matchAll(pattern)];
            console.log('패턴 매칭 결과:', matches);
            
            for (const match of matches) {
                const placeName = match[1].trim();
                const foodType = match[2] ? match[2].trim() : '';
                const location = match[3] ? match[3].trim() : '';
                
                if (placeName && placeName.length > 1 && !this.isCommonWord(placeName)) {
                    // 기본 장소 정보 생성
                    const place = this.createPlaceFromName(placeName, region, foodType, location);
                    if (place) {
                        places.push(place);
                    }
                }
            }
            
            if (places.length > 0) break; // 첫 번째 패턴에서 성공하면 중단
        }
        
        // 중복 제거
        const uniquePlaces = places.filter((place, index, self) => 
            index === self.findIndex(p => p.name === place.name)
        );
        
        console.log('추출된 장소들:', uniquePlaces);
        return uniquePlaces;
    }

    isCommonWord(word) {
        // 일반적인 단어들 필터링
        const commonWords = [
            '추천', '장소', '맛집', '식당', '카페', '레스토랑', '음식점',
            '데이트', '점심', '저녁', '식사', '음식', '메뉴', '가격',
            '위치', '주소', '전화', '번호', '평점', '리뷰', '후기',
            '강남', '강북', '서초', '마포', '홍대', '성북', '월곡',
            '역', '구', '동', '지역', '대학교', '친구', '커플'
        ];
        
        return commonWords.some(common => word.includes(common));
    }

    createPlaceFromName(placeName, region, foodType = '', location = '') {
        // 장소명에 따라 기본 정보 생성
        const basePlaces = this.getRecommendations(region);
        
        // 기존 데이터에서 비슷한 이름 찾기
        const similarPlace = basePlaces.find(place => 
            place.name.includes(placeName) || placeName.includes(place.name)
        );
        
        if (similarPlace) {
            return {
                ...similarPlace,
                name: placeName, // GPT에서 추출한 이름 사용
                category: foodType || similarPlace.category,
                address: location ? `서울시 ${region} ${location}` : similarPlace.address
            };
        }
        
        // 새로운 장소 정보 생성
        return {
            name: placeName,
            address: location ? `서울시 ${region} ${location}` : `서울시 ${region} 강남대로 123`,
            phone: "02-0000-0000",
            category: foodType || "맛집",
            rating: 4.0,
            price_range: "1만원~2만원",
            coordinates: { 
                lat: 37.5665 + (Math.random() - 0.5) * 0.01, 
                lng: 126.9780 + (Math.random() - 0.5) * 0.01 
            },
            description: `${placeName}에서 맛있는 ${foodType || '식사'}를 즐길 수 있습니다.`,
            features: ["맛집", "추천"]
        };
    }

    extractRegion(message) {
        const regions = {
            '강남역': '강남구',
            '강남': '강남구',
            '강북': '강북구', 
            '서초': '서초구',
            '마포': '마포구',
            '홍대': '마포구',
            '성북': '성북구',
            '월곡': '성북구',
            '강동': '강동구',
            '천호': '강동구',
            '역삼': '강남구',
            '선릉': '강남구',
            '삼성': '강남구',
            '신사': '강남구',
            '압구정': '강남구',
            '청담': '강남구',
            '도곡': '강남구',
            '대치': '강남구',
            '개포': '강남구',
            '수서': '강남구'
        };
        
        // 메시지를 소문자로 변환하여 검색
        const lowerMessage = message.toLowerCase();
        
        for (const [keyword, region] of Object.entries(regions)) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                console.log(`지역 감지: ${keyword} -> ${region}`);
                return region;
            }
        }
        
        console.log('지역 감지 실패, 기본값 강남구 사용');
        return '강남구'; // 기본값
    }

    getRecommendations(region) {
        const allPlaces = {
            '강남구': [
            {
                name: "고궁",
                address: "서울시 강남구 강남대로 396",
                phone: "02-1234-5678",
                category: "한정식",
                rating: 4.5,
                price_range: "1만5천원~2만5천원",
                coordinates: { lat: 37.4979, lng: 127.0276 },
                description: "전통적이면서도 현대적인 분위기의 한정식 전문점입니다. 대학생 그룹 식사에 적합한 코스 메뉴를 제공합니다.",
                features: ["한정식", "단체석", "대학생", "전통음식"]
            },
            {
                name: "미스터서왕만두",
                address: "서울시 강남구 강남대로 420",
                phone: "02-2345-6789",
                category: "중식",
                rating: 4.3,
                price_range: "8천원~1만5천원",
                coordinates: { lat: 37.4989, lng: 127.0286 },
                description: "신선한 만두와 중식 요리를 맛볼 수 있는 곳입니다. 대학생들이 자주 찾는 인기 맛집입니다.",
                features: ["만두", "중식", "대학생", "저렴"]
            },
            {
                name: "스타벅스 강남점",
                address: "서울시 강남구 테헤란로 123",
                phone: "02-3456-7890",
                category: "카페",
                rating: 4.5,
                price_range: "1만원~2만원",
                coordinates: { lat: 37.5665, lng: 126.9780 },
                description: "조용하고 아늑한 분위기의 카페입니다. 공부하거나 대화하기 좋은 환경을 제공합니다.",
                features: ["WiFi", "주차장", "단체석", "공부"]
            },
            {
                name: "투썸플레이스 강남역점",
                address: "서울시 강남구 강남대로 456",
                phone: "02-4567-8901",
                category: "카페",
                rating: 4.3,
                price_range: "1만원~2만원",
                coordinates: { lat: 37.5675, lng: 126.9790 },
                description: "넓은 공간에 편안하게 앉을 수 있는 카페입니다. 그룹 모임에 적합합니다.",
                features: ["WiFi", "주차장", "단체석", "그룹모임"]
            },
            {
                name: "아웃백 스테이크하우스 강남점",
                address: "서울시 강남구 강남대로 396",
                phone: "02-5678-9012",
                category: "양식",
                rating: 4.4,
                price_range: "2만원~4만원",
                coordinates: { lat: 37.5685, lng: 126.9800 },
                description: "데이트하기 좋은 로맨틱한 분위기의 스테이크하우스입니다. 특별한 날에 추천합니다.",
                features: ["데이트", "스테이크", "로맨틱", "주차장"]
            },
            {
                name: "빕스 강남점",
                address: "서울시 강남구 테헤란로 152",
                phone: "02-6789-0123",
                category: "양식",
                rating: 4.2,
                price_range: "1만5천원~3만원",
                coordinates: { lat: 37.5695, lng: 126.9810 },
                description: "다양한 양식 요리를 즐길 수 있는 뷔페 레스토랑입니다. 그룹 식사에 최적화되어 있습니다.",
                features: ["뷔페", "다양한 메뉴", "단체석", "주차장"]
            },
            {
                name: "올리브가든 강남역점",
                address: "서울시 강남구 강남대로 420",
                phone: "02-7890-1234",
                category: "양식",
                rating: 4.1,
                price_range: "1만원~2만5천원",
                coordinates: { lat: 37.5705, lng: 126.9820 },
                description: "이탈리안 파스타와 피자를 전문으로 하는 레스토랑입니다. 친구들과 함께 즐기기 좋습니다.",
                features: ["파스타", "피자", "이탈리안", "데이트"]
            },
            {
                name: "양평 해장국 강남점",
                address: "서울시 강남구 강남대로 350",
                phone: "02-8901-2345",
                category: "한식",
                rating: 4.3,
                price_range: "8천원~1만2천원",
                coordinates: { lat: 37.5715, lng: 126.9830 },
                description: "대학생들에게 인기 있는 해장국 전문점입니다. 든든하고 맛있는 한끼 식사를 즐길 수 있어요.",
                features: ["해장국", "공깃밥", "대학생", "저렴"]
            },
            {
                name: "오매 한정식",
                address: "서울시 강남구 테헤란로 180",
                phone: "02-9012-3456",
                category: "한식",
                rating: 4.2,
                price_range: "1만원~1만5천원",
                coordinates: { lat: 37.5725, lng: 126.9840 },
                description: "다양한 한정식을 맛볼 수 있는 곳으로 대학생 그룹 식사에 적합합니다.",
                features: ["한정식", "단체석", "대학생", "다양한 메뉴"]
            },
            {
                name: "맘스터치 강남점",
                address: "서울시 강남구 강남대로 500",
                phone: "02-0123-4567",
                category: "패스트푸드",
                rating: 4.0,
                price_range: "5천원~1만원",
                coordinates: { lat: 37.5735, lng: 126.9850 },
                description: "대학생들이 자주 찾는 패스트푸드점입니다. 빠르고 맛있는 식사를 원할 때 좋습니다.",
                features: ["패스트푸드", "대학생", "저렴", "빠른서비스"]
            }
            ],
            '강북구': [
                {
                    name: "카페 드림",
                    address: "서울시 강북구 수유동 123-45",
                    phone: "02-1234-5678",
                category: "카페",
                    rating: 4.5,
                price_range: "4천원~7천원",
                    coordinates: { lat: 37.6380, lng: 127.0251 },
                    description: "아늑한 분위기와 다양한 디저트를 즐길 수 있는 카페입니다.",
                    features: ["WiFi", "주차장", "디저트"]
                },
                {
                    name: "커피 리브레",
                    address: "서울시 강북구 미아동 67-89",
                    phone: "02-2345-6789",
                category: "카페",
                    rating: 4.3,
                    price_range: "3천원~6천원",
                    coordinates: { lat: 37.6260, lng: 127.0250 },
                    description: "신선한 원두로 내린 커피가 유명한 조용한 카페입니다.",
                    features: ["WiFi", "원두커피", "조용한 분위기"]
                }
            ]
        };
        
        return allPlaces[region] || allPlaces['강남구'];
    }

    displayRecommendations(recommendations) {
        console.log('displayRecommendations 호출:', recommendations);
        
        // 추천 장소 컨테이너 표시
        const sidebar = document.getElementById('placesContainer');
        console.log('placesContainer 찾음:', sidebar);
        if (!sidebar) {
            console.error('placesContainer를 찾을 수 없습니다!');
            return;
        }
        
        // 기존 내용 지우기
        sidebar.innerHTML = '';
        
        // 컨테이너 표시
        sidebar.style.display = 'block';
        console.log('placesContainer 표시됨');

        // 지도 컨테이너 표시
        const mapContainer = document.getElementById('mapContainer');
        console.log('mapContainer 찾음:', mapContainer);
        if (mapContainer) {
            mapContainer.style.display = 'block';
            console.log('mapContainer 표시됨');
        } else {
            console.error('mapContainer를 찾을 수 없습니다!');
        }
        
        // 기본 메시지 숨기기
        const noRecommendations = document.getElementById('noRecommendations');
        if (noRecommendations) {
            noRecommendations.style.display = 'none';
        }
        
        // 초기화 버튼 표시
        const clearBtn = document.querySelector('.clear-recommendations-btn');
        if (clearBtn) {
            clearBtn.style.display = 'block';
        }
        
        console.log('추천 장소 개수:', recommendations.length);
        
        recommendations.forEach((place, index) => {
            console.log(`장소 ${index + 1} 추가 중:`, place.name);
            
            const placeElement = document.createElement('div');
            placeElement.className = 'place-card';
            placeElement.innerHTML = `
                <div class="place-header">
                    <h4 class="place-name">${place.name}</h4>
                    <div class="place-category">${place.category}</div>
                </div>
                <div class="place-info">
                    <p class="place-address">📍 ${place.address}</p>
                    <p class="place-phone">📞 ${place.phone}</p>
                    <p class="place-description">${place.description}</p>
                    <div class="place-details">
                        <div class="place-rating">⭐ ${place.rating}</div>
                        <div class="place-price">💰 ${place.price_range}</div>
                    </div>
                    <div class="place-features">
                        ${place.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                    </div>
                    <div class="place-actions">
                        <button class="place-action-btn" onclick="careChat.centerMapOnPlace(${JSON.stringify(place.coordinates).replace(/"/g, '&quot;')})">
                            <i class="fas fa-map-marker-alt"></i> 지도에서 보기
                        </button>
                        <button class="place-action-btn" onclick="careChat.showPlaceDetails('${place.name}')">
                            <i class="fas fa-info-circle"></i> 상세정보
                        </button>
                    </div>
                </div>
            `;
            
            // 클릭 시 지도 중심 이동
            placeElement.addEventListener('click', (e) => {
                // 버튼 클릭이 아닌 경우에만 지도 중심 이동
                if (!e.target.closest('.place-action-btn')) {
                    this.centerMapOnPlace(place.coordinates);
                }
            });
            
            sidebar.appendChild(placeElement);
            console.log(`장소 ${index + 1} 추가 완료:`, place.name);
        });
        
        console.log('모든 추천 장소 추가 완료');
    }

    // 맵 기능 제거됨 - 추천 장소만 카드 형태로 표시

    // 맵 관련 함수 제거됨

    // 맵 관련 함수 제거됨

    // 맵 관련 함수 제거됨

    // 예산/인원수 설정 관련 함수들
    isRecommendationRequest(message) {
        const recommendationKeywords = [
            '추천', '장소', '카페', '맛집', '식당', '레스토랑', '음식점',
            '어디', '갈까', '가고싶', '보고싶', '데이트', '점심', '저녁',
            '양식', '한식', '중식', '일식', '고기', '스테이크', '파스타',
            '여자친구', '남자친구', '커플', '데이트', '만남',
            '강남', '강북', '서초', '마포', '홍대', '성북', '월곡', '강동', '천호',
            '역', '구', '동', '지역', '밥', '먹', '식사', '대학교', '친구'
        ];
        
        return recommendationKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );
    }

    isSettingsCompleteResponse(message) {
        const completeKeywords = [
            '다했다', '완료', '끝', '설정완료', '완료했다', '다했어', '끝났어',
            'ok', 'okay', '좋아', '네', '응', '그래', '알겠어', '알겠습니다'
        ];
        
        return completeKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );
    }

    getBudget() {
        const budgetText = document.getElementById('budgetText');
        if (!budgetText) return null;
        
        const budget = budgetText.textContent.trim();
        if (budget === '예산 설정' || budget === '') return null;
        
        return budget;
    }

    getPeopleCount() {
        const peopleText = document.getElementById('peopleText');
        if (!peopleText) return 0;
        
        const people = parseInt(peopleText.textContent);
        return isNaN(people) ? 0 : people;
    }

    setDefaultSettings() {
        // 기본값으로 설정 (2만원, 2명)
        const budgetText = document.getElementById('budgetText');
        const peopleText = document.getElementById('peopleText');
        
        if (budgetText && budgetText.textContent === '예산 설정') {
            budgetText.textContent = '2만원';
        }
        
        if (peopleText && peopleText.textContent === '0명') {
            peopleText.textContent = '2명';
        }
    }

    showPlaceDetails(placeName) {
        // 현재 표시된 장소들에서 해당 장소 찾기
        const placeCards = document.querySelectorAll('.place-card');
        let targetPlace = null;
        
        placeCards.forEach(card => {
            const nameElement = card.querySelector('.place-name');
            if (nameElement && nameElement.textContent.includes(placeName)) {
                // 장소 정보 추출
                const address = card.querySelector('.place-address')?.textContent.replace('📍 ', '') || '';
                const phone = card.querySelector('.place-phone')?.textContent.replace('📞 ', '') || '';
                const description = card.querySelector('.place-description')?.textContent || '';
                const rating = card.querySelector('.place-rating')?.textContent.replace('⭐ ', '') || '';
                const price = card.querySelector('.place-price')?.textContent.replace('💰 ', '') || '';
                const category = card.querySelector('.place-category')?.textContent || '';
                
                targetPlace = {
                    name: placeName,
                    address,
                    phone,
                    description,
                    rating,
                    price,
                    category
                };
            }
        });
        
        if (targetPlace) {
            this.showPlaceModal(targetPlace);
        }
    }

    showPlaceModal(place) {
        // 모달 생성
        const modal = document.createElement('div');
        modal.className = 'place-modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="place-modal-content">
                <span class="place-modal-close" onclick="this.closest('.place-modal').remove()">&times;</span>
                <div class="place-modal-header">
                    <h2>${place.name}</h2>
                    <div class="place-category">${place.category}</div>
                </div>
                <div class="place-modal-body">
                    <div class="place-info-section">
                        <h3>📍 위치</h3>
                        <p>${place.address}</p>
                    </div>
                    <div class="place-info-section">
                        <h3>📞 연락처</h3>
                        <p>${place.phone}</p>
                    </div>
                    <div class="place-info-section">
                        <h3>⭐ 평점</h3>
                        <p>${place.rating}</p>
                    </div>
                    <div class="place-info-section">
                        <h3>💰 가격대</h3>
                        <p>${place.price}</p>
                    </div>
                    <div class="place-info-section">
                        <h3>📝 설명</h3>
                        <p>${place.description}</p>
                    </div>
                </div>
                <div class="place-modal-footer">
                    <button class="place-action-btn" onclick="careChat.centerMapOnPlace(${JSON.stringify(place.coordinates || {lat: 37.5665, lng: 126.9780}).replace(/"/g, '&quot;')})">
                        <i class="fas fa-map-marker-alt"></i> 지도에서 보기
                    </button>
                    <button class="place-action-btn" onclick="this.closest('.place-modal').remove()">
                        <i class="fas fa-times"></i> 닫기
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 모달 외부 클릭 시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 검색 조건을 추천에 적용하는 함수
    applySearchConditionsToRecommendations() {
        if (!window.currentSearchConditions) return;
        
        console.log('검색 조건을 추천에 적용:', window.currentSearchConditions);
        
        // 현재 표시된 추천 장소들을 가져와서 필터링
        const recommendationsPanel = document.getElementById('recommendationsPanel');
        if (!recommendationsPanel) return;
        
        // 검색 조건에 맞는 추천 생성
        if (window.generateRecommendationsFromConditions) {
            window.generateRecommendationsFromConditions();
        }
    }

    // 기본 메서드들 (빈 구현)
    loadUserPreferences() {}
    saveUserPreferences() {}
    loadLearningData() {}
    saveLearningData() {}
    recordSuccessfulRecommendation() {}
    collectUserFeedback() {}
}

// 예산 설정 관련 전역 함수들
let budgetEditing = false;

function editBudget() {
    const budgetFilter = document.getElementById('budgetFilter');
    const budgetText = document.getElementById('budgetText');
    
    if (budgetEditing) {
        // 저장 모드
        const input = budgetFilter.querySelector('input');
        if (input && input.value.trim()) {
            budgetText.textContent = input.value.trim();
            budgetFilter.classList.remove('editing');
            budgetFilter.innerHTML = `
                <i class="fas fa-won-sign"></i>
                <span id="budgetText">${input.value.trim()}</span>
            `;
            budgetEditing = false;
        }
    } else {
        // 편집 모드
        budgetFilter.classList.add('editing');
        const currentValue = budgetText.textContent === '예산 설정' ? '' : budgetText.textContent;
        budgetFilter.innerHTML = `
            <i class="fas fa-won-sign"></i>
            <input type="text" class="budget-input" placeholder="예: 2만원" value="${currentValue}">
        `;
        
        const input = budgetFilter.querySelector('input');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                editBudget(); // 저장
            }
        });
        input.addEventListener('blur', () => {
            editBudget(); // 저장
        });
        
        budgetEditing = true;
    }
}

function increasePeople() {
    const peopleText = document.getElementById('peopleText');
    const current = parseInt(peopleText.textContent);
    if (current < 10) {
        peopleText.textContent = (current + 1) + '명';
    }
}

function decreasePeople() {
    const peopleText = document.getElementById('peopleText');
    const current = parseInt(peopleText.textContent);
    if (current > 1) {
        peopleText.textContent = (current - 1) + '명';
    }
}

function clearRecommendations() {
    const sidebar = document.getElementById('placesContainer');
    const mapContainer = document.getElementById('mapContainer');
    const noRecommendations = document.getElementById('noRecommendations');
    
    if (sidebar) sidebar.innerHTML = '';
    if (mapContainer) mapContainer.style.display = 'none';
    if (noRecommendations) noRecommendations.style.display = 'flex';
    
    // 지도 마커 제거
    if (careChat && careChat.markers) {
        careChat.markers.forEach(marker => marker.setMap(null));
        careChat.markers = [];
    }
}

function goBack() {
    window.history.back();
}

// 페이지 로드 시 초기화
let careChat;
document.addEventListener('DOMContentLoaded', () => {
    careChat = new CAREChat();
    
    // 전역으로 노출 (chat.html에서 접근 가능하도록)
    window.careChat = careChat;
    
    // 디버깅을 위한 테스트 함수
    window.testRecommendations = () => {
        console.log('테스트 추천 시작');
        const testPlaces = [
            {
                name: "테스트 카페",
                address: "서울시 강남구 테스트로 123",
                phone: "02-1234-5678",
                category: "카페",
                rating: 4.5,
                price_range: "1만원~2만원",
                coordinates: { lat: 37.5665, lng: 126.9780 },
                description: "테스트용 카페입니다.",
                features: ["WiFi", "주차장"]
            }
        ];
        careChat.displayRecommendations(testPlaces);
        // 맵 기능 제거됨
    };
    
    console.log('CARE 채팅 시스템 초기화 완료. 테스트하려면 testRecommendations() 함수를 실행하세요.');
});

// CAREChat 클래스에 추천 시스템 메서드 추가
CAREChat.prototype.initializeRecommendationSystem = function() {
    console.log('=== 추천 시스템 초기화 시작 ===');
    
    // 기본 장소 데이터 로드
    this.loadPlaceData();
    
    console.log('추천 시스템 초기화 완료');
};

CAREChat.prototype.loadPlaceData = function() {
    console.log('=== 장소 데이터 로드 시작 ===');
    
    // allPlaces 초기화
    this.allPlaces = [];
    
    // 1. window.allPlaces에서 기본 데이터 로드
    if (typeof window.allPlaces !== 'undefined' && window.allPlaces.length > 0) {
        this.allPlaces = [...window.allPlaces]; // 복사본 생성
        console.log('window.allPlaces에서 데이터 로드됨:', this.allPlaces.length, '개');
    } else {
        console.warn('window.allPlaces가 비어있습니다. 강제로 데이터 로드 시도...');
        
        // window.allPlaces가 비어있으면 강제로 로드 시도
        if (typeof window.loadAllPlacesData === 'function') {
            console.log('loadAllPlacesData 함수 호출...');
            window.loadAllPlacesData();
            
            if (typeof window.allPlaces !== 'undefined' && window.allPlaces.length > 0) {
                this.allPlaces = [...window.allPlaces];
                console.log('강제 로드 후 데이터 수:', this.allPlaces.length, '개');
            }
        }
        
        // 여전히 데이터가 없으면 기본 데이터 사용
        if (this.allPlaces.length === 0) {
            console.warn('데이터 로드 실패, 기본 데이터 사용');
            this.allPlaces = [
                {
                    name: "고궁",
                    address: "서울시 강남구 강남대로 396",
                    phone: "02-1234-5678",
                    category: "한정식",
                    rating: 4.5,
                    price_range: "1만5천원~2만5천원",
                    description: "전통적이면서도 현대적인 분위기의 한정식 전문점입니다.",
                    features: ["한정식", "단체석", "대학생", "전통음식"],
                    region: "강남구",
                    budget: "적당한",
                    people: "2-3",
                    mood: "조용한",
                    time: "점심",
                    purpose: "데이트"
                }
            ];
        }
    }
    
    // 카페 데이터가 없으면 강제로 추가
    const existingCafeData = this.allPlaces.filter(place => 
        place.category && place.category.includes('카페')
    );
    
    if (existingCafeData.length === 0) {
        console.log('기존 데이터에 카페가 없어서 강제 로드');
        // window.allPlaces에서 카페 데이터 찾기
        if (typeof window.allPlaces !== 'undefined' && window.allPlaces.length > 0) {
            const cafeFromWindow = window.allPlaces.filter(place => 
                place.category && place.category.includes('카페')
            );
            if (cafeFromWindow.length > 0) {
                this.allPlaces = this.allPlaces.concat(cafeFromWindow);
                console.log('window.allPlaces에서 카페 데이터 추가:', cafeFromWindow.length, '개');
            }
        }
    }
    
    // 카페 데이터 강제 로드 (항상 실행)
    console.log('카페 데이터 강제 로드 시작');
    let totalCafeLoaded = 0;
    
    // location_cafe 데이터 직접 로드 (강제)
    for (let i = 1; i <= 13; i++) {
        const cafeName = `cafePlacesPart${i}`;
        if (typeof window[cafeName] !== 'undefined' && window[cafeName].length > 0) {
            this.allPlaces = this.allPlaces.concat(window[cafeName]);
            totalCafeLoaded += window[cafeName].length;
            console.log(`${cafeName} 강제 로드됨: ${window[cafeName].length}개`);
        } else {
            console.log(`${cafeName} 없음`);
        }
    }
    
    console.log('총 카페 데이터 로드됨:', totalCafeLoaded, '개');
    
    // 카페 데이터 확인
    const cafeDataAfter = this.allPlaces.filter(place => 
        place.category && place.category.includes('카페')
    );
    console.log('최종 카페 데이터 수:', cafeDataAfter.length, '개');
    
    // 카페 데이터 샘플 출력
    if (cafeDataAfter.length > 0) {
        console.log('카페 데이터 샘플:', cafeDataAfter[0]);
    }
    
    console.log('최종 로드된 장소 수:', this.allPlaces.length, '개');
    
    // 강제로 window.allPlaces 다시 로드 시도
    if (this.allPlaces.length <= 1 && typeof window.allPlaces !== 'undefined' && window.allPlaces.length > 0) {
        console.log('강제로 window.allPlaces 다시 로드 시도');
        this.allPlaces = window.allPlaces;
        console.log('강제 로드 후 데이터 수:', this.allPlaces.length, '개');
    }
};

CAREChat.prototype.generateRecommendations = function() {
    console.log('=== 추천 생성 시작 ===');
    console.log('현재 조건:', this.currentSearchConditions);
    console.log('현재 지역 키워드:', this.currentRegionKeyword);
    console.log('window.currentRegionKeyword:', window.currentRegionKeyword);
    
    // 데이터가 제대로 로드되었는지 확인
    if (!this.allPlaces || this.allPlaces.length <= 1) {
        console.warn('데이터가 제대로 로드되지 않음. 강제로 데이터 재로드...');
        this.loadPlaceData();
    }
    
    // window.currentRegionKeyword가 있으면 this.currentRegionKeyword에 복사
    if (window.currentRegionKeyword && window.currentRegionKeyword !== '') {
        this.currentRegionKeyword = window.currentRegionKeyword;
        console.log('window.currentRegionKeyword를 this.currentRegionKeyword에 복사:', this.currentRegionKeyword);
    }
    
    // 디버깅용 - 모든 지역 데이터 확인
    console.log('전체 데이터 수:', this.allPlaces.length);
    const regionCounts = {};
    const categoryCounts = {};
    this.allPlaces.forEach(place => {
        if (place.region) {
            regionCounts[place.region] = (regionCounts[place.region] || 0) + 1;
        }
        if (place.category) {
            categoryCounts[place.category] = (categoryCounts[place.category] || 0) + 1;
        }
    });
    console.log('지역별 데이터 수:', regionCounts);
    console.log('카테고리별 데이터 수:', categoryCounts);
    
    // 카페 데이터 확인
    const cafeData = this.allPlaces.filter(place => 
        place.category && place.category.includes('카페')
    );
    console.log('카페 데이터 수:', cafeData.length);
    if (cafeData.length > 0) {
        console.log('카페 데이터 예시:', cafeData[0]);
    }
    
    let filteredPlaces = this.allPlaces.filter(place => {
        console.log('장소 검사:', place.name, '카테고리:', place.category, '지역:', place.region);
        
        // 지역 필터 - 입력한 지역에 맞는 장소만 표시
        if (this.currentRegionKeyword && this.currentRegionKeyword !== '') {
            // 지역 키워드 정규화
            let normalizedKeyword = this.currentRegionKeyword;
            if (normalizedKeyword.includes('역')) {
                normalizedKeyword = normalizedKeyword.replace('역', '');
            }
            if (normalizedKeyword.includes('구')) {
                normalizedKeyword = normalizedKeyword.replace('구', '');
            }
            
            const regionMatch = place.region.includes(normalizedKeyword) || 
                              place.region.includes(this.currentRegionKeyword) ||
                              place.address.includes(normalizedKeyword) ||
                              place.address.includes(this.currentRegionKeyword) ||
                              place.name.includes(normalizedKeyword) ||
                              place.name.includes(this.currentRegionKeyword);
            
            console.log('지역 매칭 확인:', {
                placeName: place.name,
                placeRegion: place.region,
                searchKeyword: this.currentRegionKeyword,
                normalizedKeyword: normalizedKeyword,
                regionMatch: regionMatch
            });
            
            // 지역이 일치하지 않으면 제외
            if (!regionMatch) {
                console.log('❌ 지역 불일치로 제외:', place.name, '지역:', place.region);
                return false;
            }
            
            console.log('✅ 지역 일치로 통과:', place.name, '지역:', place.region);
        } else {
            console.log('⚠️ 지역 키워드가 없어서 모든 장소 통과:', place.name);
        }
        
        // 카테고리 필터 - 맛집/카페만 구분
        if (this.currentSearchConditions.category && this.currentSearchConditions.category !== '') {
            const cafeKeywords = ['카페', '다방', '티룸', '커피', '음료', '브런치', '디저트', '베이커리', '루프탑', '테마', '스터디', '프리미엄', '24시간', '전통', '감성', '드라이브', '테이크아웃', '뷰티플레이스', '북', '애견', '고양이', '갤러리', '뮤직'];
            const isCafe = cafeKeywords.some(keyword => place.category && place.category.includes(keyword));
            
            console.log('카테고리 필터링:', {
                placeName: place.name,
                placeCategory: place.category,
                selectedCategory: this.currentSearchConditions.category,
                isCafe: isCafe
            });
            
            if (this.currentSearchConditions.category === '카페') {
                if (!isCafe) {
                    console.log('❌ 카페가 아닌 장소 제외:', place.name, '카테고리:', place.category);
                    return false;
                }
                console.log('✅ 카페 장소 통과:', place.name, '카테고리:', place.category);
            } else if (this.currentSearchConditions.category === '맛집') {
                if (isCafe) { // 카페이면 맛집이 아님
                    console.log('❌ 카페 장소 제외 (맛집만):', place.name, '카테고리:', place.category);
                    return false;
                }
                console.log('✅ 맛집 장소 통과:', place.name, '카테고리:', place.category);
            }
        }
        
        // 다른 조건들은 무시하고 지역과 카테고리만 필터링
        console.log('장소 통과:', place.name, '지역:', place.region, '카테고리:', place.category);
        
        return true;
    });
    
    console.log('필터링된 장소 수:', filteredPlaces.length);
    this.displayRecommendations(filteredPlaces);
};

CAREChat.prototype.displayRecommendations = function(places) {
    console.log('=== 추천 결과 표시 ===');
    console.log('표시할 장소 수:', places.length);
    
    const recommendationsPanel = document.getElementById('recommendationsPanel');
    if (!recommendationsPanel) {
        console.error('추천 패널을 찾을 수 없습니다!');
        return;
    }
    
    // 패널 표시
    recommendationsPanel.style.display = 'block';
    
    if (places.length === 0) {
        recommendationsPanel.innerHTML = `
            <div style="position: absolute; top: 15px; right: 15px; z-index: 1001;">
                <button onclick="closeRecommendationsPanel()" style="background: #ff6b6b; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; font-size: 18px; font-weight: bold; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.2);" onmouseover="this.style.background='#ff5252'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#ff6b6b'; this.style.transform='scale(1)'" title="닫기">×</button>
            </div>
            <div class="default-message">
                <div class="default-content">
                    <i class="fas fa-search"></i>
                    <h3>조건에 맞는 장소를 찾을 수 없습니다</h3>
                    <p>다른 조건으로 다시 검색해보세요.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // 추천 카드 생성
    let html = `
        <div style="position: absolute; top: 15px; right: 15px; z-index: 1001;">
            <button onclick="closeRecommendationsPanel()" style="background: #ff6b6b; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; font-size: 18px; font-weight: bold; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.2);" onmouseover="this.style.background='#ff5252'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#ff6b6b'; this.style.transform='scale(1)'" title="닫기">×</button>
        </div>
        <div class="recommendations-title">
            <i class="fas fa-map-marker-alt"></i>
            추천 장소 (${places.length}개)
        </div>
    `;
    
    places.forEach(place => {
        html += `
            <div class="recommendation-card" style="background: white; border: 1px solid #e9ecef; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s ease; position: relative;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 16px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
                <div class="recommendation-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 20px; font-weight: bold;">${place.name}</h4>
                        <div style="background: #667eea; color: white; padding: 4px 12px; border-radius: 15px; font-size: 12px; display: inline-block; font-weight: bold;">${place.category}</div>
                    </div>
                    <button onclick="addToCart(${JSON.stringify(place).replace(/"/g, '&quot;')})" style="background: #28a745; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);" onmouseover="this.style.background='#218838'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#28a745'; this.style.transform='scale(1)'" title="장바구니에 담기">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
                <div class="recommendation-info">
                    <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; display: flex; align-items: center;">
                        <i class="fas fa-map-marker-alt" style="color: #667eea; margin-right: 8px; width: 16px;"></i>
                        ${place.address}
                    </p>
                    <p style="margin: 0 0 8px 0; color: #666; font-size: 14px; display: flex; align-items: center;">
                        <i class="fas fa-phone" style="color: #667eea; margin-right: 8px; width: 16px;"></i>
                        ${place.phone}
                    </p>
                    <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; display: flex; align-items: center;">
                        <i class="fas fa-star" style="color: #ffc107; margin-right: 8px; width: 16px;"></i>
                        ${place.rating} | 
                        <i class="fas fa-won-sign" style="color: #28a745; margin-right: 8px; margin-left: 8px; width: 16px;"></i>
                        ${place.price_range}
                    </p>
                    <p class="recommendation-description" style="margin: 0 0 12px 0; color: #555; font-size: 14px; line-height: 1.5; background: #f8f9fa; padding: 12px; border-radius: 8px; border-left: 4px solid #667eea;">${place.description}</p>
                    <div class="recommendation-features" style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${place.features.map(feature => `<span class="feature-tag" style="background: #e9ecef; color: #495057; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">${feature}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    
    recommendationsPanel.innerHTML = html;
};

CAREChat.prototype.applySearchConditions = function() {
    console.log('=== 검색 조건 적용 ===');
    
    // UI에서 조건 수집
    const category = document.getElementById('categorySelect')?.value || '';
    const budget = document.getElementById('budgetSelect')?.value || '';
    const people = document.getElementById('peopleSelect')?.value || '';
    const mood = document.getElementById('moodSelect')?.value || '';
    const time = document.getElementById('timeSelect')?.value || '';
    const purpose = document.getElementById('purposeSelect')?.value || '';
    
    console.log('UI에서 수집된 카테고리:', category);
    console.log('categorySelect 요소:', document.getElementById('categorySelect'));
    
    this.currentSearchConditions = {
        category, budget, people, mood, time, purpose
    };
    
    console.log('수집된 조건들:', this.currentSearchConditions);
    
    // 추천 생성
    this.generateRecommendations();
};

CAREChat.prototype.showAllData = function() {
    console.log('=== 모든 데이터 표시 ===');
    
    this.currentSearchConditions = {
        category: '',
        budget: '',
        people: '',
        mood: '',
        time: '',
        purpose: ''
    };
    
    this.currentRegionKeyword = '';
    
    this.generateRecommendations();
};
