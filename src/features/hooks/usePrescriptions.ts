// src/hooks/usePrescriptions.ts
import { useState } from 'react';
import type { Drug, Prescription } from '@/types/consult';

export function usePrescriptions(drugs: Drug[]) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  function addPrescription(
    disease: string,
    drug: string,
    days: number,
    frequency: number     // ← 새 매개변수
  ) {
    const found = drugs.find(d => d.atc_code === drug.split(' ')[0]);
    const amount = found?.medication_amount ?? 1;
    const method = found?.medication_method ?? '';
    setPrescriptions(ps => [
      ...ps,
      { disease, drug, days, amount, method, frequency },
    ]);
  }

  function removePrescription(idx: number) {
    setPrescriptions(ps => ps.filter((_, i) => i !== idx));
  }

  function clearPrescriptions() {
    setPrescriptions([]);
  }

  return { prescriptions, addPrescription, removePrescription, clearPrescriptions };
}