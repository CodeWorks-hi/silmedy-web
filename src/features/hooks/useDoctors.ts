// src/features/hooks/useDoctors.ts
'use client';

import { useState, useEffect } from 'react';
import { getDoctors, deleteDoctor as apiDeleteDoctor } from '@/lib/api'; // 공통 API 함수 불러오기

export interface Doctor {
  license_number: string;
  name: string;
  gender: string;
  email: string;
  department: string;
  contact: string;
  bio?: string[];
  availability?: Record<string, string>;
  created_at?: string;
  password?: string;
  hospital_id?: number;
  profile_url?: string;
}

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]); // 의사 목록 상태
  const [loading, setLoading] = useState<boolean>(false); // 로딩 표시 상태
  const [error, setError] = useState<string | null>(null); // 에러 메시지 상태

  // 서버에서 의사 목록을 가져오는 함수
  const fetchDoctors = async () => {
    setLoading(true);      // 로딩 시작
    setError(null);        // 기존 에러 초기화
    try {
      const list = await getDoctors(); // API 호출
      setDoctors(list);     // 가져온 목록 상태에 저장
    } catch (err: any) {
      console.error('의사 목록 조회 실패:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.'); // 에러 상태 설정
    } finally {
      setLoading(false);    // 로딩 종료
    }
  };

  // 의사 삭제 함수
  const deleteDoctor = async (license_number: string) => {
    try {
      await apiDeleteDoctor(license_number); // API 호출로 삭제
      setDoctors((prev) =>
        prev.filter((doc) => doc.license_number !== license_number)
      ); // 상태에서 제거
    } catch (err: any) {
      console.error('의사 삭제 실패:', err);
      setError('삭제 중 오류가 발생했습니다.'); // 에러 상태 설정
    }
  };

  // 마운트 시와 refetch 호출 시 fetchDoctors 실행
  useEffect(() => {
    fetchDoctors();
  }, []);

  // 훅이 제공하는 값
  return {
    doctors,
    loading,
    error,
    deleteDoctor,
    refetch: fetchDoctors, // 필요 시 다시 불러오기
  };
}