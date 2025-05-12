// src/pages/doctor/dashboard.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookie from 'js-cookie';
import { useRequireAuth } from '@/features/hooks/useRequireAuth';
import DoctorWaitingTab from '@/components/doctor/DoctorWaitingTab';
import DoctorConsultTab from '@/components/doctor/DoctorConsultTab';

export default function DoctorDashboard() {
  const router = useRouter();

  // ─── 1) Hooks: 항상 최상단에서 호출 ───────────────────────────────
  // Firebase 로그인 상태 확인용 훅
  const { loading, isAuthenticated } = useRequireAuth();
  // 탭 UI 상태 ('waiting' or 'consult')
  const [activeTab, setActiveTab] = useState<'waiting' | 'consult'>('waiting');
  // 선택된 요청 ID(request_id)와 환자 ID(patient_id), 생성된 방 ID 상태
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | number | null>(null);
  const [callRoomId, setCallRoomId] = useState<string | null>(null);

  // ─── 2) 인증(Authentication) 검사 ─────────────────────────────────
  if (loading) {
    // 로그인 확인 중
    return <div className="p-8 text-center">인증 확인 중…</div>;
  }
  if (!isAuthenticated) {
    // 비로그인 상태면 로그인 페이지로
    router.replace('/auth/login');
    return null;
  }

  // ─── 3) 인가(Authorization) 검사 ────────────────────────────────
  const role = Cookie.get('role');       // 'doctor' 여야 함
  const doctorId = Cookie.get('doctor_id');  // ID가 있어야 함
  if (role !== 'doctor' || !doctorId) {
    alert('의사 권한이 필요합니다.');
    router.replace('/auth/login');
    return null;
  }

  // ─── 4) 이벤트 핸들러 정의 ────────────────────────────────────
  // 이제 row 객체를 받아서 request_id와 patient_id를 분리합니다.
  const handleSelectRequest = async ({
    request_id,
    patient_id,
  }: {
    request_id: number;
    patient_id: string | number;
  }) => {
    // 현재 시각 포맷팅
    const now = new Date();
    const formatted =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` +
      ` ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    try {
      // 방 생성 API 호출 (import 동적 or import 상단)
      const { createCallRoom } = await import('@/lib/api');
      const res = await createCallRoom({
        doctor_id: doctorId,
        patient_id: patient_id,  
        created_at: formatted,
        status: 'waiting',
      });
      setCallRoomId(res.id);
      setSelectedRequestId(request_id);
      setSelectedPatientId(patient_id);
      setActiveTab('consult');
    } catch (err) {
      console.error('방 생성 실패:', err);
      alert('영상 진료방 생성에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    Cookie.remove('role');
    Cookie.remove('doctor_id');
    router.replace('/auth/login');
  };

  // ─── 5) 렌더링 ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cyan-100 p-8">
      {/* 탭 네비게이션 + 로그아웃 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'waiting'
                ? 'bg-white border-b-2 border-cyan-500 font-bold'
                : 'bg-gray-100'
              }`}
            onClick={() => setActiveTab('waiting')}
          >
            대기 환자 목록
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'consult'
                ? 'bg-white border-b-2 border-cyan-500 font-bold'
                : 'bg-gray-100'
              }`}
            onClick={() => setActiveTab('consult')}
            disabled={!callRoomId}
          >
            영상 진료
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:underline"
        >
          로그아웃
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'waiting' && doctorId && (
          <DoctorWaitingTab
            doctorId={doctorId}
            onSelectRequest={handleSelectRequest}
          />
        )}
        {activeTab === 'consult' &&
          selectedRequestId !== null && selectedPatientId !== null &&
          callRoomId && (
            <DoctorConsultTab
              doctorId={doctorId!}
              doctorName={localStorage.getItem('doctor_name')!}
              requestId={selectedRequestId}
              roomId={callRoomId}
              hospitalId={Number(Cookie.get('hospital_id'))}
            />
          )}
      </div>
    </div>
  );
}