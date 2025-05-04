'use client';

import { useState } from 'react';
import axios from 'axios';

interface ConsultActionButtonsProps {
  patientId: string | number;
}

export default function ConsultActionButtons({ patientId }: ConsultActionButtonsProps) {
  const [videoSessionStarted, setVideoSessionStarted] = useState(false);

  const handleStartVideo = () => {
    setVideoSessionStarted(true);
    alert('영상 진료를 시작합니다.');
  };

  const handleEndVideo = () => {
    setVideoSessionStarted(false);
    alert('영상 진료를 종료합니다.');
  };

  const handleSendPrescription = () => {
    if (confirm('처방전을 작성하고 전송하시겠습니까?')) {
      alert('처방전 작성/전송 기능은 추후 연결됩니다.');
    }
  };

  const handleEndConsult = async () => {
    if (confirm('진료를 종료하고 완료 처리하시겠습니까?')) {
      try {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/care-requests/solve/${patientId}`);
        alert('진료가 종료되었습니다.');
        window.location.reload();
      } catch (error) {
        console.error('진료 종료 실패:', error);
        alert('진료 종료 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      <button
        onClick={handleStartVideo}
        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        disabled={videoSessionStarted}
      >
        영상 진료 시작
      </button>
      <button
        onClick={handleEndVideo}
        className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        disabled={!videoSessionStarted}
      >
        영상 진료 종료
      </button>
      <button
        onClick={handleSendPrescription}
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        처방전 작성 및 전송
      </button>
      <button
        onClick={handleEndConsult}
        className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        진료 종료
      </button>
    </div>
  );
}