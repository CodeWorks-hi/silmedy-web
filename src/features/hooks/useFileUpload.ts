// src/features/hooks/useFileUpload.ts
'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { createDoctor } from '@/lib/api'; // 공통 API 함수 불러오기
import Cookie from 'js-cookie';

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 선택된 파일 상태
  const [fileData, setFileData] = useState<any[]>([]); // 파싱된 데이터 상태
  const [progress, setProgress] = useState<number>(0); // 업로드 진행률 상태
  const [errors, setErrors] = useState<string[]>([]);    // ← 추가: 실패 메시지 리스트


  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;      // 파일 없으면 무시

    setSelectedFile(file);  // 선택된 파일 저장

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' }); // 워크북 파싱
      const sheetName = workbook.SheetNames[0];            // 첫 시트 이름
      const worksheet = workbook.Sheets[sheetName];        // 워크시트 선택
      const jsonData = XLSX.utils.sheet_to_json(worksheet); // JSON 배열로 변환
      setFileData(jsonData as any[]);                     // 상태에 저장
    };
    reader.readAsArrayBuffer(file); // 파일을 ArrayBuffer로 읽기
  };

  // 파일 및 상태 초기화 핸들러
  const resetFile = () => {
    setSelectedFile(null);
    setFileData([]);
    setProgress(0);
  };

  const uploadDoctors = async () => {
    setErrors([]);       // ← 시작 전 실패 리스트 초기화
    // 1) 업로드 데이터 유무 체크
    if (fileData.length === 0) {
      alert('업로드할 데이터가 없습니다.');
      return;
    }
    if (!confirm('정말 등록하시겠습니까?')) return;

    // 2) 로그인 시 쿠키에 저장된 보건소 ID를 꺼내옵니다
    const adminHospitalId = Cookie.get('hospital_id');
    if (!adminHospitalId) {
      alert('보건소 정보가 없습니다. 다시 로그인 해주세요.');
      return;
    }
    setProgress(10); // 진입 직후 소량 진행률 표시

    for (let i = 0; i < fileData.length; i++) {
      const item = fileData[i];
      // inside uploadDoctors loop
      const availability = {
        월: item['월'],
        화: item['화'],
        수: item['수'],
        목: item['목'],
        금: item['금'],
      };
      try {
        // 3) API 함수 호출: 로그인된 관리자 보건소 ID(adminHospitalId)를 사용
        await createDoctor({
          license_number: String(item['면허번호']),
          name: item['이름'],
          gender: item['성별'],
          email: item['이메일'],
          department: item['진료과목'],
          contact: item['연락처'],
          hospital_id: adminHospitalId, // 문자열 타입
          password: '123456',
          availability,
        });

      } catch (err: any) {
        const msg = `${item['이름']} (${item['면허번호']}): ${err.response?.data?.message || err.message}`;
        console.error('등록 실패 →', msg);
        setErrors(prev => [...prev, msg]);   // ← 실패 메시지 저장
      }
      // 업로드 진행률 계산 및 업데이트
      setProgress(Math.round(((i + 1) / fileData.length) * 100));
    }
    alert('전체 업로드 완료!');
    resetFile();
  }
  return {
    selectedFile,
    fileData,
    handleFileChange,
    resetFile,
    uploadDoctors,
    progress,
    errors,
  };
}
