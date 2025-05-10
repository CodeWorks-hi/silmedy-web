// src/components/doctor/consult/PrescriptionPreview.tsx
'use client';

import React from 'react';
import type { Prescription } from '@/types/consult';

interface Props {
    patientName: string;
    prescriptions: Prescription[];
    doctorName: string;          // ← 추가
    licenseNumber: string;       // ← 추가
    hospitalName?: string;
    hospitalAddress?: string;
    hospitalContact?: string;
    birthDate?: string;
    prescriptionId?: number;
}

// 날짜 포맷팅 헬퍼
function formatDate(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

export default function PrescriptionPreview({
    patientName,
    prescriptions,
    doctorName,
    licenseNumber,
    hospitalName,
    hospitalAddress,
    hospitalContact,
    birthDate,
    prescriptionId,
}: Props) {
    const today = new Date();
    const formattedBirth = birthDate
        ? new Date(birthDate).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }) : '';
    const uniqueDiseases = Array.from(new Set(prescriptions.map((p) => p.disease)));
    return (
        <div className="p-6" id="prescription-preview">
            {/* 타이틀 */}
            <h3 className="text-3xl font-bold text-center mb-4">
                처&nbsp;방&nbsp;전
            </h3>

            {/* 병원·의사·환자 정보 테이블 */}
            <table className="border w-full text-xs text-center font-medium">
                <colgroup>
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '80%' }} />
                </colgroup>
                <tr>
                    <th className="bg-gray-100 py-3">교부번호</th>
                    <td>{formatDate(today)} 제 {prescriptionId ?? '-'} 호</td>
                </tr>
            </table>
            <table className="border w-full text-xs text-center">
                <colgroup>
                    <col style={{ width: '50%' }} />
                    <col style={{ width: '50%' }} />
                </colgroup>
                <tr className="bg-gray-100">
                    <th className="py-3">환&nbsp;자</th>
                    <th>의료기관</th>
                </tr>
            </table>
            <table className="w-full text-sm text-center text-xs ">
                <colgroup>
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '30%' }} />
                </colgroup>
                <tr>
                    <th className="bg-gray-100 border px-3 py-2">성명</th>
                    <td className="border px-3 py-2 text-center">{patientName}</td>
                    <th className="bg-gray-100 border px-3 py-2">기관명</th>
                    <td className="border px-3 py-2 text-center">{hospitalName}</td>
                </tr>

                <tr>
                <th className="bg-gray-100 border px-3 py-2 text-center">생년월일</th>
                    <td className="border px-3 py-2 text-center">{formattedBirth}</td>
                    <th className="bg-gray-100 border px-3 py-2 text-center">연락처</th>
                    <td className="border px-3 py-2 text-center">{hospitalContact}</td>
                </tr>
            </table>
            {/* 처방전 테이블 */}
            <table className="border w-full text-xs text-center">
                <colgroup>
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                    <tr>
                        <th rowSpan={prescriptions.length + 2} className="bg-gray-100 border px-2 py-1 text-center">
                            질병코드
                        </th>

                        <td className="border px-2 py-1 text-center">
                            {uniqueDiseases[0]}
                        </td>

                        <th rowSpan={prescriptions.length + 2} className="bg-gray-100 border px-3 py-2 text-center font-medium">처방의료인의성명</th>
                        <td rowSpan={prescriptions.length + 2} className="border px-3 py-2 text-center">{doctorName}</td>

                        <th className="bg-gray-100 border px-3 py-2 text-center font-medium">면허종별</th>
                        <td className="border px-3 py-2 text-center">의 &nbsp; &nbsp; &nbsp;사</td>
                    </tr>
                    <tr>
                        <td className="border px-2 py-1 text-center">
                            {uniqueDiseases[1]}
                        </td>
                        <th className="bg-gray-100 border px-3 py-2 text-center font-medium">면허번호</th>
                        <td className="border px-3 py-2 text-center">{licenseNumber}</td>
                    </tr>

                </thead>
            </table>
            
            <table className="border w-full text-xs text-center">
                    <tr className="bg-gray-100">
                        {['의약품', '투약량', '투약회수', '용법', '일수',
                        ].map((header) => (
                            <th
                                key={header}
                                className="border px-2 py-3">
                                {header}
                            </th>
                        ))}
                    </tr>
                    <tbody>
                        {prescriptions.map((p, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-white'}>
                                <td className="border px-2 py-1">{p.drug}</td>
                                <td className="border px-2 py-1 text-center">{p.amount}</td>
                                <td className="border px-2 py-1 text-center">{p.frequency}</td>
                                <td className="border px-2 py-1 text-center">{p.method}</td>
                                <td className="border px-2 py-1 text-center">{p.days}</td>
                            </tr>
                        ))}
                    </tbody>
            </table>
            <table className="w-full h-5 text-center font-medium text-xs ">
            <td className="text-center px-3 py-2 text-xs italic">
                  해당 처방전은 실제 사용이 불가능하며, 이해를 돕기 위한 화면입니다.
                </td>
            </table>
        </div>
    );
}