'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Doctor {
  name: string;
  gender: string;
  email: string;
  position: string;
  phone: string;
  profileImageUrl?: string;
}

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoctors() {
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
    }

    fetchDoctors();
  }, []);

  return { doctors, loading, error };
}