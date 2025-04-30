// PastDiagnosisList.tsx
'use client';

interface DiagnosisRecord {
  diagnosis_id: number;
  diagnosed_at: string;
  diagnosis_text: string;
  disease_code: string;
}

interface PastDiagnosisListProps {
  records: DiagnosisRecord[];
}

export default function PastDiagnosisList({ records }: PastDiagnosisListProps) {
  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-2">과거 진료 기록</h2>
      {records.length > 0 ? (
        <ul className="space-y-2">
          {records.map((record) => (
            <li key={record.diagnosis_id} className="border-b pb-2">
              <div><strong>진단명:</strong> {record.disease_code}</div>
              <div><strong>진단일자:</strong> {record.diagnosed_at}</div>
              <div><strong>요약:</strong> {record.diagnosis_text}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div>과거 진료 기록이 없습니다.</div>
      )}
    </div>
  );
}