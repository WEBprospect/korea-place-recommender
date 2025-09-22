// CARE - Authentication Manager
// 사용자 인증 및 관리 시스템

class AuthManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
        this.init();
    }

    // 초기화
    init() {
        // 로컬 스토리지에서 현재 사용자 정보 로드
        const savedUser = localStorage.getItem('care_current_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                // 로그인 시간 확인 (24시간 이내)
                if (this.currentUser.loginTime) {
                    const loginTime = new Date(this.currentUser.loginTime).getTime();
                    const now = new Date().getTime();
                    const timeDiff = now - loginTime;
                    const hoursDiff = timeDiff / (1000 * 60 * 60);
                    
                    if (hoursDiff >= 24) {
                        // 로그인 시간 만료
                        this.logout();
                    }
                }
            } catch (error) {
                console.error('사용자 데이터 파싱 오류:', error);
                this.logout();
            }
        }
    }

    // 사용자 목록 로드
    loadUsers() {
        const savedUsers = localStorage.getItem('care_users');
        if (savedUsers) {
            try {
                const users = JSON.parse(savedUsers);
                console.log('저장된 사용자 목록 로드됨:', users);
                return users;
            } catch (error) {
                console.error('사용자 목록 로드 오류:', error);
                return this.getDefaultUsers();
            }
        }
        console.log('기본 사용자 목록 생성');
        const defaultUsers = this.getDefaultUsers();
        // 기본 사용자를 localStorage에 저장
        localStorage.setItem('care_users', JSON.stringify(defaultUsers));
        return defaultUsers;
    }

    // 기본 사용자 목록
    getDefaultUsers() {
        return [
            {
                username: 'admin',
                password: 'admin123',
                email: 'admin@care.com',
                createdAt: new Date().toISOString()
            },
            {
                username: 'test',
                password: 'test123',
                email: 'test@care.com',
                createdAt: new Date().toISOString()
            }
        ];
    }

    // 사용자 목록 저장
    saveUsers() {
        console.log('사용자 목록 저장 중:', this.users);
        localStorage.setItem('care_users', JSON.stringify(this.users));
        console.log('사용자 목록 저장 완료');
    }

    // 로그인
    login(username, password) {
        console.log('AuthManager.login 호출됨');
        console.log('사용자 목록:', this.users);
        console.log('검색할 아이디:', username);
        
        // 먼저 아이디가 존재하는지 확인
        const existingUser = this.users.find(u => u.username === username);
        console.log('아이디 존재 여부:', existingUser ? '존재' : '존재하지 않음');
        
        if (!existingUser) {
            console.log('로그인 실패: 회원가입되지 않은 아이디');
            return {
                success: false,
                message: '회원가입되지 않은 아이디입니다. 먼저 회원가입을 해주세요.'
            };
        }
        
        // 아이디는 존재하지만 비밀번호가 틀린 경우
        if (existingUser.password !== password) {
            console.log('로그인 실패: 비밀번호가 틀림');
            return {
                success: false,
                message: '비밀번호가 올바르지 않습니다. 다시 확인해주세요.'
            };
        }
        
        // 로그인 성공
        this.currentUser = {
            username: existingUser.username,
            email: existingUser.email,
            loginTime: new Date().toISOString()
        };
        
        // 로그인 상태 저장
        localStorage.setItem('care_current_user', JSON.stringify(this.currentUser));
        console.log('로그인 성공, 사용자 정보 저장됨');
        
        return {
            success: true,
            user: this.currentUser
        };
    }

    // 회원가입
    register(username, password, email = null) {
        console.log('AuthManager.register 호출됨');
        console.log('새 사용자 정보:', { username, email });
        
        // 중복 사용자 확인
        const existingUser = this.users.find(u => u.username === username);
        console.log('기존 사용자 확인:', existingUser);
        
        if (existingUser) {
            console.log('회원가입 실패: 이미 존재하는 아이디');
            return {
                success: false,
                message: '이미 존재하는 아이디입니다.'
            };
        }

        // 새 사용자 생성
        const newUser = {
            username: username,
            password: password,
            email: email || `${username}@care.com`,
            createdAt: new Date().toISOString()
        };

        console.log('새 사용자 생성:', newUser);
        this.users.push(newUser);
        this.saveUsers();
        console.log('사용자 목록에 추가됨, 저장 완료');

        // 자동 로그인
        this.currentUser = {
            username: newUser.username,
            email: newUser.email,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('care_current_user', JSON.stringify(this.currentUser));
        console.log('자동 로그인 완료');

        return {
            success: true,
            user: this.currentUser
        };
    }

    // 로그아웃
    logout() {
        this.currentUser = null;
        localStorage.removeItem('care_current_user');
    }

    // 현재 사용자 정보 반환
    getCurrentUser() {
        return this.currentUser;
    }

    // 로그인 상태 확인
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // 사용자 정보 업데이트
    updateUser(updates) {
        if (!this.currentUser) {
            return {
                success: false,
                message: '로그인이 필요합니다.'
            };
        }

        const userIndex = this.users.findIndex(u => u.username === this.currentUser.username);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...updates };
            this.saveUsers();
            
            this.currentUser = { ...this.currentUser, ...updates };
            localStorage.setItem('care_current_user', JSON.stringify(this.currentUser));
            
            return {
                success: true,
                user: this.currentUser
            };
        }

        return {
            success: false,
            message: '사용자를 찾을 수 없습니다.'
        };
    }

    // 비밀번호 변경
    changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            return {
                success: false,
                message: '로그인이 필요합니다.'
            };
        }

        const user = this.users.find(u => u.username === this.currentUser.username);
        if (!user || user.password !== currentPassword) {
            return {
                success: false,
                message: '현재 비밀번호가 올바르지 않습니다.'
            };
        }

        user.password = newPassword;
        this.saveUsers();

        return {
            success: true,
            message: '비밀번호가 변경되었습니다.'
        };
    }

    // 계정 삭제
    deleteAccount(password) {
        if (!this.currentUser) {
            return {
                success: false,
                message: '로그인이 필요합니다.'
            };
        }

        const user = this.users.find(u => u.username === this.currentUser.username);
        if (!user || user.password !== password) {
            return {
                success: false,
                message: '비밀번호가 올바르지 않습니다.'
            };
        }

        // 사용자 삭제
        this.users = this.users.filter(u => u.username !== this.currentUser.username);
        this.saveUsers();
        
        // 로그아웃
        this.logout();

        return {
            success: true,
            message: '계정이 삭제되었습니다.'
        };
    }
}

// 전역 인스턴스 생성
const authManager = new AuthManager();

// 유틸리티 함수들
function showAuthMessage(message, type = 'info') {
    // 기존 메시지 제거
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 새 메시지 생성
    const messageDiv = document.createElement('div');
    messageDiv.className = 'auth-message';
    messageDiv.innerHTML = `
        <div class="message-content ${type}">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 스타일 적용
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .auth-message .message-content {
            background: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            max-width: 300px;
        }
        
        .auth-message .message-content.success {
            color: #10b981;
            border-left: 4px solid #10b981;
        }
        
        .auth-message .message-content.error {
            color: #ef4444;
            border-left: 4px solid #ef4444;
        }
        
        .auth-message .message-content.info {
            color: #3b82f6;
            border-left: 4px solid #3b82f6;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(messageDiv);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        messageDiv.remove();
        style.remove();
    }, 3000);
}

// 로그인 폼 처리
function handleLogin(event) {
    event.preventDefault();
    
    console.log('로그인 시도 중...');
    
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    console.log('입력된 아이디:', username);
    console.log('입력된 비밀번호:', password ? '***' : '없음');
    
    if (!username || !password) {
        showAuthMessage('아이디와 비밀번호를 모두 입력해주세요.', 'error');
        return;
    }
    
    const result = authManager.login(username, password);
    console.log('로그인 결과:', result);
    
    if (result.success) {
        showAuthMessage('로그인 성공!', 'success');
        // 페이지 새로고침으로 상태 동기화
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showAuthMessage(result.message, 'error');
    }
}

// 회원가입 폼 처리
function handleRegister(event) {
    event.preventDefault();
    
    console.log('회원가입 시도 중...');
    
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const email = formData.get('email');
    
    console.log('입력된 아이디:', username);
    console.log('입력된 비밀번호:', password ? '***' : '없음');
    console.log('비밀번호 확인:', confirmPassword ? '***' : '없음');
    
    // 입력값 검증
    if (!username || !password || !confirmPassword) {
        showAuthMessage('모든 필드를 입력해주세요.', 'error');
        return;
    }
    
    // 비밀번호 확인
    if (password !== confirmPassword) {
        showAuthMessage('비밀번호가 일치하지 않습니다.', 'error');
        return;
    }
    
    // 비밀번호 길이 확인
    if (password.length < 6) {
        showAuthMessage('비밀번호는 6자 이상이어야 합니다.', 'error');
        return;
    }
    
    const result = authManager.register(username, password, email);
    console.log('회원가입 결과:', result);
    
    if (result.success) {
        showAuthMessage('회원가입 성공! 자동으로 로그인되었습니다.', 'success');
        // 페이지 새로고침으로 상태 동기화
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showAuthMessage(result.message, 'error');
    }
}

// 로그아웃 처리
function handleLogout() {
    if (confirm('정말 로그아웃하시겠습니까?')) {
        authManager.logout();
        showAuthMessage('로그아웃되었습니다.', 'info');
        // 페이지 새로고침으로 상태 동기화
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}
