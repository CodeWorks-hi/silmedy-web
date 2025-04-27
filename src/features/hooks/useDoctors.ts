'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

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

  // 🔵 서버에서 의사 목록 가져오기
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/doctors`);
      setDoctors(response.data.doctors);
    } catch (err: any) {
      console.error(err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 🔴 의사 삭제
  const deleteDoctor = async (license_number: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/delete/doctor/${license_number}`);
      setDoctors((prev) => prev.filter((doc) => doc.license_number !== license_number));
    } catch (err: any) {
      console.error(err);
      setError('삭제 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return { doctors, loading, error, deleteDoctor, refetch: fetchDoctors };
}