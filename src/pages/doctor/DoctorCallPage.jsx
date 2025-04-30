'use client';

import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import {
  db,
  ref,
  set,
  push,
  onValue,
} from '@/firebase/firebase'; // ✅ firebase.ts에서 통합된 모듈

export default function DoctorCallPage() {
  const router = useRouter();
  const { roomId } = router.query;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [remoteSdpReceived, setRemoteSdpReceived] = useState(false);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const servers = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };

    peerConnection.current = new RTCPeerConnection(servers);

    // ICE 후보 수집
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateRef = ref(db, `signaling/${roomId}/callerCandidates`);
        push(candidateRef, event.candidate.toJSON());
      }
    };

    // 리모트 스트림 수신
    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // 로컬 스트림 처리
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });

      return peerConnection.current.createOffer();
    }).then((offer) => {
      return peerConnection.current.setLocalDescription(offer).then(() => offer);
    }).then((offer) => {
      const offerRef = ref(db, `signaling/${roomId}/offer`);
      return set(offerRef, offer.toJSON());
    }).catch((err) => {
      console.error('❌ Offer 생성 실패:', err);
    });

    // Answer 수신
    const answerRef = ref(db, `signaling/${roomId}/answer`);
    const unsubscribeAnswer = onValue(answerRef, (snapshot) => {
      const answer = snapshot.val();
      if (answer && !remoteSdpReceived) {
        const rtcAnswer = new RTCSessionDescription(answer);
        peerConnection.current?.setRemoteDescription(rtcAnswer);
        setRemoteSdpReceived(true);
      }
    });

    // Callee ICE 수신
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