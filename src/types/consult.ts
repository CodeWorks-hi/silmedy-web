// src/types/consult.ts

/**
 * DoctorConsultTab 컴포넌트에 전달되는 기본 파라미터들
 */
export interface DoctorConsultTabProps {
    doctorId: string;   // 의사 사용자 ID
    requestId: number;  // 진료 요청(케어 요청) ID
    roomId: string;     // WebRTC 영상 통화용 룸 ID
  }
  
  /**
   * 질병 목록 API로부터 받아오는 질병 항목 구조
   */
  export interface Disease {
    similar_id: string; // 질병 고유 코드
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
    disease: string;  // 선택된 질병 코드(similar_id)
    drug:    string;  // 선택된 의약품 표시 문자열(코드+명)
    days:    number;  // 복용 일수 또는 일일 복용 횟수
    amount:  number;  // 1회 투여량
    method:  string;  // 복용 방식/용법
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