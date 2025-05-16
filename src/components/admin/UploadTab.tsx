'use client';

import { useFileUpload } from '@/features/hooks/useFileUpload';
import React from 'react';

export default function UploadTab() {
  // 파일 업로드 관련 훅 사용
  const {
    selectedFile,
    fileData,
    handleFileChange,
    resetFile,
    uploadDoctors,
    progress,
    errors
  } = useFileUpload();

  return (
    <div>
      {/* 제목 */}
      <h2 className="text-2xl font-bold mb-6">직원 일괄 등록</h2>

      {/* 파일 입력 영역 */}
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-10 mb-6 bg-gray-50 relative">
        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {selectedFile ? (
          <div className="text-gray-700">{selectedFile.name}</div>
        ) : (
          <div className="text-gray-400">화먼을 클릭하여 파일을 선택하거나 드래그 후 업로드 버튼 클릭</div>
        )}
      </div>

      {/* 파일 미리보기 테이블 */}
      {fileData.length > 0 && (
        <div className="overflow-auto max-h-96 max-w-full border rounded-md mb-8">
          <table className="min-w-max w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-100">
              <tr>
                {Object.keys(fileData[0]).map(header => (
                  <th key={header} className="px-4 py-2 border">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fileData.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((cell, idx2) => (
                    <td key={idx2} className="px-4 py-2 border">
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 업로드 진행률 바 */}
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
          <div
            className="h-2.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 버튼 그룹 */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={resetFile}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md"
        >
          취소하기
        </button>
        <button
          onClick={uploadDoctors}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md"
        >
          업로드
        </button>
       
      </div>
      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-100 rounded">
          <h3 className="font-bold text-red-600">⚠️ 일부 등록 실패</h3>
          <ul className="list-disc list-inside text-sm text-red-800">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {/* 샘플 파일 다운로드 버튼 */}
      <div className="flex justify-end mb-4">
        <a
          href="/doctor_upload_sample.xlsx"
          download="doctor_upload_sample.xlsx"
          className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded"
        >
          샘플파일 다운로드
        </a>

      </div>


      {/* 샘플 미리보기 설명 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">샘플 파일 양식</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-cyan-100 text-center">
              <tr>
                <th className="px-4 py-2 border">이름</th>
                <th className="px-4 py-2 border">성별</th>
                <th className="px-4 py-2 border">면허번호</th>
                <th className="px-4 py-2 border">이메일</th>
                <th className="px-4 py-2 border">진료과목</th>
                <th className="px-4 py-2 border">연락처</th>
                <th className="px-4 py-2 border">월</th>
                <th className="px-4 py-2 border">화</th>
                <th className="px-4 py-2 border">수</th>
                <th className="px-4 py-2 border">목</th>
                <th className="px-4 py-2 border">금</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border text-center">홍길동</td>
                <td className="px-4 py-2 border text-center">남</td>
                <td className="px-4 py-2 border text-center">123456</td>
                <td className="px-4 py-2 border text-center">hong@example.com</td>
                <td className="px-4 py-2 border text-center">내과</td>
                <td className="px-4 py-2 border text-center">010-1234-5678</td>
                <td className="px-4 py-2 border text-center">09:00~17:00</td>
                <td className="px-4 py-2 border text-center">09:00~17:00</td>
                <td className="px-4 py-2 border text-center">09:00~17:00</td>
                <td className="px-4 py-2 border text-center">휴진</td>
                <td className="px-4 py-2 border text-center">09:00~17:00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}