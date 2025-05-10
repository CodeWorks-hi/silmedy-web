// src/components/doctor/consult/PrescriptionPreview.tsx
'use client';

import React from 'react';
import type { Prescription } from '@/types/consult';

interface Props {
    patientName: string;
    prescriptions: Prescription[];
    doctorName: string;          // ← 추가
    licenseNumber: string;       // ← 추가
}

export default function PrescriptionPreview({
    patientName,
    prescriptions,
    doctorName,
    licenseNumber,
}: Props) {
    return (
        <div className="p-4 text-sm" id="prescription-preview">

            {/* ▶ 상단에 의사/면허번호, 환자명 */}
            <div className="mb-2">
            <h3 className="text-2xl font-bold text-center">처 방 전</h3>
            <br/> 
                <strong>의사명:</strong> {doctorName} &nbsp;&nbsp;
                <strong>면허번호:</strong> {licenseNumber}
            </div>
            <div className="mb-2"><strong>환자명:</strong> {patientName}</div>

            {/* ▶ 처방전 테이블 */}
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 border text-center">병명 코드</th>
                        <th className="border px-2 py-1">의약품</th>
                        <th className="border px-2 py-1">투약량</th>
                        <th className="border px-2 py-1">투약회수</th>
                        <th className="border px-2 py-1">용법</th>
                        <th className="border px-2 py-1">일수</th>
                    </tr>
                </thead>
                <tbody>
                    {prescriptions.map((p, i) => (
                        <tr key={i}>
                            <td className="border px-2 py-1">{p.disease}</td>
                            <td className="border px-2 py-1">{p.drug}</td>
                            <td className="border px-2 py-1">{p.amount}</td>
                            <td className="border px-2 py-1">{p.frequency}</td>
                            <td className="border px-2 py-1">{p.method}</td>
                            <td className="border px-2 py-2">{p.days}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}