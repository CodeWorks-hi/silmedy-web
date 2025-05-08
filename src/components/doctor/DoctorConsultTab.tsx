'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getCareRequestDetail,        // 🩺 진료 요청 상세 조회 API
  startCall  as apiStartCall,   // 📞 영상 통화 시작 API (alias)
  endCall,                      // 📴 영상 통화 종료 API
  completeRequest,              // ✅ 진료 종료 API
  getDiseases,                  // 📋 질병 목록 조회 API
  getDrugs,                     // 💊 의약품 목록 조회 API
  registerPrescription,         // 💾 처방전 일괄 등록 API
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
import VideoCallRoom           from '@/components/doctor/consult/VideoCallRoom'           // WebRTC 영상통화 UI
import PastDiagnosisSection    from '@/components/doctor/consult/PastDiagnosisSection'    // 과거 진료 기록 표시
import ConsultActionButtons    from '@/components/doctor/consult/ConsultActionButtons'    // 영상·처방·종료 버튼
import PatientInfoSection      from '@/components/doctor/consult/PatientInfoSection'      // 환자 정보 카드
import ConsultMemoSection      from '@/components/doctor/consult/ConsultMemoSection'      // 의사소견 메모 입력
import PrescriptionFormSection from '@/components/doctor/consult/PrescriptionFormSection' // 처방전 등록 폼
import PrescriptionListSection from '@/components/doctor/consult/PrescriptionListSection' // 등록된 처방전 리스트

export default function DoctorConsultTab({
  doctorId,                     // 🔑 의사 사용자 ID
  requestId,                    // 🔑 케어 요청(진료 요청) ID
  roomId,                       // 🔑 WebRTC 룸 ID
}: DoctorConsultTabProps) {
  // ──────────────────────────────────────────────────────────
  // 1) State 선언
  // ──────────────────────────────────────────────────────────
  const [patientInfo, setPatientInfo] = useState<any>(null)                 // 환자 정보 저장
  const [callActions, setCallActions] = useState<{startCall():void;stopCall():void} | null>(null) // WebRTC 함수 저장
  const [consultMemo, setConsultMemo]   = useState<string>('')              // 의사소견 메모 저장
  const [diseases, setDiseases]         = useState<Disease[]>([])           // 질병 목록 저장
  const [drugs, setDrugs]               = useState<Drug[]>([])              // 의약품 목록 저장
  const [selectedDisease, setSelectedDisease] = useState<string>('')       // 선택된 질병 코드
  const [selectedDrug, setSelectedDrug]       = useState<string>('')       // 선택된 의약품 (코드+명)
  const [days, setDays]                       = useState<number>(1)         // 투약 일수
  const [prescriptions, setPrescriptions]     = useState<Prescription[]>([])// 화면 내 처방전 리스트

  // ──────────────────────────────────────────────────────────
  // 2) WebRTC 준비 완료 시 start/stop 함수 전달
  // ──────────────────────────────────────────────────────────
  const handleCallReady = useCallback(
    ({ startCall, stopCall }: { startCall(): void; stopCall(): void }) => {
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
      .then(list => setDiseases(list))                                    // API로 질병 배열 저장
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
  // 6) 처방전 개별 등록 (폼 → 리스트에 추가)
  // ──────────────────────────────────────────────────────────
  const handleRegisterPrescription = () => {
    if (!selectedDisease || !selectedDrug || days < 1) return              // 필수 입력 검증
    const found = drugs.find(d => `${d.atc_code}` === selectedDrug.split(' ')[0]) // selectedDrug 앞부분(atc_code) 으로 조회
    const amount = found?.medication_amount ?? 1                          // 1회 투여량
    const method = found?.medication_method ?? ''                         // 용법·용량
    setPrescriptions(ps => [...ps, { disease: selectedDisease, drug: selectedDrug, days, amount, method }]) // 리스트에 추가
    setSelectedDisease(''); setSelectedDrug(''); setDays(1)               // 입력 초기화
  }

  // ──────────────────────────────────────────────────────────
  // 7) 등록된 처방전 전체 전송
  // ──────────────────────────────────────────────────────────
  const handleSendAllPrescriptions = async () => {
    if (prescriptions.length === 0 || !patientInfo) return               // 리스트 비어있거나 환자정보 없으면 종료
    try {
      await registerPrescription({                                        // 처방전 등록 API 호출
        diagnosis_id:    patientInfo.latestDiagnosisId,                   // • 진단 ID
        doctor_id:       doctorId,                                        // • 의사 ID
        medication_days: prescriptions.map(p => p.days),                  // • 투약 일수 배열
        medication_list: prescriptions.map(p => ({                         // • 처방 리스트
          disease_id: p.disease,                                          //   – 질병 코드
          drug_id:    p.drug,                                             //   – 약품 코드
        })),
      })
      alert('처방전이 전송되었습니다.')                                    // 성공 알림
      setPrescriptions([])                                                // 리스트 초기화
    } catch (err) {
      console.error('처방전 전송 실패', err)                             // 에러 로그
      alert('처방전 전송에 실패했습니다.')                               // 실패 알림
    }
  }

  // ──────────────────────────────────────────────────────────
  // 8) 영상 통화 시작 핸들러
  // ──────────────────────────────────────────────────────────
  const handleStartCall = async () => {
    callActions?.startCall()                                              // WebRTC startCall 실행
    try {
      await apiStartCall({                                                // 백엔드에 시작 요청
        call_id:           roomId,                                        // • room ID
        doctor_id:         doctorId,                                      // • 의사 ID
        patient_id:        patientInfo.patient_id,                        // • 환자 ID
        patient_fcm_token: patientInfo.fcm_token,                         // • FCM 토큰
      })
      alert('환자에게 통화 요청을 보냈습니다.')                           // 알림
    } catch (err) {
      console.error('통화 요청 실패:', err)                             // 오류 로그
      alert('통화 요청에 실패했습니다.')                               // 실패 알림
    }
  }

    // ▶ “진단서 저장” 버튼 클릭 핸들러
    const handleSaveDiagnosis = async () => {
      if (!patientInfo) return;                     // 환자 정보 없으면 리턴
      try {
        const payload = {
          doctor_id: doctorId,                       // 의사 ID
          patient_id: patientInfo.patient_id,        // 환자 ID
          disease_code: [selectedDisease],             // 선택된 병명 코드
          diagnosis_text: consultMemo,               // 의사 소견 텍스트
          request_id: requestId,                     // 케어 요청 ID
          summary_text: '',                          // (필요시 요약)
          symptoms: patientInfo.symptom_part || [],  // 예시로 증상 부위
        };
        const { diagnosis_id } = await createDiagnosis(payload);
        alert(`진단서가 저장되었습니다. (ID: ${diagnosis_id})`);
      } catch (err) {
        console.error('진단서 저장 실패', err);
        alert('진단서 저장에 실패했습니다.');
      }
    };

  // ──────────────────────────────────────────────────────────
  // 9) 영상 통화 종료 핸들러
  // ──────────────────────────────────────────────────────────
  const handleStopCall = async () => {
    callActions?.stopCall()                                               // WebRTC stopCall 실행
    try {
      await endCall({ room_id: roomId })                                  // 백엔드에 종료 요청
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
    } catch (err) {
      console.error('진료 완료 실패:', err)                             // 오류 로그
      alert('진료 종료 처리에 실패했습니다.')                           // 실패 알림
    }
  }

  // ──────────────────────────────────────────────────────────
  // 11) 렌더링
  // ──────────────────────────────────────────────────────────
  return (
    <div className="flex gap-4">

      {/* ───────── 좌측 섹션: 환자 • 과거진료 • 메모 • 처방폼/리스트 • 저장/전송 버튼 ───────── */}
      <div className="w-3/5 space-y-6">
        <PatientInfoSection patientInfo={patientInfo} />                   {/* 환자 카드 */}
        {patientInfo?.patient_id && <PastDiagnosisSection patientId={patientInfo.patient_id} />} {/* 과거 진료 */}
        {patientInfo?.patient_id && <ConsultMemoSection memo={consultMemo} onChange={setConsultMemo} />}{/* 메모 */}
        {patientInfo?.patient_id && (
          <PrescriptionFormSection
            diseases={diseases}
            drugs={drugs}
            onAdd={({ disease, drug, days }) => setPrescriptions(ps => {
              const f = drugs.find(d => d.atc_code === drug.split(' ')[0])
              return [...ps, { disease, drug, days, amount: f?.medication_amount ?? 1, method: f?.medication_method ?? '' }]
            })}
          />
        )}                                                                  {/* 처방전 폼 */}
        {prescriptions.length > 0 && (
          <PrescriptionListSection prescriptions={prescriptions} onRemove={idx => setPrescriptions(ps => ps.filter((_,i)=>i!==idx))}/>
        )}                                                                  {/* 처방전 리스트 */}
        <div className="flex justify-center space-x-4 pt-6">
          <button onClick={handleSaveDiagnosis} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">진단서 저장</button>{/* 진단서 저장 */}
          <button onClick={handleSendAllPrescriptions} disabled={prescriptions.length===0} className="bg-teal-400 hover:bg-teal-500 text-white px-6 py-2 rounded disabled:opacity-50">처방전 전송</button>{/* 처방전 전송 */}
        </div>
      </div>

      {/* ───────── 우측 섹션: 영상 통화 및 제어 버튼 ───────── */}
      <div className="w-2/5 bg-white p-4 rounded shadow flex flex-col justify-end">
        {patientInfo?.patient_id && (
          <VideoCallRoom doctorId={doctorId} patientId={patientInfo.patient_id} roomId={roomId} onCallReady={handleCallReady}/>
        )}                                                                  {/* 영상 통화 UI */}
        <div className="mt-4 flex justify-center space-x-4">
          <button onClick={handleStartCall} className="bg-green-600 text-white px-4 py-2 rounded">영상 진료 시작</button>{/* 시작 */}
          <button onClick={handleStopCall}  className="bg-red-500   text-white px-4 py-2 rounded">영상 진료 종료</button>{/* 종료 */}
          <button onClick={handleComplete}  className="bg-gray-700  text-white px-4 py-2 rounded">진료 종료</button>{/* 진료 종료 */}
        </div>
      </div>
    </div>
  )
}