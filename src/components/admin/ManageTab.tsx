'use client';

import React, { useState, useMemo } from 'react';
import { useDoctors } from '@/features/hooks/useDoctors';
import EditDoctorModal from '@/components/admin/EditDoctorModal';
import type { Doctor } from '@/types/consult'

const PAGE_SIZE = 10;

export default function ManageTab() {
  const { doctors, loading, error, deleteDoctor, refetch } = useDoctors();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState('');
  // 페이지 상태
  const [page, setPage] = useState(1);

  // 1) 이름으로 필터링
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return doctors;
    return doctors.filter(d =>
      d.name.toLowerCase().includes(term)
    );
  }, [searchTerm, doctors]);

  // 2) 페이징 계산
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const visibleDoctors = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div>
      {/* 제목 + 검색창을 한 줄에 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">직원 관리</h2>
        <input
          type="text"
          placeholder="이름으로 검색…"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          // 검색창 사이즈 
          className="w-1/6 border rounded px-4 py-2"
        />
      </div>

      {loading && <div className="text-center text-gray-500">불러오는 중...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}

      {!loading && !error && (
        <>
          {/* 테이블 */}
          <div className="overflow-auto max-h-[600px]">
            <table className="min-w-full border text-sm">
              <thead className="bg-cyan-100 text-center">
                <tr>
                  <th className="px-4 py-2 border">사진</th>
                  <th className="px-4 py-2 border">이름</th>
                  <th className="px-4 py-2 border">성별</th>
                  <th className="px-4 py-2 border">이메일</th>
                  <th className="px-4 py-2 border">과</th>
                  <th className="px-4 py-2 border">연락처</th>
                  {['월', '화', '수', '목', '금'].map(day => (
                    <th key={day} className="px-4 py-2 border text-center">{day}</th>
                  ))}
                  <th className="px-4 py-2 border">관리</th>
                </tr>
              </thead>
              <tbody>
                {visibleDoctors.map(doctor => (
                  <tr key={doctor.license_number}>
                    <td className="px-4 py-2 border">
                      <img
                        src={doctor.profile_url || '/default-profile.png'}
                        alt="profile"
                        className="w-14 h-15 rounded-full mx-auto" // 이미지 사이즈 w,h 의 숫자
                      />
                    </td>
                    <td className="px-4 py-2 border text-center">{doctor.name}</td>
                    <td className="px-4 py-2 border text-center">{doctor.gender}</td>
                    <td className="px-4 py-2 border text-center">{doctor.email}</td>
                    <td className="px-4 py-2 border text-center">{doctor.department}</td>
                    <td className="px-4 py-2 border text-center">{doctor.contact}</td>
                    {['월', '화', '수', '목', '금'].map(day => (
                      <td key={day} className="px-4 py-2 border text-center">
                        {doctor.availability?.[day] ?? '-'}
                      </td>
                    ))}
                    <td className="px-4 py-2 border text-center space-x-2">
                      <button
                        onClick={() => {
                          if (confirm('정말 삭제하시겠습니까?')) {
                            deleteDoctor(doctor.license_number);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        삭제
                      </button>
                      <button
                        onClick={() => setSelectedDoctor(doctor)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이징 컨트롤 */}
          <div className="flex justify-center items-center mt-4 space-x-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-cyan-100 text-center rounded font-bold disabled:opacity-50"
            >
              « 이전
            </button>
            <span>{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-cyan-100 text-center rounded font-bold disabled:opacity-50"
            >
              다음 »
            </button>
          </div>
        </>
      )}

      {/* 수정 모달 */}
      {selectedDoctor && (
        <EditDoctorModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onUpdated={refetch}
        />
      )}
    </div>
  );
}