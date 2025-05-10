'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { DiagnosisRecord } from '@/types/consult';


// ──────────────────────────────────────────────────────────────
// 각 진료 기록 항목의 데이터 구조를 정의합니다.
// ──────────────────────────────────────────────────────────────


// ──────────────────────────────────────────────────────────────
// 컴포넌트 Props: 진료 기록을 조회할 환자의 ID입니다.
// ──────────────────────────────────────────────────────────────
interface Props {
  patientId: string;  // 과거 진료 기록을 가져올 환자 고유 ID
}

export default function PastDiagnosisSection({ patientId }: Props) {
  // ──────────────────────────────────────────────────────────────
  // 상태: API 호출로 받아온 진료 기록 목록을 저장합니다.
  // ──────────────────────────────────────────────────────────────
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);

  // ──────────────────────────────────────────────────────────────
  // 날짜 문자열에서 시간 부분을 제거하고 'YYYY-MM-DD'만 반환합니다.
  // ──────────────────────────────────────────────────────────────
  const formatDate = (dateTimeString: string) =>
    dateTimeString.split(' ')[0];

  // ──────────────────────────────────────────────────────────────
  // patientId가 존재할 때마다 API를 호출해 진료 기록을 불러옵니다.
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!patientId) return;  // 유효한 환자 ID 없으면 작업하지 않습니다.

    axios
      .get(`/diagnosis/patient/${patientId}`)  // GET 요청: /diagnosis/patient/{patientId}
      .then(res => {
        // 성공 시: 응답 객체에서 diagnosis_records 배열을 꺼내 상태에 저장
        setRecords(res.data.diagnosis_records || []);
      })
      .catch(() => {
        // 오류 시: 별도의 사용자 알림 없이 조용히 실패 처리
      });
  }, [patientId]);

  // ──────────────────────────────────────────────────────────────
  // 렌더링: 기록이 있으면 카드 형태로, 없으면 안내 메시지를 표시
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="p-4 bg-white rounded shadow-md">
      {/* 섹션 제목 */}
      <h2 className="text-lg font-bold mb-2">과거 진료 기록</h2>

      {records.length > 0 ? (
        // 기록이 하나 이상 있으면 가로 스크롤 가능한 카드 리스트로 보여줍니다.
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {records.map(record => (
            <div
              key={record.diagnosis_id}
              className="min-w-[200px] bg-gray-50 p-3 rounded border border-gray-300 shadow-sm flex-shrink-0"
            >
              {/* 병명 코드 */}
              <div>
                <strong>진단명:</strong> {record.disease_code}
              </div>
              {/* 진단 일자 (시간 제외) */}
              <div>
                <strong>진단일자:</strong> {formatDate(record.diagnosed_at)}
              </div>
              {/* 진단 요약 */}
              <div>
                <strong>요약:</strong> {record.diagnosis_text}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 기록이 없으면 비어있음을 사용자에게 알려줍니다.
        <div className="text-sm text-gray-500">
          과거 진료 기록이 없습니다.
        </div>
      )}
    </div>
  );
}