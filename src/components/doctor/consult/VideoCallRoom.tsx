'use client';

import { useEffect, useRef } from 'react';
import { useWebRTC } from '@/webrtc/useWebRTC';

interface VideoCallRoomProps {
  doctorId: string;
  patientId: string | number;
}

export default function VideoCallRoom({ doctorId, patientId }: VideoCallRoomProps) {
  const roomId = `room_${doctorId}_${patientId}`;
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { localStream, remoteStream, startCall } = useWebRTC(roomId);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="border p-4 rounded bg-gray-100">
      <h3 className="font-bold mb-2">🎥 화상진료</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-semibold">의사 화면</p>
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-64 bg-black rounded" />
        </div>
        <div>
          <p className="text-sm font-semibold">환자 화면</p>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-64 bg-black rounded" />
        </div>
      </div>
      <button
        onClick={startCall}
        className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded"
      >
        통화 시작
      </button>
    </div>
  );
}