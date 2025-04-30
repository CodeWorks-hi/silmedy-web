// src/pages/doctor/DoctorCallPage.jsx

'use client';

import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { useWebRTC } from '@/webrtc/useWebRTC';

export default function DoctorCallPage() {
  const router = useRouter();
  const { roomId } = router.query;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const { remoteStream } = useWebRTC(roomId);

  useEffect(() => {
    // 로컬 비디오 설정
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });

    // 원격 스트림 설정
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">🔹 환자와 영상 통화</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">🩺 의사 영상</h3>
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-64 bg-black rounded" />
        </div>
        <div>
          <h3 className="font-semibold mb-2">👤 환자 영상</h3>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-64 bg-black rounded" />
        </div>
      </div>
    </div>
  );
}