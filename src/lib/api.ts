// src/lib/api.ts
//──────────────────────────────────────────────────────────────────────────────
// 공통 axios 인스턴스 불러오기
import api from './axios';

/**
 * 로그인 요청 페이로드
 */
export interface LoginPayload {
  role: 'doctor' | 'admin';              // 사용자 역할
  hospital_id: string | number;          // 병원 ID
  password: string;                      // 로그인 비밀번호
  license_number?: string | null;        // (의사) 면허 번호
  department?: string | null;            // (의사) 진료 과목
}

/**
 * 로그인 성공 응답 (관리자 및 의사 공용)
 */
export interface LoginResponse {
  access_token: string;                  // JWT 액세스 토큰
  firebase_token: string;                // Firebase 커스텀 토큰
  token_type: 'bearer';                  // 토큰 타입
  // role에 따라 반환 객체 포함
  admin?: {                              // 관리자 로그인 시
    hospital_id: number;
  };
  doctor?: {                             // 의사 로그인 시
    name: string;
    email: string;
    department: string;
    hospital_id: number;
  };
}

/**
 * 관리자/의사 로그인
 * POST /login
 */
export const login = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/login', payload);
  return response.data;
};

/**
 * 병원 목록 조회
 * GET /hospitals
 */
export const getHospitals = async (): Promise<any[]> => {
  const response = await api.get<{ hospitals: any[] }>('/hospitals');
  return response.data.hospitals;
};

/**
 * 의사 목록 조회
 * GET /doctors
 */
export const getDoctors = async (): Promise<any[]> => {
  const response = await api.get<{ doctors: any[] }>('/doctors');
  return response.data.doctors;
};

/**
 * 의사 신규 생성
 * POST /doctors
 */
export const createDoctor = async (
  payload: Record<string, any>  // { name, gender, email, department, contact, hospital_id, password }
): Promise<any> => {
  const response = await api.post('/doctors', payload);
  return response.data;
};

/**
 * 의사 정보 수정
 * PATCH /doctors/{license_number}
 */
export const updateDoctor = async (
  license_number: string,
  payload: Record<string, any>  // { password, hospital_id, availability, contact, department, profile_url, email }
): Promise<any> => {
  const response = await api.patch(
    `/doctors/${license_number}`,
    payload
  );
  return response.data;
};

/**
 * 의사 정보 삭제
 * DELETE /doctors/{license_number}
 */
export const deleteDoctor = async (
  licenseNumber: string
): Promise<any> => {
  const response = await api.delete(
    `/doctors/${licenseNumber}`
  );
  return response.data;
};

/**
 * 질병 목록 조회
 * GET /diseases
 */
export const getDiseases = async (): Promise<any[]> => {
  const response = await api.get<{ diseases: any[] }>('/diseases');
  return response.data.diseases;
};

/**
 * 영상 통화 방 생성
 * POST /create
 */
export const createCallRoom = async (
  payload: Record<string, any> // { doctor_id, patient_id, created_at, status }
): Promise<any> => {
  const response = await api.post('/create', payload);
  return response.data;
};

/**
 * 영상 통화 시작 알림
 * POST /start
 */
export const startCall = async (
  payload: Record<string, any> // { room_id, doctor_id, patient_id }
): Promise<any> => {
  const response = await api.post('/start', payload);
  return response.data;
};

/**
 * 응답(Answer) 전송
 * POST /answer
 */
export const postAnswer = async (
  payload: Record<string, any> // { room_id, answer_sdp }
): Promise<any> => {
  const response = await api.post('/answer', payload);
  return response.data;
};

/**
 * 통화 거절 처리
 * POST /reject
 */
export const postReject = async (
  payload: Record<string, any> // { room_id, reason }
): Promise<any> => {
  const response = await api.post('/reject', payload);
  return response.data;
};

/**
 * 통화 종료 처리
 * POST /end
 */
export const endCall = async (
  payload: Record<string, any> // { room_id }
): Promise<any> => {
  const response = await api.post('/end', payload);
  return response.data;
};

/**
 * 통화 메시지 저장
 * POST /text
 */
export const saveCallText = async (
  callId: string,
  text: string
): Promise<any> => {
  const payload = {
    call_id: callId,
    text,
  };
  const response = await api.post('/text', payload);
  return response.data;
};

/**
 * 대기 중인 진료 요청 조회
 * GET /care-requests/waiting
 */
export const getWaitingCareRequests = async (): Promise<any[]> => {
  const response = await api.get<{ waiting_list: any[] }>('/care-requests/waiting');
  return response.data.waiting_list;
};

/**
 * 진료 완료 처리
 * PUT /care-requests/{request_id}/complete
 */
export const completeRequest = async (
  requestId: number
): Promise<any> => {
  const response = await api.put(
    `/care-requests/${requestId}/complete`
  );
  return response.data;
};

/**
 * 진료 요청 상세 조회
 * GET /care-requests/{request_id}
 */
export const getCareRequestDetail = async (
  requestId: number
): Promise<any> => {
  const response = await api.get(
    `/care-requests/${requestId}`
  );
  return response.data;
};

/**
 * 약품 목록 조회
 * GET /drugs
 */
export const getDrugs = async (): Promise<any[]> => {
  const response = await api.get<{ drugs: any[] }>('/drugs');
  return response.data.drugs;
};

/**
 * 처방전 등록
 * POST /prescriptions
 */
export const registerPrescription = async (
  payload: Record<string, any> // { diagnosis_id, medications }
): Promise<any> => {
  const response = await api.post('/prescriptions', payload);
  return response.data;
};

/**
 * 전체 진단 기록 조회
 * GET /diagnosis
 */
export const getAllDiagnosis = async (): Promise<any[]> => {
  const response = await api.get<{ diagnosis_records: any[] }>('/diagnosis');
  return response.data.diagnosis_records;
};

/** 진단 기록 등록에 사용할 페이로드 타입 정의 */
export interface DiagnosisPayload {
  doctor_id:      string | number; // 진단한 의사
  patient_id:     string | number; // 진단받은 환자
  disease_code:   string[];          // 해당 소견의 질병 분류 코드
  diagnosis_text: string;          // 세부 소견
  request_id?:    number;          // care-request ID
  summary_text?:  string;          // 요약 텍스트
  symptoms?:      string[];        // 증상 목록
}

 /**  진단 기록 등록 POST /diagnosis */
 export const createDiagnosis = async (
  payload: DiagnosisPayload
): Promise<{
  message: string;
  diagnosis_id: number;
}> => {
  const response = await api.post('/diagnosis', payload);
  return response.data;
};

/**
 * 특정 환자 진단 기록 조회
 * GET /diagnosis/patient/{patient_id}
 */
export const getPatientDiagnosis = async (
  patientId: string
): Promise<any[]> => {
  const response = await api.get<{ diagnosis_records: any[] }>(
    `/diagnosis/patient/${patientId}`
  );
  return response.data.diagnosis_records;
};