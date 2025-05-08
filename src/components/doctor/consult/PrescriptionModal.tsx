// src/components/doctor/consult/PrescriptionModal.tsx
'use client';

import React from 'react';
import type { Prescription } from '@/types/consult';
import PrescriptionPreview from '@/components/doctor/consult/PrescriptionPreview';

interface Props {
  isOpen: boolean;
  onClose(): void;
  onConfirm(): void;
  patientName: string;
  prescriptions: Prescription[];
 doctorName: string;        // ← 추가
 licenseNumber: string;     // ← 추가
}

export default function PrescriptionModal({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  prescriptions,
 doctorName,
 licenseNumber,
}: Props) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-[600px] max-w-full">
        <h2 className="text-xl font-bold mb-4">처방전 미리보기</h2>
        <div className="border p-4 mb-6">
          <PrescriptionPreview
            patientName={patientName}
            prescriptions={prescriptions}
           doctorName={doctorName}
           licenseNumber={licenseNumber}
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            아니오
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-cyan-500 text-white rounded">
            예
          </button>
        </div>
      </div>
    </div>
  );
}