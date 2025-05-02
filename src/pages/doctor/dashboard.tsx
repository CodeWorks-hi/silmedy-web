'use client';

import { useRequireAuth } from '@/features/hooks/useRequireAuth';
import DoctorWaitingTab from '@/components/doctor/DoctorWaitingTab';
import DoctorConsultTab from '@/components/doctor/consult/DoctorConsultTab';
import axios from '@/lib/axios';
import { useState, useEffect } from 'react';

export default function DoctorDashboard() {
  const { loading, isAuthenticated } = useRequireAuth();

  const [doctorId, setDoctorId]       = useState<string | null>(null);
  const [activeTab, setActiveTab]     = useState<'waiting' | 'consult'>('waiting');
  const [selectedRequestId, setRequest] = useState<number | null>(null);
  const [callRoomId, setCallRoomId]   = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('doctor_id');
    if (stored) setDoctorId(stored);
  }, []);

  if (loading) return <div>인증 확인 중…</div>;
  if (!isAuthenticated || !doctorId) return <div>접근 권한이 없습니다.</div>;

  // “진료 시작” 클릭 시 방 생성 → 탭 전환
  const handleSelectRequest = async (requestId: number) => {
    try {
      const payload = {
        doctor_id:  doctorId,
        patient_id: requestId,
        created_at: new Date().toISOString(),
        status:     'waiting',
      };
      const res = await axios.post('/api/v1/video-call/create', payload);
      setCallRoomId(res.data.id);
      setRequest(requestId);
      setActiveTab('consult');
    } catch (err) {
      console.error('❌ 방 생성 실패:', err);
      alert('영상 진료방 생성에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cyan-100 p-8">
      {/* 탭 네비게이션 */}
      <div className="flex space-x-4 mb-8">
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'waiting'
              ? 'bg-white border-b-2 border-cyan-500 font-bold'
              : 'bg-gray-100'
          }`}
          onClick={() => setActiveTab('waiting')}
        >
          대기 환자 목록
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'consult'
              ? 'bg-white border-b-2 border-cyan-500 font-bold'
              : 'bg-gray-100'
          }`}
          onClick={() => setActiveTab('consult')}
        >
          영상진료
        </button>
      </div>

      {/* 탭 내용 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'waiting' && doctorId && (
          <DoctorWaitingTab
            doctorId={doctorId}
            onSelectRequest={handleSelectRequest}
          />
        )}

        {activeTab === 'consult' &&
         selectedRequestId !== null &&
         callRoomId && (
          <DoctorConsultTab
            doctorId={doctorId!}
            requestId={selectedRequestId}
            roomId={callRoomId}
          />
        )}
      </div>
    </div>
  );
}