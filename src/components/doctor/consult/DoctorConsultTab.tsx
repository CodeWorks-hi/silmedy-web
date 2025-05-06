'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import VideoCallRoom from './VideoCallRoom';
import PastDiagnosisList from './PastDiagnosisList';

export default function DoctorConsultTab({
  doctorId,
  requestId,
  roomId,
}:{
  doctorId: string;
  requestId: number;
  roomId:    string;
}) {
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [diagnosisRecords, setDiagnosisRecords] = useState([]);
  const [callActions, setCallActions] = useState<{
    startCall(): void;
    stopCall(): void;
  } | null>(null);

  // ❶ 환자 정보 조회
  useEffect(() => {
    axios.get(`/api/v1/care-requests/${requestId}`)
         .then(res => setPatientInfo(res.data))
         .catch(console.error);
  }, [requestId]);

  // ❷ 과거 진료 기록
  useEffect(() => {
    if (!patientInfo?.patient_id) return;
    axios.get(`/api/v1/diagnosis/patient/${patientInfo.patient_id}`)
         .then(res => setDiagnosisRecords(res.data.diagnosis_records||[]))
         .catch(console.error);
  }, [patientInfo?.patient_id]);

  // ❸ WebRTC offer 전송 + 환자 알림
  const handleStartCall = async () => {
    callActions?.startCall();
    try {
      await axios.post('/api/v1/video-call/start', {
        call_id:    roomId,
        doctor_id:  doctorId,
        patient_id: patientInfo.patient_id,
      });
      alert('환자에게 통화 요청을 보냈습니다.');
    } catch (err) {
      console.error('❌ 영상 진료 시작 오류:', err);
      alert('통화 요청에 실패했습니다.');
    }
  };

  // ❹ WebRTC 해제 / 진료 완료
  const handleStopCall = () => callActions?.stopCall();
  const handleComplete = async () => {
    await axios.patch(`/api/v1/care-requests/${requestId}/complete`);
    alert('진료를 종료했습니다.');
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
        ) : <div>로딩 중…</div>}
        <PastDiagnosisList records={diagnosisRecords} />
      </div>

      {/* 우측: 영상 진료 UI + 제어 */}
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
          <button onClick={handleStartCall}   className="bg-green-600 text-white px-4 py-2 rounded">영상 진료 시작</button>
          <button onClick={handleStopCall}    className="bg-red-500   text-white px-4 py-2 rounded">영상 진료 종료</button>
          <button onClick={handleComplete}    className="bg-gray-700  text-white px-4 py-2 rounded">진료 종료</button>
        </div>
      </div>
    </div>
  );
}