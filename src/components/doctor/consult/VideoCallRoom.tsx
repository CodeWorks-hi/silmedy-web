'use client';

import { useEffect, useRef } from 'react';
import { useWebRTC } from '@/webrtc/useWebRTC';

export default function VideoCallRoom({
  doctorId,
  patientId,
  roomId,
  onCallReady,
}:{
  doctorId: string;
  patientId: string|number;
  roomId:    string;
  onCallReady?: (actions:{startCall():void,stopCall():void})=>void;
}) {
  const localRef  = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  const { localStream, remoteStream, startCall, stopCall } = useWebRTC(roomId);

  useEffect(() => {
    onCallReady?.({ startCall, stopCall });
  }, []);

  useEffect(() => {
    if(localRef.current)  localRef.current.srcObject  = localStream;
  }, [localStream]);
  useEffect(() => {
    if(remoteRef.current) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video ref={remoteRef} autoPlay playsInline className="w-full h-[400px] object-cover" />
      <video ref={localRef}  autoPlay playsInline muted className="absolute top-2 right-2 w-32 h-24 rounded border border-white" />
    </div>
  );
}