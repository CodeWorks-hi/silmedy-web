// src/features/hooks/useDoctors.ts
'use client';

import { useState, useEffect } from 'react';
import {
  getDoctors,
  deleteDoctor as apiDeleteDoctor,
  updateDoctor as apiUpdateDoctor,   // ★ UPDATE API 헬퍼
} from '@/lib/api';

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
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getDoctors();
      setDoctors(list);
    } catch (err: any) {
      console.error('의사 목록 조회 실패:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const deleteDoctor = async (license_number: string) => {
    try {
      await apiDeleteDoctor(license_number);
      setDoctors((prev) =>
        prev.filter((doc) => doc.license_number !== license_number)
      );
    } catch (err: any) {
      console.error('의사 삭제 실패:', err);
      setError('삭제 중 오류가 발생했습니다.');
    }
  };

  // ★ 새로 추가: 의사 정보 수정
  const updateDoctor = async (
    license_number: string,
    payload: Partial<Omit<Doctor, 'license_number'>>
  ) => {
    try {
      const updated = await apiUpdateDoctor(license_number, payload);
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.license_number === license_number ? updated : doc
        )
      );
      return updated;
    } catch (err: any) {
      console.error('의사 수정 실패:', err);
      setError('수정 중 오류가 발생했습니다.');
      throw err;
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return {
    doctors,
    loading,
    error,
    deleteDoctor,
    updateDoctor,  // ★ 훅 반환값에 추가
    refetch: fetchDoctors,
  };
}