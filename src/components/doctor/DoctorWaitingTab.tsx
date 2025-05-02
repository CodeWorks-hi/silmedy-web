'use client';

import { useCareRequests } from '@/features/hooks/useCareRequests';

export default function DoctorWaitingTab({
  doctorId,
  onSelectRequest,
}:{
  doctorId: string;
  onSelectRequest: (requestId: number) => void;
}) {
  const { careRequests, loading, error } = useCareRequests(doctorId);

  if (loading) return <div>로딩 중…</div>;
  if (error)   return <div>에러 발생: {error}</div>;

  return (
    <table className="min-w-full bg-white">
      <thead className="bg-cyan-100 text-center">
        <tr>
          <th>진료과</th><th>이름</th><th>생년월일</th>
          <th>진료일자</th><th>진료시간</th><th>증상</th><th>액션</th>
        </tr>
      </thead>
      <tbody>
        {careRequests.map(req => (
          <tr key={req.request_id} className="text-center border-t">
            <td>{req.department}</td>
            <td>{req.name || '-'}</td>
            <td>{req.birth_date || '-'}</td>
            <td>{req.book_date}</td>
            <td>{req.book_hour}</td>
            <td>{req.symptom_type?.join(', ')}</td>
            <td>
              <button
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded"
                onClick={() => onSelectRequest(req.request_id)}
              >
                진료 시작
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}