// components/doctor/consult/PatientInfoSection.tsx
'use client';

interface PatientInfo {
  patient_id:    string | number;  // 환자 고유 ID
  name:          string;           // 환자 이름
  birth_date:    string;           // 생년월일 (문자열)
  contact:       string;           // 연락처
  department:    string;           // 진료과
  symptom_part?: string[];         // 증상 부위 목록
  symptom_type?: string[];         // 증상 유형 목록
}

interface Props {
  patientInfo: PatientInfo | null; // 부모로부터 전달받은 환자 정보 (로딩 중에는 null)
}

export default function PatientInfoSection({ patientInfo }: Props) {
  // 환자 정보 로딩 중
  if (!patientInfo) {
    return (
      <div className="text-sm text-gray-500">
        환자 정보를 불러오는 중입니다...
      </div>
    );
  }

  // 환자 프로필 카드 렌더링
  return (
    <div className="space-y-6">
      {/* ──────────────────────────────────────────────── */}
      {/* 환자 기본 정보 카드 */}
      {/* ──────────────────────────────────────────────── */}
      <div className="bg-white rounded shadow p-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {/* 이름 */}
          <div className="flex">
            <span className="font-semibold w-24">이름</span>
            <span>{patientInfo.name}</span>
          </div>
          {/* 생년월일 */}
          <div className="flex">
            <span className="font-semibold w-24">생년월일</span>
            <span>{patientInfo.birth_date}</span>
          </div>
          {/* 연락처 */}
          <div className="flex">
            <span className="font-semibold w-24">연락처</span>
            <span>{patientInfo.contact}</span>
          </div>
          {/* 진료과 */}
          <div className="flex">
            <span className="font-semibold w-24">진료과</span>
            <span>{patientInfo.department}</span>
          </div>
          {/* 증상 부위 */}
          <div className="flex col-span-2">
            <span className="font-semibold w-24">증상 부위</span>
            <span>{(patientInfo.symptom_part || []).join(', ')}</span>
          </div>
          {/* 증상 유형 */}
          <div className="flex col-span-2">
            <span className="font-semibold w-24">증상 유형</span>
            <span>{(patientInfo.symptom_type || []).join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}