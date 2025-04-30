'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import PatientInfoCard from './PatientInfoCard';
import PastDiagnosisList from './PastDiagnosisList';
import ConsultActionButtons from './ConsultActionButtons';
import VideoCallRoom from './VideoCallRoom';

interface DoctorConsultTabProps {
  doctorId: string;
  requestId: number;
}

interface PatientInfo {
  name: string;
  birth_date: string;
  contact: string;
  department: string;
}

interface DiagnosisRecord {
  diagnosis_id: number;
  diagnosed_at: string;
  diagnosis_text: string;
  disease_code: string;
}

export default function DoctorConsultTab({ doctorId, requestId }: DoctorConsultTabProps) {
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [diagnosisRecords, setDiagnosisRecords] = useState<DiagnosisRecord[]>([]);
  const [patientId, setPatientId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCareRequestDetail() {
      try {
        console.log('[🔍 requestId]', requestId);
        console.log('[🔍 access_token]', localStorage.getItem('access_token'));
        const response = await axios.get(`/api/v1/care-requests/${requestId}`);
        const data = response.data;
        setPatientInfo({
          name: data.name,
          birth_date: data.birth_date,
          contact: data.contact,
          department: data.department,
        });
        setPatientId(data.patient_id);
      } catch (error) {
        console.error('❌ 환자 데이터 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    }

    if (requestId) {
      fetchCareRequestDetail();
    }
  }, [requestId]);

  useEffect(() => {
    async function fetchDiagnosisRecords() {
      if (!patientId) return;
      try {
        const res = await axios.get(`/api/v1/diagnosis/patient/${patientId}`);
        setDiagnosisRecords(res.data.diagnosis_records || []);
      } catch (err) {
        console.error('❌ 진단 기록 불러오기 실패:', err);
      }
    }

    fetchDiagnosisRecords();
  }, [patientId]);

  if (loading || !patientInfo || !patientId) {
    return <div className="text-center mt-10">로딩 중입니다...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PatientInfoCard patient={patientInfo} />
      <VideoCallRoom doctorId={doctorId} patientId={patientId} />
      <PastDiagnosisList records={diagnosisRecords} />
      <ConsultActionButtons patientId={patientId} />
    </div>
  );
}