// components/doctor/consult/PrescriptionFormSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Disease, Drug } from '@/types/consult';

interface PrescriptionFormSectionProps {
  diseases: Disease[];
  drugs: Drug[];
  onAdd(p: { disease: string; drug: string; days: number }): void;
}

export default function PrescriptionFormSection({
  diseases,
  drugs,
  onAdd,
}: PrescriptionFormSectionProps) {
  const [selectedDisease, setSelectedDisease] = useState('');
  const [selectedDrug, setSelectedDrug]       = useState('');
  const [days, setDays]                       = useState(1);

  const handleAdd = () => {
    if (!selectedDisease || !selectedDrug || days < 1) return;
    onAdd({ disease: selectedDisease, drug: selectedDrug, days });
    setSelectedDisease('');
    setSelectedDrug('');
    setDays(1);
  };

  return (
    <div className="bg-white rounded shadow p-4 space-y-4">
      <h3 className="font-semibold text-lg">처방전 등록</h3>
      <div className="grid grid-cols-4 gap-4 items-end">
        {/* 병명 코드 */}
        <div>
          <label htmlFor="disease-input" className="block text-sm mb-1">
            병명 코드
          </label>
          <input
            list="disease-list"
            id="disease-input"
            className="w-full border rounded p-2"
            placeholder="코드 입력"
            value={selectedDisease}
            onChange={e => setSelectedDisease(e.target.value)}
          />
          <datalist id="disease-list">
            <option value="">— 선택 —</option>
            {diseases.map(d => (
              <option key={d.similar_id} value={d.similar_id}>
                {d.similar_id} {d.name_ko}
              </option>
            ))}
          </datalist>
        </div>
        {/* 의약품 코드+명 */}
        <div>
          <label htmlFor="drug-input" className="block text-sm mb-1">
            처방 의약품
          </label>
          <input
            list="drug-list"
            id="drug-input"
            className="w-full border rounded p-2"
            placeholder="코드 또는 이름 입력"
            value={selectedDrug}
            onChange={e => setSelectedDrug(e.target.value)}
          />
          <datalist id="drug-list">
            <option value="">— 선택 —</option>
            {drugs.map(d => (
              <option
                key={d.drug_id}
                value={`${d.atc_code} ${d.name}`}
              />
            ))}
          </datalist>
        </div>
        {/* 투약 일수 */}
        <div>
          <label htmlFor="days-input" className="block text-sm mb-1">
            투약 일수
          </label>
          <input
            id="days-input"
            type="number"
            min={1}
            className="w-full border rounded p-2"
            value={days}
            onChange={e => setDays(Number(e.target.value))}
          />
        </div>
        {/* 등록 버튼 */}
        <div>
          <button
            onClick={handleAdd}
            className="mt-1 bg-teal-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={!selectedDisease || !selectedDrug || days < 1}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}