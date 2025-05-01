'use client';

import { useEffect, useRef } from 'react';
import { useWebRTC } from '@/webrtc/useWebRTC';

interface VideoCallRoomProps {
  doctorId: string;
  patientId: string | number;
  onCallReady?: (actions: { startCall: () => void; stopCall: () => void }) => void;
}

export default function VideoCallRoom({ doctorId, patientId, onCallReady }: VideoCallRoomProps) {
  const roomId = `room_${doctorId}_${patientId}`;
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { localStream, remoteStream, startCall, stopCall } = useWebRTC(roomId); // <- stopCall도 추가

  useEffect(() => {
    if (onCallReady) {
      onCallReady({ startCall, stopCall });
    }
  }, [startCall, stopCall]);

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
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-[400px] object-cover" />
      <video ref={localVideoRef} autoPlay playsInline muted className="absolute top-2 right-2 w-32 h-24 rounded border border-white" />
    </div>
  );
}