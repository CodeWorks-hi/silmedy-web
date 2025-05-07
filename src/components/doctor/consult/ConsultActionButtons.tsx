'use client';

import React, { useState } from 'react';

/** ConsultActionButtons 컴포넌트에 전달할 props 타입 정의 */
interface ConsultActionButtonsProps {
  patientId:           string | number;  /** 진료 대상 환자 ID (문자열 또는 숫자) */
  onStartVideo():      void;             /** “영상 진료 시작” 클릭 시 호출 */
  onEndVideo():        void;             /** “영상 진료 종료” 클릭 시 호출 */
  onSendPrescription(): void;            /** “처방전 전송” 클릭 시 호출 */
  onEndConsult():      void;             /** “진료 종료” 클릭 시 호출 */
}

/**
 * 진료 액션 버튼 모음 컴포넌트
 * - 영상 진료 시작/종료, 처방전 전송, 진료 종료 기능을 제공합니다.
 * - 내부 state(videoSessionStarted)로 영상 세션 버튼 활성/비활성토글
 */
export default function ConsultActionButtons({
  patientId,
  onStartVideo,
  onEndVideo,
  onSendPrescription,
  onEndConsult,
}: ConsultActionButtonsProps) {
  const [videoSessionStarted, setVideoSessionStarted] = useState(false); // 영상 세션 중 여부

  // ▶ “영상 진료 시작” 클릭
  const handleStart = () => {
    setVideoSessionStarted(true);
    onStartVideo();
  };

  // ▶ “영상 진료 종료” 클릭
  const handleEnd = () => {
    setVideoSessionStarted(false);
    onEndVideo();
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {/* 영상 진료 시작 버튼 (한 번만) */}
      <button
        onClick={handleStart}
        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        disabled={videoSessionStarted}
      >
        영상 진료 시작
      </button>

      {/* 영상 진료 종료 버튼 (시작 후 활성화) */}
      <button
        onClick={handleEnd}
        className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        disabled={!videoSessionStarted}
      >
        영상 진료 종료
      </button>

      {/* 처방전 전송 버튼 */}
      <button
        onClick={onSendPrescription}
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        처방전 전송
      </button>

      {/* 진료 종료 버튼 */}
      <button
        onClick={onEndConsult}
        className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        진료 종료
      </button>
    </div>
  );
}