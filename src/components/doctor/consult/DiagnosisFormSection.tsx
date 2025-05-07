// components/doctor/consult/DiagnosisFormSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createDiagnosis } from '@/lib/api';
import type { Disease, Drug, Prescription } from '@/types/consult';

interface Props {
  doctorId: string | number;
  patientId: string | number;
  requestId?: number;
  diseases: Disease[];
  prescriptions: Prescription[];
}

export default function DiagnosisFormSection({
  doctorId,
  patientId,
  requestId,
  diseases,
  prescriptions,
}: Props) {
  // ——————————————————————————————
  // 1) Form state
  // ——————————————————————————————
  const [diseaseCode, setDiseaseCode] = useState<string>('');     // J31.0 같은 코드
  const [diagnosisText, setDiagnosisText] = useState<string>(''); // 세부 소견
  const [summaryText, setSummaryText]   = useState<string>(''); // 요약 텍스트
  const [notes, setNotes]               = useState<string>(''); // 내부 메모
  const [symptoms, setSymptoms]         = useState<string[]>([]); // 예: ['불편감','열']

  // ——————————————————————————————
  // 2) 증상 체크박스 목록 (질병별 혹은 고정)
  // ——————————————————————————————
  const symptomOptions = ['불편감', '화상', '열', '통증'];

  // ——————————————————————————————
  // 3) 제출 핸들러
  // ——————————————————————————————
  const handleSubmit = async () => {
    if (!diseaseCode || !diagnosisText) {
      alert('질병 코드와 세부 소견은 필수 입력입니다.');
      return;
    }

    const payload = {
      doctor_id: doctorId,
      patient_id: patientId,
      disease_code: diseaseCode,
      diagnosis_text: diagnosisText,
      request_id: requestId,
      summary_text: summaryText,
      notes,
      symptoms,
      prescription: prescriptions.map(p => ({
        disease_id: p.disease,
        drug_id: p.drug.split(' ')[0], // 코드만 추출
        days: p.days,
        amount: p.amount,
        method: p.method,
      })),
    };

    try {
      const res = await createDiagnosis(payload);
      alert(`진단 기록 저장 완료 (ID: ${res.diagnosis_id})`);
    } catch (err) {
      console.error(err);
      alert('진단 기록 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 space-y-4">
      <h3 className="text-lg font-semibold">진단서 작성</h3>

      {/* 1. 질병 코드 선택 */}
      <div>
        <label className="block text-sm mb-1">질병 코드</label>
        <select
          className="w-full border rounded p-2"
          value={diseaseCode}
          onChange={e => setDiseaseCode(e.target.value)}
        >
          <option value="">— 선택 —</option>
          {diseases.map(d => (
            <option key={d.similar_id} value={d.similar_id}>
              {d.similar_id} {d.name_ko}
            </option>
          ))}
        </select>
      </div>

      {/* 2. 세부 소견 */}
      <div>
        <label className="block text-sm mb-1">세부 소견</label>
        <textarea
          rows={4}
          className="w-full border rounded p-2"
          value={diagnosisText}
          onChange={e => setDiagnosisText(e.target.value)}
          placeholder="환자의 진단 내용을 입력하세요"
        />
      </div>

      {/* 3. 요약 텍스트 */}
      <div>
        <label className="block text-sm mb-1">요약 텍스트</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={summaryText}
          onChange={e => setSummaryText(e.target.value)}
          placeholder="짧게 요약할 내용을 입력하세요"
        />
      </div>

      {/* 4. 내부 메모 (notes) */}
      <div>
        <label className="block text-sm mb-1">내부 메모</label>
        <textarea
          rows={2}
          className="w-full border rounded p-2"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="진단서에 보이지 않을 내부 메모"
        />
      </div>

      {/* 5. 증상 선택 */}
      <div>
        <span className="block text-sm mb-1">증상</span>
        <div className="flex flex-wrap gap-2">
          {symptomOptions.map(s => (
            <label key={s} className="inline-flex items-center">
              <input
                type="checkbox"
                className="mr-1"
                checked={symptoms.includes(s)}
                onChange={() => {
                  setSymptoms(prev =>
                    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                  );
                }}
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      {/* 6. 처방전 리스트 (읽기 전용) */}
      {prescriptions.length > 0 && (
        <div>
          <span className="block text-sm mb-1">처방전 내역</span>
          <ul className="list-disc pl-5 space-y-1">
            {prescriptions.map((p, i) => (
              <li key={i}>
                {p.drug} / 일일 {p.days}회 / 1회 {p.amount} / {p.method}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 7. 제출 버튼 */}
      <div className="text-center pt-4">
        <button
          onClick={handleSubmit}
          className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          진단서 저장
        </button>
      </div>
    </div>
  );
}