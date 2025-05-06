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
  response => response,                                         // 문제가 없으면 응답 그대로 반환
  error => {
    if (error.response?.status === 401) {
      console.warn('🔒 인증 실패: 로그인 필요');
      // TODO: 로그인 페이지 리다이렉트 처리 가능
    } else {
      console.error('❌ API 요청 실패:', error.response || error);
    }
    return Promise.reject(error);                               // 에러를 호출부로 전달
  }
);

// 5) 통합된 axios 인스턴스 내보내기
export default instance;