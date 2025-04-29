'use client';

import { useState } from 'react';
import axios from 'axios';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string | number;
  doctorId: string | number;
}

interface Medication {
  name: string;
  usage: string;
}

export default function PrescriptionModal({ isOpen, onClose, patientId, doctorId }: PrescriptionModalProps) {
  const [medications, setMedications] = useState<Medication[]>([{ name: '', usage: '' }]);
  const [medicationDays, setMedicationDays] = useState(1);

  if (!isOpen) return null;

  const handleChangeMedication = (index: number, field: 'name' | 'usage', value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', usage: '' }]);
  };

  const handleRemoveMedication = (index: number) => {
    const updated = medications.filter((_, i) => i !== index);
    setMedications(updated);
  };

  const handleSubmit = async () => {
    const validList = medications.filter((m) => m.name.trim() !== '');
    if (validList.length === 0) {
      alert('최소 하나 이상의 약 이름을 입력해주세요.');
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/prescriptions/create`, {
        patient_id: patientId,
        doctor_id: doctorId,
        medication_days: medicationDays,
        medication_list: validList,
      });

      alert('처방전이 전송되었습니다.');
      onClose();
    } catch (error) {
      console.error('처방전 전송 실패:', error);
      alert('처방전 전송 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">처방전 작성</h2>

        <div className="mb-4 space-y-2">
          <label className="block mb-1 text-sm font-medium">약 목록</label>
          {medications.map((med, index) => (
            <div key={index} className="space-y-1 border-b pb-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={med.name}
                  onChange={(e) => handleChangeMedication(index, 'name', e.target.value)}
                  className="flex-1 border rounded p-2 text-sm"
                  placeholder={`약 ${index + 1} 이름`}
                />
                {index > 0 && (
                  <button
                    onClick={() => handleRemoveMedication(index)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    삭제
                  </button>
                )}
              </div>
              <input
                type="text"
                value={med.usage}
                onChange={(e) => handleChangeMedication(index, 'usage', e.target.value)}
                className="w-full border rounded p-2 text-sm"
                placeholder="복용 방법 (예: 하루 3회 식후)"
              />
            </div>
          ))}
          <button
            onClick={handleAddMedication}
            className="mt-2 text-sm text-blue-500 hover:underline"
          >
            + 약 추가
          </button>
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium">복용일수</label>
          <input
            type="number"
            value={medicationDays}
            min={1}
            onChange={(e) => setMedicationDays(Number(e.target.value))}
            className="w-full border rounded p-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
