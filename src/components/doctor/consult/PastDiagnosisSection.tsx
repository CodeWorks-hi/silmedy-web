'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

interface DiagnosisRecord {
  diagnosis_id: string;
  diagnosed_at: string;
  diagnosis_text: string;
  disease_code: string;
}

export default function PastDiagnosisSection({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);

  const formatDate = (dateTimeString: string) =>
    dateTimeString.split(" ")[0]; // '2025-04-29 14:46:53' ➝ '2025-04-29'

  useEffect(() => {
    if (!patientId) return;

    console.log('📜 진료 기록 로딩 시작:', patientId);

    axios
      .get(`/diagnosis/patient/${patientId}`)
      .then((res) => {
        console.log('✅ 진료 기록 로딩 완료:', res.data);
        setRecords(res.data.diagnosis_records || []);
      })
      .catch((err) => {
        console.error('❌ 진료 기록 불러오기 실패:', err);
      });
  }, [patientId]);

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-lg font-bold mb-2">과거 진료 기록</h2>
      {records.length > 0 ? (
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {records.map((record) => (
            <div
              key={record.diagnosis_id}
              className="min-w-[200px] bg-gray-50 p-3 rounded border border-gray-300 shadow-sm flex-shrink-0"
            >
              <div><strong>진단명:</strong> {record.disease_code}</div>
              <div><strong>진단일자:</strong> {formatDate(record.diagnosed_at)}</div>
              <div><strong>요약:</strong> {record.diagnosis_text}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500">과거 진료 기록이 없습니다.</div>
      )}
    </div>
  );
}