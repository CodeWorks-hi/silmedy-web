'use client';

import { useEffect, useState, useCallback } from 'react';
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
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [diagnosisRecords, setDiagnosisRecords] = useState<any[]>([]);
  const [callActions, setCallActions] = useState<{
    startCall(): void;
    stopCall(): void;
  } | null>(null);

  // 🎯 한 번만 setCallActions
  const handleCallReady = useCallback(
    ({ startCall, stopCall }: { startCall(): void; stopCall(): void }) => {
      console.log('📱 WebRTC 제어 핸들러 수신됨:', { startCall, stopCall });
      setCallActions({ startCall, stopCall });
    },
    []
  );

  // 1) 환자 정보
  useEffect(() => {
    console.log('🩺 진료 요청 정보 조회 시작:', requestId);
    getCareRequestDetail(requestId)
      .then(data => {
        console.log('✅ 진료 요청 정보 수신:', data);
        setPatientInfo(data);
      })
      .catch(err => console.error('❌ 진료 요청 정보 조회 실패:', err));
  }, [requestId]);

  // 2) 과거 진료 기록
  useEffect(() => {
    if (!patientInfo?.patient_id) return;
    console.log('📜 환자 과거 진료 기록 조회:', patientInfo.patient_id);
    getPatientDiagnosis(String(patientInfo.patient_id))
      .then(list => {
        console.log('✅ 진료 기록 수신:', list);
        setDiagnosisRecords(list);
      })
      .catch(err => console.error('❌ 진료 기록 조회 실패:', err));
  }, [patientInfo]);

  // ▶️ 영상 통화 시작
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

  // ⏹️ 영상 통화 종료
  const handleStopCall = async () => {
    console.log('📴 영상 통화 종료 요청');
    callActions?.stopCall();
    try {
      await endCall({ room_id: roomId });
    } catch (err) {
      console.error('❌ 통화 종료 실패:', err);
    }
  };

  // ✅ 진료 완료
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
      {/* 좌측: 환자 정보 + 진료 기록 */}
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

      {/* 우측: 영상 통화 화면 */}
      <div className="w-2/5 bg-white p-4 rounded shadow flex flex-col justify-between">
        {patientInfo?.patient_id && (
          <VideoCallRoom
            doctorId={doctorId}
            patientId={patientInfo.patient_id}
            roomId={roomId}
            onCallReady={handleCallReady}
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