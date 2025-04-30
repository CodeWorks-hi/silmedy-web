'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import PatientInfoCard from './PatientInfoCard';
import PastDiagnosisList from './PastDiagnosisList';
import ConsultActionButtons from './ConsultActionButtons';
import VideoCallRoom from './VideoCallRoom';

interface DoctorConsultTabProps {
  doctorId: string;
  patientId: string | number;
}

interface PatientInfo {
  name: string;
  birth_date: string;
  contact: string;
  department?: string;
}

interface DiagnosisRecord {
  diagnosis_id: number;
  diagnosed_at: string;
  diagnosis_text: string;
  disease_code: string;
}

export default function DoctorConsultTab({ doctorId, patientId }: DoctorConsultTabProps) {
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [diagnosisRecords, setDiagnosisRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 DoctorConsultTab mount - doctorId:', doctorId, 'patientId:', patientId);

    async function fetchData() {
      try {
        const patientRes = await axios.get(`/api/v1/patients/${patientId}`);
        const diagnosisRes = await axios.get(`/api/v1/diagnosis/patient/${patientId}`);

        setPatientInfo(patientRes.data.patient);
        setDiagnosisRecords(diagnosisRes.data.diagnosis_records || []);
      } catch (err) {
        console.error('❌ 환자 데이터 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    }

    if (doctorId && patientId) fetchData();
  }, [doctorId, patientId]);

  if (loading) return <div className="text-center">로딩 중...</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      {patientInfo && <PatientInfoCard patient={patientInfo} />}
      <VideoCallRoom doctorId={doctorId} patientId={patientId} />
      <PastDiagnosisList records={diagnosisRecords} />
      <ConsultActionButtons patientId={patientId} />
    </div>
  );
}