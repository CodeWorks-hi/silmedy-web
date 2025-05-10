// components/doctor/consult/PrescriptionListSection.tsx
'use client';

import React from 'react';
import { Prescription } from '@/types/consult';

interface PrescriptionListSectionProps {
  prescriptions: Prescription[];
  onRemove(idx: number): void;
}

export default function PrescriptionListSection({
  prescriptions,
  onRemove,
}: PrescriptionListSectionProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">의약품 코드</th>
            <th className="border px-3 py-2">병명 코드</th>
            <th className="border px-3 py-2">투약량</th>
            <th className="border px-3 py-2">투약회수</th>
            <th className="border px-3 py-2">용법</th>
            <th className="border px-3 py-2">투약 일수</th>
            <th className="border px-3 py-2">액션</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((p, i) => (
            <tr key={i} className="even:bg-gray-50">
              <td className="border px-3 py-2 text-center">{p.drug}</td>
              <td className="border px-3 py-2 text-center">{p.disease}</td>
              <td className="border px-3 py-2 text-center">{p.days}</td>
              <td className="border px-3 py-2 text-center">{p.frequency ?? 3}</td>
              <td className="border px-3 py-2 text-center">{p.method}</td>
              <td className="border px-3 py-2 text-center">{p.days}</td>
              <td className="border px-3 py-2 text-center">
                <button
                  onClick={() => onRemove(i)}
                  className="text-red-500 hover:underline"> 삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}