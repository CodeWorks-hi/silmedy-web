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

  /**
   * 1) 로컬 미디어(카메라/마이크) 초기화
   * 2) Offer 생성 → RTDB 쓰기
   * 3) ICE candidate 송수신 리스너 등록
   */
  const startCall = async () => {
    const peer = new WebRTCPeer();
    peerRef.current = peer;

    // ── (1) 로컬 스트림 획득 ─────────────────────────
    await peer.initLocalMedia();
    setLocalStream(peer.localStream);
    setRemoteStream(peer.remoteStream);

    // ── (2) Offer 생성 & RTDB에 쓰기 ───────────────────
    //    offer 객체: { type: "offer", sdp: string }
    const offer = await peer.createOffer();
    await set(ref(db, `calls/${roomId}/offer`), offer);

    // ── (3) Local ICE candidate 전송 ─────────────────
    peer.onIceCandidate((candidate) => {
      const callerRef = ref(db, `calls/${roomId}/callerCandidates`);
      push(callerRef, candidate.toJSON());
    });

    // ── (4) Answer 수신 처리 ─────────────────────────
    const answerRef = ref(db, `calls/${roomId}/answer`);
    onValue(answerRef, async (snapshot) => {
      const raw = snapshot.val();
      if (!raw || peer.pc.signalingState === "stable") return;

      // 문자열 vs. 객체 형태 모두 처리
      let sdp: string | null = typeof raw === "string"
        ? raw
        : (raw as any).sdp || null;

      if (sdp) {
        await peer.setRemoteDescription({ type: "answer", sdp });
      }
    });

    // ── (5) Callee ICE 수신 처리 ───────────────────────
    const calleeRef = ref(db, `calls/${roomId}/calleeCandidates`);
    onValue(calleeRef, (snapshot) => {
      snapshot.forEach((child) => {
        const raw = child.val() as RTCIceCandidateInit;
        // sdpMid/sdpMLineIndex가 유효할 때만 candidate 생성
        if (raw.sdpMid != null && raw.sdpMLineIndex != null) {
          peer.addIceCandidate(new RTCIceCandidate(raw));
        } else {
          console.warn("무시된 ICE candidate:", raw);
        }
      });
    });
  };

  /** PeerConnection 닫고, 모든 리스너 해제 */
  const stopCall = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  /**
   * 컴포넌트 언마운트시:
   * - PeerConnection 닫기
   * - RTDB 리스너(off)
   * - RTDB에 남은 offer/answer/candidates 제거(remove)
   */
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

  return { localStream, remoteStream, startCall, stopCall };
}