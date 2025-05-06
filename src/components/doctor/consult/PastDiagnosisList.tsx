// PastDiagnosisList.tsx
'use client'; // Next.js Client Component 명시

// 각 진료 기록의 타입 정의
interface DiagnosisRecord {
  diagnosis_id: number;     // 고유 ID
  diagnosed_at: string;     // 진단 시각 (날짜 문자열)
  diagnosis_text: string;   // 진단 요약 또는 설명
  disease_code: string;     // 병명 또는 질병 코드
}

// Props 타입 정의: diagnosis record 배열을 받아서 표시
interface PastDiagnosisListProps {
  records: DiagnosisRecord[];
}

// 렌더링 컴포넌트
export default function PastDiagnosisList({ records }: PastDiagnosisListProps) {
  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-2">과거 진료 기록</h2>

      {records.length > 0 ? (
        // 진료 기록이 있는 경우 리스트로 렌더링
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
        // 기록이 없는 경우 메시지 표시
        <div>과거 진료 기록이 없습니다.</div>
      )}
    </div>
  );
}