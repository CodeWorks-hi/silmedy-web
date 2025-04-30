'use client';

import { useState, useEffect } from 'react';
import DoctorWaitingTab from '@/components/doctor/DoctorWaitingTab';
import DoctorConsultTab from '@/components/doctor/consult/DoctorConsultTab';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState<'waiting' | 'consult'>('waiting');
  const [selectedPatientId, setSelectedPatientId] = useState<string | number | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const storedDoctorId = localStorage.getItem('doctor_id');
    if (storedDoctorId) {
      setDoctorId(storedDoctorId);
      console.log('✅ doctorId 불러오기:', storedDoctorId);
    } else {
      console.warn('❗ doctorId 없음');
    }
  }, []);

  useEffect(() => {
    console.log('📌 현재 탭:', activeTab);
    console.log('📌 선택된 환자 ID:', selectedPatientId);
  }, [activeTab, selectedPatientId]);

  if (!doctorId) {
    return <div>의사 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cyan-100 p-8">
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

      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'waiting' && (
          <DoctorWaitingTab
            doctorId={doctorId}
            onSelectPatient={(id) => {
              console.log('👨‍⚕️ 진료 시작 환자 ID:', id);
              setSelectedPatientId(id);
              setActiveTab('consult');
            }}
          />
        )}

        {activeTab === 'consult' && selectedPatientId && (
          <DoctorConsultTab
            doctorId={doctorId}
            patientId={selectedPatientId}
          />
        )}
      </div>
    </div>
  );
}