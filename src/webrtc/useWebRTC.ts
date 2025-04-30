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
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<WebRTCPeer | null>(null);

  const startCall = async () => {
    const peer = new WebRTCPeer();
    peerRef.current = peer;

    await peer.initLocalMedia();
    setLocalStream(peer.localStream);
    setRemoteStream(peer.remoteStream);

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
  };

  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.close();
      }
      off(ref(db, `calls/${roomId}/answer`));
      off(ref(db, `calls/${roomId}/calleeCandidates`));
      remove(ref(db, `calls/${roomId}`));
    };
  }, [roomId]);

  return { localStream, remoteStream, startCall };
}