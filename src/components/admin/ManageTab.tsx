'use client';

import React, { useState } from 'react';
import { useDoctors, Doctor } from '@/features/hooks/useDoctors';
import EditDoctorModal from '@/components/admin/EditDoctorModal';

export default function ManageTab() {
  // 의사 데이터, 로딩, 에러, 삭제·재조회 함수 제공
  const { doctors, loading, error, deleteDoctor, refetch } = useDoctors();
  // 수정할 의사 정보 상태
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  return (
    <div>
      {/* 제목 */}
      <h2 className="text-2xl font-bold mb-6">직원 관리</h2>

      {/* 로딩 및 에러 표시 */}
      {loading && <div className="text-center text-gray-500">불러오는 중...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}

      {/* 데이터 테이블 */}
      {!loading && !error && (
        <div className="overflow-auto max-h-[600px]">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">사진</th>
                <th className="px-4 py-2 border">이름</th>
                <th className="px-4 py-2 border">성별</th>
                <th className="px-4 py-2 border">이메일</th>
                <th className="px-4 py-2 border">과</th>
                <th className="px-4 py-2 border">연락처</th>
                <th className="px-4 py-2 border">관리</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor: Doctor) => (
                <tr key={doctor.license_number}>
                  <td className="px-4 py-2 border">
                    <img
                      src={doctor.profile_url || '/default-profile.png'}
                      alt="profile"
                      className="w-10 h-10 rounded-full mx-auto"
                    />
                  </td>
                  <td className="px-4 py-2 border">{doctor.name}</td>
                  <td className="px-4 py-2 border">{doctor.gender}</td>
                  <td className="px-4 py-2 border">{doctor.email}</td>
                  <td className="px-4 py-2 border">{doctor.department}</td>
                  <td className="px-4 py-2 border">{doctor.contact}</td>
                  <td className="px-4 py-2 border space-x-2">
                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => {
                        if (confirm('정말 삭제하시겠습니까?')) {
                          deleteDoctor(doctor.license_number);
                        }
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md text-sm"
                    >
                      삭제
                    </button>
                    {/* 수정 모달 열기 버튼 */}
                    <button
                      onClick={() => setSelectedDoctor(doctor)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
                    >
                      수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
