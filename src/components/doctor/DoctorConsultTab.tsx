'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getCareRequestDetail,
  startCall as apiStartCall,
  endCall,
  completeRequest,
  getDiseases,   // ← 여기에 추가
  getDrugs,      // ← 여기에 추가
  registerPrescription,
} from '@/lib/api';
import VideoCallRoom from '@/components/doctor/consult/VideoCallRoom';
import PastDiagnosisSection from '@/components/doctor/consult/PastDiagnosisSection'; // ✅ 과거 진료 기록 조회 + 표시

interface Props {
  doctorId: string;
  requestId: number;
  roomId: string;
}

interface Disease {
  similar_id: string;
  name_ko:    string;
}

interface Drug {
  drug_id: number;
  atc_code: string;
  medication_amount: number;
  medication_method: string;
  name: string;
}

interface Prescription {
  disease: string;
  drug: string;
  days: number;
  amount: number;
  method: string;
}

export default function DoctorConsultTab({ doctorId, requestId, roomId }: Props) {
  // 🔹 환자 정보 상태
  const [patientInfo, setPatientInfo] = useState<any>(null);

  // 🔹 WebRTC 통화 제어 함수 상태
  const [callActions, setCallActions] = useState<{
    startCall(): void;
    stopCall(): void;
  } | null>(null);

  // ★ 의사소견 메모 상태
  const [consultMemo, setConsultMemo] = useState<string>('');

  // ★ New: 질병/의약품/투약일수 관련 상태
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string>('');
  const [selectedDrug, setSelectedDrug]       = useState<string>('');
  const [days, setDays]                       = useState<number>(1);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

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

  // ★ New: 질병 목록 가져오기
  useEffect(() => {
    getDiseases()
      .then(list => setDiseases(list))
      .catch(err => console.error('질병 조회 실패:', err));
  }, []);

  // ★ New: 의약품 목록 가져오기
  useEffect(() => {
        getDrugs()
          .then(list => setDrugs(list))
          .catch(err => console.error('의약품 조회 실패:', err));
  }, []);

  const handleRegisterPrescription = () => {
    if (!selectedDisease || !selectedDrug || days < 1) return;
  
    // drug 리스트에서 선택된 약 찾기
    const found = drugs.find(d => `${d.atc_code}` === selectedDrug.split(' ')[0]);

    const amount = found?.medication_amount ?? 1;
    const method = found?.medication_method ?? '';
  
    setPrescriptions(p => [
      ...p,
      {
        disease: selectedDisease,
        drug: selectedDrug,
        days,
        amount,
        method,
      },
    ]);
  
    // 초기화
    setSelectedDisease('');
    setSelectedDrug('');
    setDays(1);
  };

  // ★ New: 처방전 전체 전송
  const handleSendAllPrescriptions = async () => {
    if (prescriptions.length === 0 || !patientInfo) return;
    try {
      await registerPrescription({
        diagnosis_id: patientInfo.latestDiagnosisId,  // 실제 field 이름으로 맞춰 주세요
        doctor_id: doctorId,
        medication_days: prescriptions.map(p => p.days),
        medication_list: prescriptions.map(p => ({
          disease_id: p.disease, 
          drug_id:    p.drug,
        })),
      });
      alert('처방전이 전송되었습니다.');
      setPrescriptions([]);
    } catch (err) {
      console.error('처방전 전송 실패', err);
      alert('처방전 전송에 실패했습니다.');
    }
  };

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
            <div className="text-sm text-gray-500">
              환자 정보를 불러오는 중입니다...
            </div>
          )}
        </div>

        {/* ✅ 과거 진료 기록 조회 + 렌더링 */}
        {patientInfo?.patient_id && (
          <PastDiagnosisSection patientId={patientInfo.patient_id} />
        )}

        {/* ★ 의사소견 메모 - 과거진단 바로 밑 */}
        {patientInfo?.patient_id && (
          <div className="bg-white rounded shadow p-4">
            <label htmlFor="consultMemo" className="block font-semibold mb-2">
              의사소견
            </label>
            <textarea
              id="consultMemo"
              rows={4}
              value={consultMemo}
              onChange={e => setConsultMemo(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="환자 상태 및 소견을 입력하세요"
            />
          </div>
        )}
        {/* ★ 처방전 입력 섹션 (콤보박스 + 전송 버튼) */}
        {patientInfo?.patient_id && (
          <div className="bg-white rounded shadow p-4 space-y-4">
            <h3 className="font-semibold text-lg">처방전 등록</h3>

            {/* 입력 폼 */}
            <div className="grid grid-cols-4 gap-4 items-end">
              {/* 병명 코드 */}
              <div>
                <label htmlFor="disease-input" className="block text-sm mb-1">
                  병명 코드
                </label>
                <input
                  list="disease-list"
                  id="disease-input"
                  className="w-full border rounded p-2"
                  placeholder="코드 또는 이름 입력"
                  value={selectedDisease}
                  onChange={e => setSelectedDisease(e.target.value)}
                />
                <datalist id="disease-list">
                  <option value="">— 선택 —</option>
                  {diseases.map(d => (
                    <option key={d.similar_id} value={d.similar_id}>
                      {d.similar_id} {d.name_ko}
                    </option>
                  ))}
                </datalist>
              </div>

              {/* 처방 의약품 */}
              <div>
                <label htmlFor="drug-input" className="block text-sm mb-1">
                  처방 의약품
                </label>
                <input
                  list="drug-list"
                  id="drug-input"
                  className="w-full border rounded p-2"
                  placeholder="코드 또는 이름 입력"
                  value={selectedDrug}
                  onChange={e => setSelectedDrug(e.target.value)}
                />
                <datalist id="drug-list">
                  <option value="">— 선택 —</option>
                  {drugs.map(d => (
                    <option
                      key={d.drug_id}
                      value={`${d.atc_code} ${d.name}`}
                    />
                  ))}
                </datalist>
              </div>

              {/* 투약 일수 */}
              <div>
                <label htmlFor="days-input" className="block text-sm mb-1">
                  투약 일수
                </label>
                <input
                  id="days-input"
                  type="number"
                  min={1}
                  className="w-full border rounded p-2"
                  value={days}
                  onChange={e => setDays(Number(e.target.value))}
                />
              </div>

              {/* 개별 등록 버튼 */}
              <div>
                <button
                  type="button"
                  onClick={handleRegisterPrescription}
                  className="mt-1 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition-opacity disabled:opacity-50"
                  disabled={!selectedDisease || !selectedDrug || days < 1}
                >
                  등록
                </button>
              </div>
            </div>

            {/* ★ 등록된 처방전 리스트 */}
            {prescriptions.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse mt-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-3 py-2">의약품 코드</th>
                      <th className="border px-3 py-2">병명 코드</th>
                      <th className="border px-3 py-2">일일 복용 횟수</th>
                      <th className="border px-3 py-2">1회 투여량</th>
                      <th className="border px-3 py-2">투약 일수</th>
                      <th className="border px-3 py-2">용법·용량</th>
                      <th className="border px-3 py-2">액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((p, i) => (
                      <tr key={i} className="even:bg-gray-50">
                        {/* drug: "69200120 타이레놀 500mg" 형식이라면 split 후 첫 부분만 */}
                        <td className="border px-3 py-2">
                          {p.drug.split(' ')[0]}
                        </td>

                        <td className="border px-3 py-2">{p.disease}</td>

                        {/* days 는 “일일 복용 횟수”로 쓴 경우, 
                            만약 ‘투약 일수’라면 위치를 변경하세요 */}
                        <td className="border px-3 py-2 text-center">3</td>
                        {/* 1회 투여량 */}
                        <td className="border px-3 py-2 text-center">{p.amount}</td>
                        {/* 투약 일수 (위에서 사용한 days 와 구분하려면 days→duration 등으로 rename 가능) */}
                        <td className="border px-3 py-2 text-center">{p.days}</td>
                        {/* 용법·용량 */}
                        <td className="border px-3 py-2">{p.method}</td>

                        {/* 삭제 버튼 */}
                        <td className="border px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setPrescriptions(ps =>
                                ps.filter((_, idx) => idx !== i)
                              )
                            }
                            className="text-red-500 hover:underline"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ───────── 처방전 전송 버튼 ───────── */}
            <div className="flex justify-center pt-6">
              <button
                type="button"
                onClick={handleSendAllPrescriptions}
                disabled={prescriptions.length === 0}
                className="bg-teal-400 hover:bg-teal-500 text-white px-8 py-3 rounded-lg disabled:opacity-50 transition-opacity"
              >
                처방전 전송
              </button>
            </div>
          </div>
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