// components/doctor/consult/ConsultMemoSection.tsx
'use client';

import React from 'react';

interface ConsultMemoSectionProps {
  /** 현재 메모 문자열 */
  memo: string;
  /** 메모가 바뀔 때 호출되는 콜백 */
  onChange(next: string): void;
}

export default function ConsultMemoSection({
  memo,
  onChange,
}: ConsultMemoSectionProps) {
  return (
    <div className="bg-white rounded shadow p-4">
      <label htmlFor="consultMemo" className="block font-semibold mb-2">
        의사소견
      </label>
      <textarea
        id="consultMemo"
        rows={4}
        value={memo}
        onChange={e => onChange(e.target.value)}
        className="w-full border rounded p-2"
        placeholder="환자 상태 및 소견을 입력하세요"
      />
    </div>
  );
}