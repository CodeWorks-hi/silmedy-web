'use client';

import { useCareRequests } from '@/features/hooks/useCareRequests';
import { useState } from 'react';
import axios from '@/lib/axios';

interface DoctorWaitingTabProps {
  onSelectRequest: (requestId: number) => void;  // ✅ 명확하게 request_id
  doctorId: string;
}

export default function DoctorWaitingTab({ onSelectRequest, doctorId }: DoctorWaitingTabProps) {
  const { careRequests, loading, error } = useCareRequests(doctorId);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (loading) return <div>로딩 중...</div>;
  if (error) {
    console.error('❌ 대기 환자 API 실패:', error);
    return <div>에러 발생: {error}</div>;
  }

  // 🔍 디버깅 로그
  console.log('✅ 전체 진료 대기 리스트:', careRequests);

  // Pagination 처리
  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedRequests = careRequests.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(careRequests.length / itemsPerPage);

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
          {selectedRequests.map((req) => {
            console.log('▶️ 개별 req:', req); // 🔍 개별 진료 요청
            return (
              <tr key={req.request_id} className="text-center border-t">
                <td className="py-2 px-4">{req.department}</td>
                <td className="py-2 px-4">{req.name || '-'}</td>
                <td className="py-2 px-4">{req.birth_date || '-'}</td>
                <td className="py-2 px-4">{req.book_date}</td>
                <td className="py-2 px-4">{req.book_hour}</td>
                <td className="py-2 px-4">{req.symptom_type?.join(', ')}</td>
                <td className="py-2 px-4">
                  {/* 버튼 클릭 시 request_id 전달 */}
                  <button
                    onClick={() => {
                      console.log('🟩 진료 시작 request_id:', req.request_id);
                      onSelectRequest(req.request_id); // ✅ 정확한 requestId 전달
                    }}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded"
                  >
                    진료 시작
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 페이징 버튼 */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${currentPage === page ? 'bg-cyan-500 text-white' : 'bg-gray-200'}`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}