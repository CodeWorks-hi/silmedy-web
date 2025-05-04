'use client';

import { useEffect, useRef, useState } from 'react';
import axios from '@/lib/axios';
import {
  db,
  ref,
  set,
  push,
  onValue,
} from '@/firebase/firebase';

export default function VideoCallPage() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [remoteSdpReceived, setRemoteSdpReceived] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const handleStartCall = async () => {
    const payload = {
      doctor_id: 'doctor_123456', // 실제 로그인 값으로 교체
      patient_id: 'patient_22',   // 선택된 환자 ID로 교체
      created_at: new Date().toISOString(),
      status: 'waiting',
    };

    try {
      const res = await axios.post('/video-call/create', payload);
      setRoomId(res.data.id);
      alert(`✅ 통화방 생성 완료: ${res.data.id}`);
    } catch (e) {
      console.error('❌ 통화방 생성 실패:', e);
    }
  };

  useEffect(() => {
    if (!roomId) return;

    const servers = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    peerConnection.current = new RTCPeerConnection(servers);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateRef = ref(db, `signaling/${roomId}/callerCandidates`);
        push(candidateRef, event.candidate.toJSON());
      }
    };

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localStream.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });

      return peerConnection.current!.createOffer();
    }).then((offer) => {
      return peerConnection.current!.setLocalDescription(offer).then(() => offer);
    }).then((offer) => {
      const offerRef = ref(db, `signaling/${roomId}/offer`);
      return set(offerRef, offer);
    }).catch((err) => {
      console.error('❌ offer error:', err);
    });

    const answerRef = ref(db, `signaling/${roomId}/answer`);
    const unsubscribeAnswer = onValue(answerRef, (snapshot) => {
      const answer = snapshot.val();
      if (answer && !remoteSdpReceived) {
        const rtcAnswer = new RTCSessionDescription(answer);
        peerConnection.current?.setRemoteDescription(rtcAnswer);
        setRemoteSdpReceived(true);
      }
    });

    const calleeCandidatesRef = ref(db, `signaling/${roomId}/calleeCandidates`);
    const unsubscribeCallee = onValue(calleeCandidatesRef, (snapshot) => {
      snapshot.forEach((child) => {
        const candidate = child.val();
        peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
      });
    });

    return () => {
      unsubscribeAnswer();
      unsubscribeCallee();
    };
  }, [roomId]);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">🩺 영상 통화 - 의사</h2>

      <button
        onClick={handleStartCall}
        className="px-4 py-2 bg-cyan-500 text-white rounded"
      >
        통화방 생성 및 Offer 전송
      </button>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="font-semibold">내 화면</p>
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full bg-black rounded" />
        </div>
        <div>
          <p className="font-semibold">상대 화면</p>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full bg-black rounded" />
        </div>
      </div>

      {roomId && (
        <p className="text-green-600 font-mono">Room ID: {roomId}</p>
      )}
    </div>
  );
}