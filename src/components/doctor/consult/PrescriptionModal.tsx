'use client';

import { useState } from 'react';
import axios from 'axios';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string | number;
  doctorId: string | number;
}

export default function PrescriptionModal({ isOpen, onClose, patientId, doctorId }: PrescriptionModalProps) {
  const [medicationName, setMedicationName] = useState('');
  const [medicationDays, setMedicationDays] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!medicationName) {
      alert('약 이름을 입력해주세요.');
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/prescriptions/create`, {
        patient_id: patientId,
        doctor_id: doctorId,
        medication_days: medicationDays,
        medication_list: [medicationName],
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

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">약 이름</label>
          <input
            type="text"
            value={medicationName}
            onChange={(e) => setMedicationName(e.target.value)}
            className="w-full border rounded p-2 text-sm"
            placeholder="예: 타이레놀"
          />
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