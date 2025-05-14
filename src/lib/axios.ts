// src/lib/axios.ts
//──────────────────────────────────────────────────────────────────────────────
// 1) axios 모듈 불러오기
import axios from 'axios';

// 2) 환경변수 NEXT_PUBLIC_API_URL 이 설정돼 있으면 그 값을, 아니면 FastAPI 서버 기본 URL 사용
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,       // 빌드 시 .env.local 등에 정의
  withCredentials: true,                          // 쿠키 전송 허용
  headers: {                                      // 모든 요청에 JSON 헤더 자동 추가
    'Content-Type': 'application/json'
  }
});

// 3) 요청 인터셉터: 매번 로컬스토리지에서 토큰을 꺼내 Authorization 헤더에 실어 보냄
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');          // 저장해 둔 액세스 토큰
    if (token) config.headers.Authorization = `Bearer ${token}`; // 헤더에 추가
    return config;                                               // 수정된 config 반환
  },
  error => Promise.reject(error)                                // 요청 설정 중 에러 시 그대로 reject
);

// 4) 응답 인터셉터: 401 Unauthorized 처리 및 그 외 에러 로깅
instance.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;
    // 1) 401 이면서, 아직 retry 시도를 안 해봤다면
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        // 2) /auth/refresh 로 쿠키에 담긴 refreshToken 자동 전송
        const { data } = await instance.post('/auth/refresh');
        // 3) 새로 받은 accessToken 로 로컬스토리지 업데이트
        localStorage.setItem('access_token', data.access_token);
        // 4) 원래 요청 헤더 갱신
        original.headers.Authorization = `Bearer ${data.access_token}`;
        // 5) 다시 시도
        return instance(original);
      } catch (refreshError) {
        console.error('🔄 토큰 재발급 실패:', refreshError);
        // 필요시 로그인 페이지로 리디렉트
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 그 외 에러는 기존대로
    if (error.response?.status !== 401) {
      console.error('❌ API 요청 실패:', error.response || error);
    }
    return Promise.reject(error);
  }
);

// 5) 통합된 axios 인스턴스 내보내기
export default instance;