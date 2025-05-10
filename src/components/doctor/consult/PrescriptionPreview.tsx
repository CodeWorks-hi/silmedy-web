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
}: Props) {
    const today = new Date();
    const formattedBirth = birthDate
        ? new Date(birthDate).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
        : '';

    return (
        <div className="p-6" id="prescription-preview">
            {/* 타이틀 */}
            <h3 className="text-3xl font-bold text-center mb-4">
                처&nbsp;방&nbsp;전
            </h3>

            {/* 병원·의사·환자 정보 테이블 */}
            <table className="w-full mb-6 text-sm">
            <colgroup>
                <col style={{ width: '20%' }} />
                <col style={{ width: '50%' }} />
                <col style={{ width: '30%' }} />

            </colgroup>
                <tr className="bg-gray-100">
                    <th className="border px-3 py-2 text-right font-medium">교부번호</th>
                    <th className="border px-3 py-2 text-center font-medium">{formatDate(today)}</th>
                    <th className="px-3 py-2 text-right font-medium"></th>
                    <th className="px-3 py-2 text-right font-medium"></th>
                </tr>
            </table>
            <table className="w-full text-sm">
            <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '50%' }} />
                <col style={{ width: '20%' }} />
            </colgroup>
                <tr className="bg-gray-100">
                    <th className="px-2 py-1 text-center w-1/7">환</th>
                    <th className="border px-3 py-2 text-center font-medium">성명</th>
                    <th className="px-3 py-2 text-right font-medium">{patientName}</th>
                    <th className="px-3 py-2 text-right font-medium"></th>
                </tr>
            </table>
            <table className="w-full text-sm">
                <colgroup>
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '50%' }} />
                    <col style={{ width: '20%' }} />
                </colgroup>
                <tr className="bg-gray-100">
                    <th className="px-2 py-1 text-center w-1/7">자</th>
                    <th className="border px-3 py-2 text-center font-medium">성년월일</th>
                    <th className="px-3 py-2 text-right font-medium">{formattedBirth}</th>
                    <th className="px-3 py-2 text-right font-medium"></th>
                </tr>
            </table>
            <table className="w-full mb-6 text-sm">
                <tbody>

                    <tr className="bg-gray-50">

                        <th className="px-3 py-2 text-right font-medium">보건소</th>
                        <td className="px-3 py-2">{hospitalName}</td>
                        <th className="px-3 py-2 text-right font-medium">주소</th>
                        <td className="px-3 py-2">{hospitalAddress}</td>
                        <th className="px-3 py-2 text-right font-medium">연락처</th>
                        <td className="px-3 py-2">{hospitalContact}</td>
                    </tr>
                    <tr>
                        <th className="px-3 py-2 text-right font-medium">의사명</th>
                        <td className="px-3 py-2">{doctorName}</td>
                        <th className="px-3 py-2 text-right font-medium">면허번호</th>
                        <td className="px-3 py-2">{licenseNumber}</td>
                        <th className="px-3 py-2 text-right font-medium">환자명</th>
                        <td className="px-3 py-2">{patientName}</td>
                    </tr>
                </tbody>
            </table>

            {/* 처방전 테이블 */}
            <table className="w-full border-collapse text-xs">
                <thead>
                    <tr className="bg-gray-100">
                        {[
                            '병명 코드',
                            '의약품',
                            '투약량',
                            '투약회수',
                            '용법',
                            '일수',
                        ].map((header) => (
                            <th
                                key={header}
                                className="border px-2 py-1 text-center font-medium"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {prescriptions.map((p, i) => (
                        <tr
                            key={i}
                            className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                            <td className="border px-2 py-1 text-center">{p.disease}</td>
                            <td className="border px-2 py-1">{p.drug}</td>
                            <td className="border px-2 py-1 text-center">{p.amount}</td>
                            <td className="border px-2 py-1 text-center">
                                {p.frequency}
                            </td>
                            <td className="border px-2 py-1 text-center">{p.method}</td>
                            <td className="border px-2 py-1 text-center">{p.days}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}