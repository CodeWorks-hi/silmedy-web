// src/features/hooks/useCareRequests.ts
'use client';

import { useState, useEffect } from 'react';
import { getWaitingCareRequests } from '@/lib/api';  // 공통 API 모듈에서 가져오기
import { CareRequest } from '@/types/consult';


/**
 * useCareRequests 훅
 * - 로그인한 의사 ID(doctorId)가 존재할 때만 API 호출
 * - 대기 중 진료 요청 목록을 가져오고 로딩/에러 상태 관리
 */
export function useCareRequests(doctorId: string | null) {
  // 대기 요청 목록 상태
  const [careRequests, setCareRequests] = useState<CareRequest[]>([]);
  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(false);
  // 에러 메시지 상태
  const [error, setError] = useState<string | null>(null);

  /**
   * 서버로부터 대기 환자 리스트를 가져오는 함수
   */
  const fetchCareRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // API 모듈의 getWaitingCareRequests 호출
      const list = await getWaitingCareRequests();
      setCareRequests(list as CareRequest[]);
    } catch (err: any) {
      console.error('대기 환자 리스트 조회 실패:', err);
      setError('대기 환자 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // doctorId 변경 시(fetch 필요 조건 만족 시) 한 번 호출
  useEffect(() => {
    if (doctorId) {
      fetchCareRequests();
    }
  }, [doctorId]);

  return {
    careRequests,            // 대기 환자 목록
    loading,                 // 로딩 중 여부
    error,                   // 오류 메시지
    refetch: fetchCareRequests, // 필요 시 재호출 함수
  };
}