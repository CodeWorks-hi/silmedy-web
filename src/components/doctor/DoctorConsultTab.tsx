'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getCareRequestDetail,        // 🩺 진료 요청 상세 조회 API
  startCall as apiStartCall,   // 📞 영상 통화 시작 API (alias)
  endCall,                      // 📴 영상 통화 종료 API
  completeRequest,              // ✅ 진료 종료 API
  getDiseases,                  // 📋 질병 목록 조회 API
  getDrugs,                     // 💊 의약품 목록 조회 API
  createPrescriptionMeta,       // 💊 의약품 목록 조회 API
  updatePrescriptionUrl,
  createDiagnosis
} from '@/lib/api';
// ──────────────────────────────────────────────────────────
// 타입 정의 임포트
// ──────────────────────────────────────────────────────────
import {
  DoctorConsultTabProps,        // 👩‍⚕️ 컴포넌트 Props 타입
  Disease,                      // 📋 질병 객체 타입
  Drug,                         // 💊 의약품 객체 타입
  Prescription,                 // 📝 화면 내 처방전 항목 타입
} from '@/types/consult';
// ──────────────────────────────────────────────────────────
// UI 컴포넌트 임포트 (한 줄씩 정리)
// ──────────────────────────────────────────────────────────
import VideoCallRoom from '@/components/doctor/consult/VideoCallRoom'           // WebRTC 영상통화 UI
import PastDiagnosisSection from '@/components/doctor/consult/PastDiagnosisSection'    // 과거 진료 기록 표시
import PatientInfoSection from '@/components/doctor/consult/PatientInfoSection'      // 환자 정보 카드
import ConsultMemoSection from '@/components/doctor/consult/ConsultMemoSection'      // 의사소견 메모 입력
import PrescriptionFormSection from '@/components/doctor/consult/PrescriptionFormSection' // 처방전 등록 폼
import PrescriptionListSection from '@/components/doctor/consult/PrescriptionListSection' // 등록된 처방전 리스트
import { usePrescriptions } from '@/features/hooks/usePrescriptions'
import { useHospitals } from '@/features/hooks/useHospitals';
import Cookie from 'js-cookie';

import html2canvas from 'html2canvas';
import { uploadToS3 } from '@/lib/upload-s3';               // ← 2) S3 업로드 헬퍼
import PrescriptionModal from '@/components/doctor/consult/PrescriptionModal';       // ← 3) Modal 컴포넌트




export default function DoctorConsultTab({
  doctorId,                     // 🔑 의사 사용자 ID
  requestId,                    // 🔑 케어 요청(진료 요청) ID
  roomId,                       // 🔑 WebRTC 룸 ID
  doctorName,
  hospitalId,
  onCompleteRequest,
}: DoctorConsultTabProps& { onCompleteRequest: () => void }) {
  // ──────────────────────────────────────────────────────────
  // 1) State 선언
  // ──────────────────────────────────────────────────────────
  const [patientInfo, setPatientInfo] = useState<any>(null)                 // 환자 정보 저장
  const [callActions, setCallActions] = useState<{ startCall(): void; stopCall(): void } | null>(null) // WebRTC 함수 저장
  const [consultMemo, setConsultMemo] = useState<string>('')              // 의사소견 메모 저장
  const [diseases, setDiseases] = useState<Disease[]>([])           // 질병 목록 저장
  const [drugs, setDrugs] = useState<Drug[]>([])              // 의약품 목록 저장
  const { prescriptions, addPrescription, removePrescription, clearPrescriptions } = usePrescriptions(drugs)
  const [savedDiagnosisId, setSavedDiagnosisId] = useState<number | null>(null);
  const [callStarted, setCallStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);   // ← 모달 열림/닫힘 상태
  const { hospitals } = useHospitals();
  const adminHospitalId = Cookie.get('hospital_id');
  const myHospital = hospitals.find(h => h.hospital_id === hospitalId);
  const [pendingPrescriptionId, setPendingPrescriptionId] = useState<number|null>(null);
  




  // ──────────────────────────────────────────────────────────
  // 2) WebRTC 준비 완료 시 start/stop 함수 전달
  // ──────────────────────────────────────────────────────────
  const handleCallReady = useCallback(
    ({ startCall, stopCall }: { startCall(): void; stopCall(): void }) => {
      console.log("📞 [ConsultTab] onCallReady! roomId:", roomId);
      setCallActions({ startCall, stopCall })                             // WebRTC 훅으로부터 start/stop 함수 수신
    },
    []
  )

  // ──────────────────────────────────────────────────────────
  // 3) 진료 요청 + 환자 정보 로딩
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    getCareRequestDetail(requestId)                                       // API 호출
      .then(data => setPatientInfo(data))                                 // 받은 데이터 state에 저장
      .catch(err => console.error('진료 요청 조회 실패:', err))
  }, [requestId])

  // ──────────────────────────────────────────────────────────
  // 4) 질병 목록 가져오기
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    getDiseases()
      .then(list => {
        setDiseases(list)
      })                                    // API로 질병 배열 저장
      .catch(err => console.error('질병 조회 실패:', err))
  }, [])

  // ──────────────────────────────────────────────────────────
  // 5) 의약품 목록 가져오기
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    getDrugs()
      .then(list => setDrugs(list))                                       // API로 약품 배열 저장
      .catch(err => console.error('의약품 조회 실패:', err))
  }, [])

  // ──────────────────────────────────────────────────────────
// 7) 등록된 처방전 전체 전송
// ──────────────────────────────────────────────────────────
const [prescriptionId, setPrescriptionId] = useState<number | null>(null);
const [doCapture, setDoCapture]       = useState(false);

const handleSendAllPrescriptions = () => {
  if (prescriptions.length === 0 || savedDiagnosisId === null) return;
  setIsModalOpen(true);
};

// ▶ 모달에서 “예” 클릭 시 실제 전송 로직
const handleConfirmSend = async () => {
  try {
    // 1) 메타 저장 → ID 발급
    const { prescription_id } = await createPrescriptionMeta({
      diagnosis_id:    savedDiagnosisId!,
      doctor_id:       doctorId,
      patient_id:      patientInfo!.patient_id,
      medication_days: prescriptions.map(p => p.days),
      medication_list: prescriptions.map(p => ({
        disease_id: p.disease,
        drug_id:    p.drug.split(' ')[0],
      })),
    });

    // 2) 상태에 ID 반영 & 캡처 트리거
    setPrescriptionId(prescription_id);
    setDoCapture(true);
  } catch (err) {
    console.error('처방전 전송 실패', err);
    alert('처방전 전송에 실패했습니다.');
  }
};

// ▶ 발급된 ID가 반영되고 캡처 플래그가 켜지면 한 번만 실행
useEffect(() => {
  if (prescriptionId !== null && doCapture) {
    (async () => {
      // 3) DOM에 찍힌 ID를 반영해서 캡처
      const el = document.getElementById('prescription-preview');
      if (!el) return;
      const canvas = await html2canvas(el);
      const blob   = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
      if (!blob) throw new Error('이미지 생성 실패');

      // 4) S3 업로드
      const key = `prescriptions/${prescriptionId}.png`;
      const url = await uploadToS3(blob, key);

      // 5) URL 업데이트
      await updatePrescriptionUrl(prescriptionId, url);

      // 6) 마무리 정리
      setIsModalOpen(false);
      alert('처방전을 성공적으로 저장했습니다.');
      clearPrescriptions();
      setDoCapture(false);
    })();
  }
}, [prescriptionId, doCapture]);
  // ──────────────────────────────────────────────────────────
  // ▶ “진단서 저장” 버튼 클릭 핸들러
  // ──────────────────────────────────────────────────────────
  const handleSaveDiagnosis = async () => {
    if (!patientInfo) return;                     // 환자 정보 없으면 리턴
    // prescriptions 배열에서 disease 코드만 모으고 중복 제거
    const allDiseaseCodes = prescriptions.map(p => p.disease);
    const uniqueDiseaseCodes = Array.from(new Set(allDiseaseCodes));
    try {
      const payload = {
        doctor_id: doctorId,                       // 의사 ID
        patient_id: patientInfo.patient_id,        // 환자 ID
        disease_code: uniqueDiseaseCodes,
        diagnosis_text: consultMemo,               // 의사 소견 텍스트
        request_id: requestId,                     // 케어 요청 ID
        summary_text: '',                          // (필요시 요약)
        symptoms: patientInfo.symptom_type || [],  // 예시로 증상 부위
      };
      const { diagnosis_id } = await createDiagnosis(payload);
      setSavedDiagnosisId(diagnosis_id);           // 저장 완료 시 ID 저장
      alert(`진단서가 저장되었습니다. (ID: ${diagnosis_id})`);
    } catch (err) {
      console.error('진단서 저장 실패', err);
      alert('진단서 저장에 실패했습니다.');
    }
  };


  // ──────────────────────────────────────────────────────────
  // 8) 영상 통화 시작 핸들러
  // ──────────────────────────────────────────────────────────
  const handleStartCall = async () => {
    console.log("🔔 [DoctorConsultTab] handleStartCall 호출!", {
      roomId,
      patientId: patientInfo?.patient_id,
      doctorId,
    });
    callActions?.startCall()                                              // WebRTC startCall 실행
    try {
      await apiStartCall({                                                // 백엔드에 시작 요청
        call_id: roomId,                                        // • room ID
        doctor_id: doctorId,                                      // • 의사 ID
        patient_id: patientInfo.patient_id,                        // • 환자 ID
        patient_fcm_token: patientInfo.fcm_token,                         // • FCM 토큰
      })
      alert('환자에게 통화 요청을 보냈습니다.')                           // 알림
      console.log("✅ apiStartCall 성공:", roomId);
      setCallStarted(true);
    } catch (err) {
      console.error('통화 요청 실패:', err)                             // 오류 로그
      alert('통화 요청에 실패했습니다.')                               // 실패 알림
    }
  }


  // ──────────────────────────────────────────────────────────
  // 9) 영상 통화 종료 핸들러
  // ──────────────────────────────────────────────────────────
  const handleStopCall = async () => {
    callActions?.stopCall()                                               // WebRTC stopCall 실행
    try {
      await endCall({ room_id: roomId })                                  // 백엔드에 종료 요청
      setCallEnded(true);
    } catch (err) {
      console.error('통화 종료 실패:', err)                             // 오류만 로깅
    }
  }

  // ──────────────────────────────────────────────────────────
  // 10) 진료 종료 핸들러
  // ──────────────────────────────────────────────────────────
  const handleComplete = async () => {
    try {
      await completeRequest(requestId)                                    // 진료 완료 API 호출
      alert('진료를 종료했습니다.')                                       // 성공 알림
      onCompleteRequest();
    } catch (err) {
      console.error('진료 완료 실패:', err)                             // 오류 로그
      alert('진료 종료 처리에 실패했습니다.')                           // 실패 알림
    }
  }

  // ──────────────────────────────────────────────────────────
  // 11) 렌더링
  // ──────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex gap-4">

        {/* ───────── 좌측 섹션: 환자 • 과거진료 • 메모 • 처방폼/리스트 • 저장/전송 버튼 ───────── */}
        <div className="w-3/5 space-y-6">
          {/* ① 환자 프로필 카드 */}
          <PatientInfoSection patientInfo={patientInfo} />

          {/* ② 과거 진료 기록 */}
          {patientInfo?.patient_id && (
            <PastDiagnosisSection patientId={patientInfo.patient_id} />
          )}

          {/* ③ 의사 소견 메모 */}
          {patientInfo?.patient_id && (
            <ConsultMemoSection memo={consultMemo} onChange={setConsultMemo} />
          )}

          {/* ④ 처방전 등록 폼 */}
          {patientInfo?.patient_id && (
            <PrescriptionFormSection
              diseases={diseases}
              drugs={drugs}
              onAdd={({ disease, drug, days, frequency }) =>
                addPrescription(disease, drug, days, frequency)
              }
            />
          )}

          {/* ⑤ 처방전 리스트 */}
          {prescriptions.length > 0 && (
            <PrescriptionListSection
              prescriptions={prescriptions}
              onRemove={removePrescription}
            />
          )}

          {/* ⑥ 저장/전송 버튼 */}
          <div className="flex justify-center space-x-4 pt-6">
            {/* ▶ 진단서 저장 */}
            <button
              onClick={handleSaveDiagnosis}
              disabled={savedDiagnosisId !== null}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              진단서 저장
            </button>

            {/* ▶ 처방전 전송 (모달 오픈) */}
            <button
              onClick={handleSendAllPrescriptions}
              disabled={
                savedDiagnosisId === null || prescriptions.length === 0
              }
              className="bg-teal-400 hover:bg-teal-500 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              처방전 전송
            </button>
          </div>
        </div>

        {/* ───────── 우측 플로팅 섹션: 영상 통화 및 제어 버튼 ───────── */}
        <div
          className="bg-white p-4 rounded shadow flex flex-col justify-end"
          style={{
            position: "fixed",
            top: "4rem",
            right: "1rem",
            width: "35%",
            height: "90vh",
            maxHeight: "100vh",
            overflow: "auto",
          }}
        >
          {patientInfo?.patient_id && (
            <VideoCallRoom
              doctorId={doctorId}
              patientId={patientInfo.patient_id}
              roomId={roomId}
              onCallReady={handleCallReady}
            />
          )}

          <div className="mt-4 flex justify-center space-x-4">
            {/* ▶ 영상 진료 시작 */}
            <button
              onClick={() => {
                console.log("▶▶▶ [ConsultTab] 버튼 클릭! roomId:", roomId);
                handleStartCall();
              }}
              disabled={callStarted}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              영상 진료 시작
            </button>

            {/* ▶ 영상 진료 종료 */}
            <button
              onClick={handleStopCall}
              disabled={!callStarted || callEnded}
              className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              영상 진료 종료
            </button>

            {/* ▶ 진료 종료 */}
            <button
              onClick={handleComplete}
              disabled={!callEnded}
              className="bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              진료 종료
            </button>
          </div>
        </div>
      </div>

      {/* ───────── 처방전 확인/전송 모달 ───────── */}
      <PrescriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSend}
        patientName={patientInfo?.name ?? ''}
        birthDate={patientInfo?.birth_date}
        prescriptions={prescriptions}
        doctorName={doctorName}
        licenseNumber={doctorId.toString()}
        hospitalName={myHospital?.name}
        hospitalAddress={myHospital?.address}
        hospitalContact={myHospital?.contact}
        prescriptionId={prescriptionId}
      />
    </>
  );
}