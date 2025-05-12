'use client';

import { useState } from 'react';
import { useCareRequests } from '@/features/hooks/useCareRequests';
import { CareRequest } from '@/types/consult';

interface DoctorWaitingTabProps {
  doctorId: string;
  // 이제 requestId 대신 CareRequest 전체를 넘기도록
  onSelectRequest: (row: { request_id: number; patient_id: string | number }) => void;
}

/**
 * DoctorWaitingTab 컴포넌트
 * - useCareRequests 훅으로 대기 환자 목록 조회
 * - 페이징 처리 후 테이블 렌더링
 * - “진료 시작” 버튼 클릭 시 상위 컴포넌트에 request_id + patient_id 전달
 */
export default function DoctorWaitingTab({
  doctorId,
  onSelectRequest,
}: DoctorWaitingTabProps) {
  // 1) 대기 환자 목록 조회
  const { careRequests, loading, error } = useCareRequests(doctorId);

  // 2) 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 3) 로딩 및 에러 처리
  if (loading) return <div>로딩 중...</div>;
  if (error)   return <div className="text-red-500">에러: {error}</div>;

  const validRequests = careRequests ?? [];
  const start = (currentPage - 1) * itemsPerPage;
  const pageData = validRequests.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(validRequests.length / itemsPerPage);

  return (
    <div className="space-y-4">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-cyan-100 text-center">
            <th className="py-2 px-4">진료과</th>
            <th className="py-2 px-4">이름</th>
            <th className="py-2 px-4">생년월일</th>
            <th className="py-2 px-4">진료일자</th>
            <th className="py-2 px-4">진료시간</th>
            <th className="py-2 px-4">증상</th>
            <th className="py-2 px-4">액션</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((req: CareRequest) => (
            <tr key={req.request_id} className="text-center border-t">
              <td className="py-2 px-4">{req.department}</td>
              <td className="py-2 px-4">{req.name || '-'}</td>
              <td className="py-2 px-4">{req.birth_date || '-'}</td>
              <td className="py-2 px-4">{req.book_date}</td>
              <td className="py-2 px-4">{req.book_hour}</td>
              <td className="py-2 px-4">{req.symptom_type?.join(', ')}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() =>
                    onSelectRequest({
                      request_id: req.request_id,
                      patient_id: req.patient_id,
                    })
                  }
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded"
                >
                  진료 시작
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지 네비게이션 */}
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page ? 'bg-cyan-500 text-white' : 'bg-gray-200'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}