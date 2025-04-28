'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [progress, setProgress] = useState<number>(0);

  // 🔵 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setFileData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  // 🔵 파일 리셋 핸들러
  const resetFile = () => {
    setSelectedFile(null);
    setFileData([]);
    setProgress(0);
  };

  // 🔵 서버로 업로드
  const uploadDoctors = async () => {
    if (fileData.length === 0) {
      alert('업로드할 데이터가 없습니다.');
      return;
    }

    if (!confirm('정말 등록하시겠습니까?')) return;

    try {
      setProgress(10);

      for (let i = 0; i < fileData.length; i++) {
        const item = fileData[i];

        // 🔹 API 포맷 맞춰서 전송
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/register/doctor`, {
          name: item['이름'],
          gender: item['성별'],
          email: item['이메일'],
          department: item['직책'],
          contact: item['연락처'],
          hospital_name: item['보건소'],
          password: '123456', // 기본 비번 설정 (필요시 수정 가능)
        });

        // 프로그레스 계산
        setProgress(Math.round(((i + 1) / fileData.length) * 100));
      }

      alert('업로드 완료!');
      resetFile(); // 초기화

    } catch (error: any) {
      console.error(error);
      alert('업로드 중 오류가 발생했습니다.');
    }
  };

  return {
    selectedFile,
    fileData,
    handleFileChange,
    resetFile,
    uploadDoctors,
    progress,
  };
}