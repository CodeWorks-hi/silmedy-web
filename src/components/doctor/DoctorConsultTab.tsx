'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getCareRequestDetail,
  startCall as apiStartCall,
  endCall,
  completeRequest,
} from '@/lib/api';
import VideoCallRoom from '@/components/doctor/consult/VideoCallRoom';
import PastDiagnosisSection from '@/components/doctor/consult/PastDiagnosisSection'; // ✅ 과거 진료 기록 조회 + 표시

interface Props {
  doctorId: string;
  requestId: number;
  roomId: string;
}

export default function DoctorConsultTab({ doctorId, requestId, roomId }: Props) {
  // 🔹 환자 정보 상태
  const [patientInfo, setPatientInfo] = useState<any>(null);

  // 🔹 WebRTC 통화 제어 함수 상태
  const [callActions, setCallActions] = useState<{
    startCall(): void;
    stopCall(): void;
  } | null>(null);

  // ✅ WebRTC 준비 완료 시 콜백 핸들러 등록
  const handleCallReady = useCallback(
    ({ startCall, stopCall }: { startCall(): void; stopCall(): void }) => {
      console.log('📱 WebRTC 제어 핸들러 수신됨:', { startCall, stopCall });
      setCallActions({ startCall, stopCall });
    },
    []
  );

  // ✅ 진료 요청 + 환자 정보 로딩
  useEffect(() => {
    console.log('🩺 진료 요청 정보 조회 시작:', requestId);
    getCareRequestDetail(requestId)
      .then(data => {
        console.log('✅ 진료 요청 정보 수신:', data);
        setPatientInfo(data);
      })
      .catch(err => console.error('❌ 진료 요청 정보 조회 실패:', err));
  }, [requestId]);

  // ✅ 영상 통화 시작
  const handleStartCall = async () => {
    console.log('📞 영상 통화 시작 요청');
    callActions?.startCall();
    try {
      await apiStartCall({
        call_id: roomId,
        doctor_id: doctorId,
        patient_id: patientInfo.patient_id,
        patient_fcm_token: patientInfo.fcm_token,
      });
      alert('환자에게 통화 요청을 보냈습니다.');
    } catch (err) {
      console.error('❌ 통화 요청 실패:', err);
      alert('통화 요청에 실패했습니다.');
    }
  };

  // ✅ 영상 통화 종료
  const handleStopCall = async () => {
    console.log('📴 영상 통화 종료 요청');
    callActions?.stopCall();
    try {
      await endCall({ room_id: roomId });
    } catch (err) {
      console.error('❌ 통화 종료 실패:', err);
    }
  };

  // ✅ 진료 종료
  const handleComplete = async () => {
    console.log('✅ 진료 완료 요청:', requestId);
    try {
      await completeRequest(requestId);
      alert('진료를 종료했습니다.');
    } catch (err) {
      console.error('❌ 진료 완료 처리 실패:', err);
      alert('진료 종료 처리에 실패했습니다.');
    }
  };

  return (
    <div className="flex gap-4">
      {/* ⬅️ 좌측: 환자 정보 + 과거 진료 */}
      <div className="w-3/5 space-y-6">
        {/* ✅ 환자 정보 카드 */}
        <div className="bg-white rounded shadow p-4">
          {patientInfo ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex">
                <span className="font-semibold w-24">이름</span>
                <span>{patientInfo.name}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">생년월일</span>
                <span>{patientInfo.birth_date}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">연락처</span>
                <span>{patientInfo.contact}</span>
              </div>
              <div className="flex">
                <span className="font-semibold w-24">진료과</span>
                <span>{patientInfo.department}</span>
              </div>
              <div className="flex col-span-2">
                <span className="font-semibold w-24">증상 부위</span>
                <span>{(patientInfo.symptom_part || []).join(', ')}</span>
              </div>
              <div className="flex col-span-2">
                <span className="font-semibold w-24">증상 유형</span>
                <span>{(patientInfo.symptom_type || []).join(', ')}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">환자 정보를 불러오는 중입니다...</div>
          )}
        </div>

        {/* ✅ 과거 진료 기록 조회 + 렌더링 */}
        {patientInfo?.patient_id && (
          <PastDiagnosisSection patientId={patientInfo.patient_id} />
        )}
      </div>
      

      {/* ➡️ 우측: 영상 통화 및 제어 */}
      <div className="w-2/5 bg-white p-4 rounded shadow flex flex-col justify-between">
        {patientInfo?.patient_id && (
          <VideoCallRoom
            doctorId={doctorId}
            patientId={patientInfo.patient_id}
            roomId={roomId}
            onCallReady={handleCallReady}
          />
        )}

        {/* ✅ 영상 통화 제어 버튼 */}
        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={handleStartCall}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            영상 진료 시작
          </button>
          <button
            onClick={handleStopCall}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            영상 진료 종료
          </button>
          <button
            onClick={handleComplete}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            진료 종료
          </button>
        </div>
      </div>
    </div>
  );
}