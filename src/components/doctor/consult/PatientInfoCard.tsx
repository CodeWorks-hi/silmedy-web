'use client';

interface PatientInfoCardProps {
  patient: {
    name: string;
    birth_date: string;
    contact: string;
  };
}

export default function PatientInfoCard({ patient }: PatientInfoCardProps) {
  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-2">진료중 환자</h2>
      <div className="space-y-1">
        <div><strong>이름:</strong> {patient.name}</div>
        <div><strong>생년월일:</strong> {patient.birth_date}</div>
        <div><strong>연락처:</strong> {patient.contact}</div>
      </div>
    </div>
  );
}

