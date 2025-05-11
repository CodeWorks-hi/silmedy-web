// src/components/doctor/consult/VideoCallRoom.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { useWebRTC } from '@/webrtc/useWebRTC';

interface Props {
  doctorId: string;
  patientId: string | number;
  roomId: string;
  onCallReady?: (actions: { startCall(): void; stopCall(): void }) => void;
}

export default function VideoCallRoom({
  doctorId, patientId, roomId, onCallReady,
}: Props) {
  const localRef  = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const { localStream, remoteStream, dataChannel, startCall, stopCall } =
    useWebRTC(roomId);

  const [subtitle, setSubtitle] = useState<string>('');

  // 콜 컨트롤 전달
  useEffect(() => {
    onCallReady?.({ startCall, stopCall });
  }, []);

  // 로컬/원격 스트림 바인딩
  useEffect(() => { if (localRef.current && localStream) localRef.current.srcObject = localStream; }, [localStream]);
  useEffect(() => { if (remoteRef.current && remoteStream) remoteRef.current.srcObject = remoteStream; }, [remoteStream]);

  // DataChannel 로 받은 메시지(환자 화면용 자막)
  useEffect(() => {
    if (!dataChannel) return;
    dataChannel.onmessage = (e) => {
      setSubtitle(e.data);
    };
  }, [dataChannel]);

  // SpeechRecognition → DataChannel.send() (의사 화면)
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR || !dataChannel) return;

    const recog = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'ko-KR';

    recog.onresult = (e: any) => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      if (dataChannel.readyState === 'open') {
        dataChannel.send(text);
      }
    };
    recog.start();
    return () => recog.stop();
  }, [dataChannel]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video ref={remoteRef} autoPlay playsInline muted={false} controls
             className="w-full h-[800px] object-cover" />
      <video ref={localRef} autoPlay playsInline muted
             className="absolute top-2 right-2 w-32 h-24 rounded border border-white" />

      {/* 자막 (환자에게만 보임) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2
                      bg-black/70 text-white px-4 py-2 rounded text-lg">
        {subtitle}
      </div>
    </div>
  );
}