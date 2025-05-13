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
  doctorId,
  patientId,
  roomId,
  onCallReady,
}: Props) {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const { localStream, remoteStream, dataChannel, startCall, stopCall } =
    useWebRTC(roomId);
  const [subtitle, setSubtitle] = useState<string>('');

  // 콜 제어 함수는 mount 시 한 번만 전달
  useEffect(() => {
    onCallReady?.({ startCall, stopCall });
  }, []);

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

  // DataChannel 로 받은 메시지(환자 화면용 자막)
  useEffect(() => {
    if (!dataChannel) return;
    dataChannel.onopen  = () => { console.log('[VC] 📡 dataChannel opened'); };
    dataChannel.onclose = () => { console.log('[VC] 📡 dataChannel closed'); };
  
    dataChannel.onmessage = (e) => {
      console.log('[VC] 📩 받은 자막:', e.data);
      setSubtitle(e.data);
    };
  }, [dataChannel]);

  // SpeechRecognition → DataChannel.send() (의사 화면)
  useEffect(() => {
    if (!dataChannel) return;
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
        console.log("✉️ [VC] send subtitle:", text);
        dataChannel.send(text);
      };
    
      // 데이터 채널이 완전히 열렸을 때만 음성 인식 시작
      dataChannel.onopen = () => {
        console.log("[VC] 📡 dataChannel opened — start Recognition");
        recog.start();
      };
      dataChannel.onclose = () => {
        console.log("[VC] 📡 dataChannel closed — stop Recognition");
        recog.stop();
      };
    
      return () => {
        recog.stop();
        // 채널 핸들러도 정리
        dataChannel.onopen = null!;
        dataChannel.onclose = null!;
      };
    }, [dataChannel]);



  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        muted={false}
        controls
        className="w-full h-[900px] object-cover"
      />
      <video
        ref={localRef}
        autoPlay
        playsInline
        muted
        className="absolute top-2 right-2 w-32 h-24 rounded border border-white"
      />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2
                      bg-black/70 text-white px-4 py-2 rounded text-lg">
        {subtitle}
      </div>
    </div>
  );
}