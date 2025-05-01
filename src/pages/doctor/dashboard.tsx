'use client';

import { useRequireAuth } from '@/features/hooks/useRequireAuth';
import DoctorWaitingTab from '@/components/doctor/DoctorWaitingTab';
import DoctorConsultTab from '@/components/doctor/consult/DoctorConsultTab';
import { useState, useEffect } from 'react';

export default function DoctorDashboard() {
  const { loading, isAuthenticated } = useRequireAuth();

  const [activeTab, setActiveTab] = useState<'waiting' | 'consult'>('waiting');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const storedDoctorId = localStorage.getItem('doctor_id');
    if (storedDoctorId) {
      setDoctorId(storedDoctorId);
    }
  }, []);

  if (loading) {
    return <div className="text-center mt-10">인증 확인 중...</div>;
  }

  if (!isAuthenticated || !doctorId) {
    return <div className="text-center mt-10">접근 권한이 없습니다.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cyan-100 p-8">
      {/* 탭 UI */}
      <div className="flex space-x-4 mb-8">
        <button
          className={`px-4 py-2 rounded-t-lg ${activeTab === 'waiting' ? 'bg-white border-b-2 border-cyan-500 font-bold' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('waiting')}
        >
          대기 환자 목록
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${activeTab === 'consult' ? 'bg-white border-b-2 border-cyan-500 font-bold' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('consult')}
        >
          영상진료
        </button>
      </div>

      {/* 본문 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'waiting' && (
          <DoctorWaitingTab
            doctorId={doctorId}
            onSelectRequest={(requestId) => {
              setSelectedRequestId(requestId);
              setActiveTab('consult');
            }}
          />
        )}
        {activeTab === 'consult' && selectedRequestId !== null && (
          <DoctorConsultTab doctorId={doctorId} requestId={selectedRequestId} />
        )}
      </div>
    </div>
  );
}