'use client';

import { useEffect, useRef } from 'react';
import { useWebRTC } from '@/webrtc/useWebRTC';

interface Props {
  doctorId: string;
  patientId: string | number;
  roomId: string;
  onCallReady?: (actions: { startCall(): void; stopCall(): void }) => void;
}

export default function VideoCallRoom({
  doctorId,
  patientId,
  roomId,
  onCallReady,
}: Props) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const { localStream, remoteStream, startCall, stopCall } =
    useWebRTC(roomId);

  // 콜 제어 함수는 mount 시 한 번만 전달
  useEffect(() => {
    onCallReady?.({ startCall, stopCall });
  }, [onCallReady, startCall, stopCall]);

  // 로컬 스트림 바인딩
  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // 원격 스트림 바인딩
  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        muted={false}
        controls
        className="w-full h-[800px] object-cover"
      />
      <video
        ref={localRef}
        autoPlay
        playsInline
        muted
        className="absolute top-2 right-2 w-32 h-24 rounded border border-white"
      />
    </div>
  );
}