'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import VideoCallRoom from './VideoCallRoom';
import PastDiagnosisList from './PastDiagnosisList';

interface DoctorConsultTabProps {
  doctorId: string;
  requestId: number;
}

export default function DoctorConsultTab({ doctorId, requestId }: DoctorConsultTabProps) {
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [diagnosisRecords, setDiagnosisRecords] = useState([]);
  const [callActions, setCallActions] = useState<{ startCall: () => void; stopCall: () => void } | null>(null);

  // 🔵 통화 시작
  const handleStartCall = () => {
    if (callActions) callActions.startCall();
  };

  // 🔴 통화 종료
  const handleStopCall = () => {
    if (callActions) callActions.stopCall();
  };

  // 🟠 진료 종료
  const handleCompleteConsult = async () => {
    try {
      await axios.patch(`/api/v1/care-requests/${requestId}/complete`);
      alert('진료 종료되었습니다.');
    } catch (err) {
      console.error('❌ 진료 종료 실패:', err);
      alert('진료 종료 중 오류가 발생했습니다.');
    }
  };

  // ✅ 진료 요청 상세 조회 (환자 정보 포함)
  useEffect(() => {
    async function fetchCareRequestDetail() {
      try {
        const res = await axios.get(`/api/v1/care-requests/${requestId}`);
        const data = res.data;
        setPatientInfo({
          name: data.name,
          birth_date: data.birth_date,
          contact: data.contact,
          patient_id: data.patient_id // 🔴 반드시 필요
        });
      } catch (err) {
        console.error('❌ 환자 정보 로딩 실패:', err);
      }
    }

    fetchCareRequestDetail();
  }, [requestId]);

  // ✅ 진단 기록 불러오기
  useEffect(() => {
    async function fetchDiagnosisRecords() {
      try {
        const res = await axios.get(`/api/v1/diagnosis/patient/${patientInfo?.patient_id}`);
        setDiagnosisRecords(res.data.diagnosis_records || []);
      } catch (err) {
        console.error('❌ 진단 기록 로딩 실패:', err);
      }
    }

    if (patientInfo?.patient_id) {
      fetchDiagnosisRecords();
    }
  }, [patientInfo?.patient_id]);

  return (
    <div className="flex gap-4">
      {/* 왼쪽 영역 - 환자 정보 및 기록 */}
      <div className="w-3/5 space-y-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">🧑‍⚕️ 진료중 환자</h2>
          {patientInfo ? (
            <table className="table-auto text-left w-full">
              <tbody>
                <tr>
                  <th className="py-1 w-24">이름</th>
                  <td>{patientInfo.name}</td>
                </tr>
                <tr>
                  <th className="py-1">생년월일</th>
                  <td>{patientInfo.birth_date}</td>
                </tr>
                <tr>
                  <th className="py-1">연락처</th>
                  <td>{patientInfo.contact}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div>로딩 중...</div>
          )}
        </div>

        <PastDiagnosisList records={diagnosisRecords} />
      </div>

      {/* 오른쪽 영역 - 영상진료 및 제어 */}
      <div className="w-2/5 bg-white p-4 rounded shadow flex flex-col justify-between">
        <div className="relative">
          <VideoCallRoom
            doctorId={doctorId}
            patientId={patientInfo?.patient_id}
            onCallReady={(actions) => setCallActions(actions)} // ✅ 버튼 연결
          />
        </div>

        {/* 제어 버튼 */}
        <div className="mt-4 flex justify-center space-x-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleStartCall}>
            영상 진료 시작
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleStopCall}>
            영상 진료 종료
          </button>
          <button className="bg-gray-700 text-white px-4 py-2 rounded" onClick={handleCompleteConsult}>
            진료 종료
          </button>
        </div>
      </div>
    </div>
  );
}