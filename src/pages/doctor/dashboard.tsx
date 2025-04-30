'use client';

import { useState, useEffect } from 'react';
import DoctorWaitingTab from '@/components/doctor/DoctorWaitingTab';
import DoctorConsultTab from '@/components/doctor/consult/DoctorConsultTab';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState<'waiting' | 'consult'>('waiting');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // 🔵 doctorId 가져오기
  useEffect(() => {
    const storedDoctorId = localStorage.getItem('doctor_id');
    if (storedDoctorId) {
      setDoctorId(storedDoctorId);
      console.log('✅ doctor_id:', storedDoctorId);
    }
  }, []);

  useEffect(() => {
    console.log('📌 현재 탭:', activeTab);
    console.log('📌 선택된 진료 요청 ID:', selectedRequestId);
  }, [activeTab, selectedRequestId]);

  if (!doctorId) {
    return <div className="text-center mt-10">의사 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cyan-100 p-8">
      {/* 상단 탭 */}
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
            onSelectPatient={(requestId) => {
              console.log('🟢 진료 시작 요청 ID:', requestId);
              setSelectedRequestId(Number(requestId));
              setActiveTab('consult');
            }}
          />
        )}

        {activeTab === 'consult' && selectedRequestId !== null && (
          <DoctorConsultTab
            doctorId={doctorId}
            requestId={selectedRequestId}
          />
        )}
      </div>
    </div>
  );
}