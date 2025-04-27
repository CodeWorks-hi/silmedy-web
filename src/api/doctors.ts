// src/api/doctors.ts
import axios from 'axios';

// ✅ Render 배포된 API 서버 URL
const BASE_URL = 'https://silmedy-web-server.onrender.com/api/v1';

export const getDoctors = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/doctors`);
    return response.data.doctors; // ✅ 우리 API 응답 구조에 맞게 doctors만 반환
  } catch (error) {
    console.error('의사 목록 가져오기 실패:', error);
    throw error;
  }
};