// src/components/doctor/DoctorConsultTab.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  getCareRequestDetail,
  getPatientDiagnosis,
  startCall as apiStartCall,
  endCall,
  completeRequest,
} from '@/lib/api';
import VideoCallRoom from '@/components/doctor/consult/VideoCallRoom';
import PastDiagnosisList from '@/components/doctor/consult/PastDiagnosisList';

interface Props {
  doctorId: string;
  requestId: number;
  roomId: string;
}

export default function DoctorConsultTab({ doctorId, requestId, roomId }: Props) {
  // 1) 환자 기본 정보
  const [patientInfo, setPatientInfo]         = useState<any>(null);
  // 2) 과거 진료 기록
  const [diagnosisRecords, setDiagnosisRecords] = useState<any[]>([]);
  // 3) WebRTC 제어 핸들러
  const [callActions, setCallActions]         = useState<{ startCall(): void; stopCall(): void } | null>(null);

  // 환자 정보 조회
  useEffect(() => {
    getCareRequestDetail(requestId)
      .then(data => setPatientInfo(data))
      .catch(console.error);
  }, [requestId]);

  // 과거 진료 기록 조회
  useEffect(() => {
    if (!patientInfo?.patient_id) return;
    getPatientDiagnosis(String(patientInfo.patient_id))
      .then(list => setDiagnosisRecords(list))
      .catch(console.error);
  }, [patientInfo]);

  // 영상 진료 시작
  const handleStartCall = async () => {
    callActions?.startCall();
    try {
      await apiStartCall({ room_id: roomId, doctor_id: doctorId, patient_id: patientInfo.patient_id });
      alert('환자에게 통화 요청을 보냈습니다.');
    } catch (err) {
      console.error('영상 진료 시작 오류:', err);
      alert('통화 요청에 실패했습니다.');
    }
  };

  // 영상 진료 종료
  const handleStopCall = async () => {
    callActions?.stopCall();
    try {
      await endCall({ room_id: roomId });
    } catch (err) {
      console.error('영상 진료 종료 오류:', err);
    }
  };

  // 진료 완료
  const handleComplete = async () => {
    try {
      await completeRequest(requestId);
      alert('진료를 종료했습니다.');
    } catch (err) {
      console.error('진료 완료 오류:', err);
      alert('진료 종료 처리에 실패했습니다.');
    }
  };

  return (
    <div className="flex gap-4">
      {/* 좌측: 환자 정보 + 과거 진료 기록 */}
      <div className="w-3/5 space-y-6">
        {patientInfo ? (
          <table className="table-auto w-full">
            <tbody>
              <tr><th>이름</th><td>{patientInfo.name}</td></tr>
              <tr><th>생년월일</th><td>{patientInfo.birth_date}</td></tr>
              <tr><th>연락처</th><td>{patientInfo.contact}</td></tr>
            </tbody>
          </table>
        ) : (
          <div>로딩 중…</div>
        )}
        <PastDiagnosisList records={diagnosisRecords} />
      </div>

      {/* 우측: 영상 진료 UI + 제어 버튼 */}
      <div className="w-2/5 bg-white p-4 rounded shadow flex flex-col justify-between">
        {patientInfo?.patient_id && (
          <VideoCallRoom
            doctorId={doctorId}
            patientId={patientInfo.patient_id}
            roomId={roomId}
            onCallReady={actions => setCallActions(actions)}
          />
        )}
        <div className="mt-4 flex justify-center space-x-4">
          <button onClick={handleStartCall} className="bg-green-600 text-white px-4 py-2 rounded">
            영상 진료 시작
          </button>
          <button onClick={handleStopCall} className="bg-red-500 text-white px-4 py-2 rounded">
            영상 진료 종료
          </button>
          <button onClick={handleComplete} className="bg-gray-700 text-white px-4 py-2 rounded">
            진료 종료
          </button>
        </div>
      </div>
    </div>
  );
}