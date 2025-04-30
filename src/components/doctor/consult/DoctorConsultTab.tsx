'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import PatientInfoCard from './PatientInfoCard';
import PastDiagnosisList from './PastDiagnosisList';
import ConsultActionButtons from './ConsultActionButtons';
import VideoCallRoom from './VideoCallRoom';  // 🔹 WebRTC 영상통화 컴포넌트

interface DoctorConsultTabProps {
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

export default function DoctorConsultTab({ patientId }: DoctorConsultTabProps) {
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [diagnosisRecords, setDiagnosisRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null); // 🔸 localStorage에서 doctor_id

  useEffect(() => {
    const storedDoctorId = localStorage.getItem('doctor_id');
    if (storedDoctorId) setDoctorId(storedDoctorId);
  }, []);

  useEffect(() => {
    async function fetchPatientData() {
      try {
        const patientRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/patients/${patientId}`
        );
        const diagnosisRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/diagnosis/patient/${patientId}`
        );

        setPatientInfo(patientRes.data.patient);
        setDiagnosisRecords(diagnosisRes.data.diagnosis_records || []);
      } catch (error) {
        console.error('데이터 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  if (loading || !doctorId) {
    return <div className="text-center mt-10">로딩 중입니다...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {patientInfo && <PatientInfoCard patient={patientInfo} />}
      <VideoCallRoom doctorId={doctorId} patientId={patientId} /> {/* 🔹 화상통화 */}
      <PastDiagnosisList records={diagnosisRecords} />
      <ConsultActionButtons patientId={patientId} />
    </div>
  );
}