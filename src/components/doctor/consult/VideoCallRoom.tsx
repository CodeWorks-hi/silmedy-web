// src/components/doctor/consult/VideoCallRoom.tsx

'use client';
import { useEffect, useRef } from 'react';

interface Props {
  doctorId: string;
  patientId: string | number;
}

export default function VideoCallRoom({ doctorId, patientId }: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // WebRTC 초기화 준비용
    console.log("🔹 doctorId:", doctorId);
    console.log("🔹 patientId:", patientId);
  }, [doctorId, patientId]);

  return (
    <div className="border rounded p-4 bg-gray-50">
      <h3 className="font-bold mb-2">🔹 WebRTC 통화 시작</h3>
      <video ref={localVideoRef} autoPlay playsInline muted className="w-full bg-black" />
    </div>
  );
}