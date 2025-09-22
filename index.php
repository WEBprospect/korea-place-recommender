<?php
// 기본 index.php - HTML 파일을 직접 출력
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CARE - AI 기반 스마트 추천 플랫폼</title>
    <meta name="description" content="AI 기반으로 장소, 음식, 여가활동을 추천해주는 스마트 플랫폼">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <link rel="stylesheet" href="styles.css?v=1.0">
    <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=d2e0ddf432816a11dbb8ec7dce60fae5"></script>
</head>
<body>
    <!-- 네비게이션 -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <span>CARE</span>
                <small>Customized AI Recommendation Engine</small>
            </div>
            <ul class="nav-menu">
                <li class="nav-item">
                    <a href="#home" class="nav-link">홈</a>
                </li>
                <li class="nav-item">
                    <a href="#about" class="nav-link">소개</a>
                </li>
                <li class="nav-item">
                    <a href="#map" class="nav-link">지도</a>
                </li>
                <li class="nav-item">
                    <a href="#contact" class="nav-link">문의</a>
                </li>
            </ul>
            <div class="hamburger">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </nav>

    <!-- 메인 섹션 -->
    <section id="home" class="hero">
        <div class="hero-container">
            <h1 class="hero-title">AI 기반 스마트 추천 플랫폼</h1>
            <p class="hero-description">
                당신의 상황과 취향을 분석하여 최적의 장소, 음식, 여가활동을 추천해드립니다.
            </p>
            <button class="cta-button" onclick="openRecommendationModal()">추천 시작하기</button>
        </div>
    </section>

    <!-- 소개 섹션 -->
    <section id="about" class="about">
        <div class="container">
            <h2 class="section-title">CARE란 무엇인가요?</h2>
            <p class="about-description">
                CARE는 AI 기반 스마트 추천 플랫폼으로, 사용자의 상황과 선호도를 분석하여 
                맞춤형 추천을 제공합니다.
            </p>
            
            <div class="features">
                <div class="feature-card">
                    <div class="feature-icon">🤖</div>
                    <h3>AI 기반 스마트 추천</h3>
                    <p>고급 AI 알고리즘으로 정확한 추천</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎯</div>
                    <h3>맞춤형 추천</h3>
                    <p>개인의 취향과 상황에 맞는 추천</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>빠른 분석</h3>
                    <p>실시간으로 빠른 추천 제공</p>
                </div>
            </div>

            <div class="process">
                <h3>작동 방식</h3>
                <div class="process-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <h4>상황 입력</h4>
                        <p>현재 상황이나 원하는 것을 입력</p>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <h4>AI 분석</h4>
                        <p>AI가 상황을 분석하고 패턴 파악</p>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <h4>스마트 추천</h4>
                        <p>맞춤형 추천 결과 제공</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 지도 섹션 -->
    <section id="map" class="map-section">
        <div class="container">
            <h2 class="section-title">추천 장소 지도</h2>
            <div class="map-container">
                <div id="map" class="kakao-map"></div>
                <div class="map-controls">
                    <button id="showAllMarkers" class="map-btn">모든 마커 보기</button>
                    <button id="centerMap" class="map-btn">지도 중앙화</button>
                </div>
            </div>
        </div>
    </section>

    <!-- 문의 섹션 -->
    <section id="contact" class="contact">
        <div class="container">
            <h2 class="section-title">문의하기</h2>
            <div class="contact-content">
                <div class="contact-info">
                    <h3>연락처 정보</h3>
                    <div class="contact-item">
                        <strong>이메일:</strong>
                        <span>hyeondongkyu@gmail.com</span>
                    </div>
                    <div class="contact-item">
                        <strong>전화번호:</strong>
                        <span>010-4073-3899</span>
                    </div>
                    <div class="contact-item">
                        <strong>운영시간:</strong>
                        <span>평일 09:00 - 18:00</span>
                    </div>
                </div>
                
                <form id="contactForm" class="contact-form">
                    <div class="form-group">
                        <label for="contactName">이름 *</label>
                        <input type="text" id="contactName" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="contactEmail">이메일 *</label>
                        <input type="email" id="contactEmail" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="contactPhone">전화번호</label>
                        <input type="tel" id="contactPhone" name="phone">
                    </div>
                    <div class="form-group">
                        <label for="contactSubject">제목 *</label>
                        <input type="text" id="contactSubject" name="subject" required>
                    </div>
                    <div class="form-group">
                        <label for="contactMessage">메시지 *</label>
                        <textarea id="contactMessage" name="message" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="submit-btn">메시지 보내기</button>
                </form>
            </div>
        </div>
    </section>

    <!-- 추천 모달 -->
    <div id="recommendationModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeRecommendationModal()">&times;</span>
            <h2>AI 스마트 추천</h2>
            <p>현재 상황이나 원하는 것을 자유롭게 작성해주세요</p>
            <textarea id="userInput" placeholder="예: 오늘 날씨가 좋아서 산책하고 싶어요"></textarea>
            <button onclick="getRecommendation()">추천 받기</button>
            <div id="results"></div>
        </div>
    </div>

    <!-- 알림 메시지 -->
    <div id="notification" class="notification"></div>

    <!-- 푸터 -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>CARE</h3>
                    <p>AI 기반 스마트 추천 플랫폼</p>
                </div>
                <div class="footer-section">
                    <h4>서비스</h4>
                    <ul>
                        <li><a href="#about">소개</a></li>
                        <li><a href="#map">지도</a></li>
                        <li><a href="#contact">문의</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>연락처</h4>
                    <p>이메일: hyeondongkyu@gmail.com</p>
                    <p>전화: 010-4073-3899</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 CARE. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="script.js?v=1.0"></script>
</body>
</html>
