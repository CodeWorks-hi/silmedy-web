'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios'; 

export interface CareRequest {
  request_id: number;
  department: string;
  book_date: string;
  book_hour: string;
  patient_id: string | number;
  sign_language_needed: boolean;
  symptom_part: string[];
  symptom_type: string[];
  is_solved: boolean;
  doctor_id: number;
  requested_at: string;
  name?: string;
  birth_date?: string;
}

export function useCareRequests(doctorId: string) {
    const [careRequests, setCareRequests] = useState<CareRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
  
    const fetchCareRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/care-requests/waiting`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
  
        const rawList: CareRequest[] = response.data.waiting_list || [];
        console.log('[진료 대기 리스트]', rawList); // 🔍 디버깅 확인용
  
        setCareRequests(rawList);
      } catch (err: any) {
        console.error(err);
        setError('대기 환자 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (doctorId) fetchCareRequests();
    }, [doctorId]);
  
    return { careRequests, loading, error, refetch: fetchCareRequests };
  }