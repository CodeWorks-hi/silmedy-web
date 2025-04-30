// src/hooks/useWebRTC.ts

import { useEffect, useRef, useState } from "react";
import { WebRTCPeer } from "@/webrtc/peer";
import {
  db,
  ref,
  set,
  onValue,
  push,
  off,
  remove
} from "@/firebase/firebase";

export function useWebRTC(roomId: string) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<WebRTCPeer | null>(null);

  useEffect(() => {
    const peer = new WebRTCPeer();
    peerRef.current = peer;

    const connect = async () => {
      await peer.initLocalMedia();

      // Offer 생성
      const offer = await peer.createOffer();
      await set(ref(db, `calls/${roomId}/offer`), offer);

      // Local ICE candidates 전송
      peer.onIceCandidate((candidate) => {
        const candidatesRef = ref(db, `calls/${roomId}/callerCandidates`);
        push(candidatesRef, candidate.toJSON());
      });

      // Answer 수신 처리
      const answerRef = ref(db, `calls/${roomId}/answer`);
      onValue(answerRef, async (snapshot) => {
        const data = snapshot.val();
        if (data && peer.pc.signalingState !== "stable") {
          await peer.setRemoteDescription(data);
        }
      });

      // Callee ICE 수신 처리
      const calleeCandidatesRef = ref(db, `calls/${roomId}/calleeCandidates`);
      onValue(calleeCandidatesRef, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const candidate = new RTCIceCandidate(childSnapshot.val());
          peer.addIceCandidate(candidate);
        });
      });

      setRemoteStream(peer.remoteStream);
    };

    connect();

    return () => {
      // 연결 해제 및 DB 정리
      if (peerRef.current) {
        peerRef.current.close();
      }
      off(ref(db, `calls/${roomId}/answer`));
      off(ref(db, `calls/${roomId}/calleeCandidates`));
      remove(ref(db, `calls/${roomId}`));
    };
  }, [roomId]);

  return { remoteStream };
}