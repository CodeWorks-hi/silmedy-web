// src/types/consult.ts

/**
 * DoctorConsultTab 컴포넌트에 전달되는 기본 파라미터들
 */
export interface DoctorConsultTabProps {
    doctorId: string;   // 의사 사용자 ID
    requestId: number;  // 진료 요청(케어 요청) ID
    roomId: string;     // WebRTC 영상 통화용 룸 ID
    doctorName: string;
    hospitalId: number;
  }
  
  /**
   * 질병 목록 API로부터 받아오는 질병 항목 구조
   */
  export interface Disease {
    disease_id: string; // 질병 고유 코드
    name_ko:    string; // 질병 한글명
  }
  
  /**
   * 의약품 목록 API로부터 받아오는 의약품 항목 구조
   */
  export interface Drug {
    drug_id:             number; // 의약품 고유 ID
    atc_code:            string; // 의약품 ATC 코드
    medication_amount:   number; // 1회 투여량
    medication_method:   string; // 복용 방식/용법
    name:                string; // 의약품 명칭
  }
  
  /**
   * 화면에서 관리하는 개별 처방전 항목 구조
   */
  export interface Prescription {
    disease: string;  // 선택된 질병 코드(disease_id)
    drug:    string;  // 선택된 의약품 표시 문자열(코드+명)
    days:    number;  // 복용 일수 또는 일일 복용 횟수
    amount:  number;  // 1회 투여량
    method:  string;  // 복용 방식/용법
    frequency?: number; 
  }
  
  /**
   * ConsultActionButtons 컴포넌트에 전달되는 콜백 핸들러들
   */
  export interface ConsultActionButtonsProps {
    patientId: string | number;
    onStartVideo(): void;
    onEndVideo():   void;
    onSendPrescription(): void;
    onEndConsult(): void;
  }

  // 보건소 데이터 구조 정의
  export interface Hospital {
    name: string;
    hospital_id: number;
    address:     string;   // ← 추가
    contact:     string;   // ← 추가
  }

  export interface CareRequest {
    request_id: number;
    department: string;
    book_date: string;
    book_hour: string;
    patient_id: string | number;
    sign_language_needed: boolean;
    symptom_part: string[];
    symptom_type: string[];
    is_solved: boolean;
    doctor_id: number;
    requested_at: string;
    name?: string;
    birth_date?: string;
  }

  export interface Doctor {
    license_number: string;
    name: string;
    gender: string;
    email: string;
    department: string;
    contact: string;
    availability?: Record<string, string>;
    created_at?: string;
    password?: string;
    hospital_id?: number;
    profile_url?: string;
  }

  export interface PatientInfo {
    patient_id:    string | number;  // 환자 고유 ID
    name:          string;           // 환자 이름
    birth_date:    string;           // 생년월일 (문자열)
    contact:       string;           // 연락처
    department:    string;           // 진료과
    symptom_part?: string[];         // 증상 부위 목록
    symptom_type?: string[];         // 증상 유형 목록
  }

  export interface DiagnosisRecord {
    diagnosis_id:   string;  // 진료 기록 고유 식별자
    diagnosed_at:   string;  // 진단이 이루어진 시각 전체 문자열 (예: '2025-04-29 14:46:53')
    diagnosis_text: string;  // 진단 요약 또는 설명 텍스트
    disease_code:   string;  // 진단된 질병의 코드
  }