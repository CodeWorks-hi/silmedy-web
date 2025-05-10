// src/features/hooks/useHospitals.ts
import { useState, useEffect } from 'react';
import { getHospitals } from '@/lib/api';

export function useHospitals() {
  const [hospitals, setHospitals] = useState<{ hospital_id: number; name: string }[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string|null>(null);

  useEffect(() => {
    setLoading(true);
    getHospitals()
      .then(list => setHospitals(list))
      .catch(err => {
        console.error(err);
        setError('병원 목록 조회 실패');
      })
      .finally(() => setLoading(false));
  }, []);

  return { hospitals, loading, error };
}