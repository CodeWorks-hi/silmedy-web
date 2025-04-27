/// src/pages/admin/dashboard.tsx
'use client';

import { useState } from 'react';
import { useFileUpload } from '@/features/hooks/useFileUpload';
import { useDoctors, Doctor } from '@/features/hooks/useDoctors';
import EditDoctorModal from '@/components/admin/EditDoctorModal';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
  const { selectedFile, fileData, handleFileChange, resetFile } = useFileUpload();
  const { doctors, loading, error, deleteDoctor, refetch } = useDoctors();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cyan-100 p-8">
      {/* 상단 탭 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'upload' ? 'bg-white border-b-2 border-cyan-500 font-bold' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('upload')}
          >
            직원 등록
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'manage' ? 'bg-white border-b-2 border-cyan-500 font-bold' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('manage')}
          >
            직원 관리
          </button>
        </div>
        <button className="text-sm text-gray-600 hover:underline">로그아웃</button>
      </div>

      {/* 탭 본문 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'upload' && (
          <>
            {/* 업로드 탭 내용 */}
            <h2 className="text-2xl font-bold mb-6">직원 일괄 등록</h2>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-10 mb-6 bg-gray-50 relative">
              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {selectedFile ? (
                <div className="text-gray-700">{selectedFile.name}</div>
              ) : (
                <div className="text-gray-400">파일을 선택하거나 여기로 드래그 하세요.</div>
              )}
            </div>
            {fileData.length > 0 && (
              <div className="overflow-auto max-h-96 max-w-full border rounded-md mb-8">
                <table className="min-w-max w-full text-sm text-left text-gray-500">
                  <thead className="bg-gray-100">
                    <tr>
                      {Object.keys(fileData[0]).map((header) => (
                        <th key={header} className="px-4 py-2 border">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((cell, idx2) => (
                          <td key={idx2} className="px-4 py-2 border">{String(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={resetFile}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-md"
              >
                취소하기
              </button>
              <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md">
                확인하기
              </button>
            </div>
          </>
        )}

        {activeTab === 'manage' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">직원 관리</h2>
            {loading && <div className="text-center text-gray-500">불러오는 중...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
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
                    {doctors.map((doctor) => (
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
                          <button
                            onClick={() => deleteDoctor(doctor.license_number)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md text-sm"
                          >
                            삭제
                          </button>
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
          </div>
        )}
      </div>

      {/* EditDoctorModal 표시 */}
      {selectedDoctor && (
        <EditDoctorModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onUpdated={() => refetch()}
        />
      )}
    </div>
  );
}
