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
    console.log("🟢 [HOOK] startCall 시작됨");
    const peer = new WebRTCPeer();
    peerRef.current = peer;

    await peer.initLocalMedia();
    setLocalStream(peer.localStream);
    setRemoteStream(peer.remoteStream);
    console.log("📡 [HOOK] 로컬/리모트 스트림 상태 업데이트 완료");

    const offer = await peer.createOffer();
    await set(ref(db, `calls/${roomId}/offer`), offer);
    console.log("📤 [HOOK] Firebase에 offer 저장 완료");

    peer.onIceCandidate((candidate) => {
      console.log("📡 [HOOK] 로컬 ICE 후보 전송:", candidate);
      const callerRef = ref(db, `calls/${roomId}/callerCandidates`);
      push(callerRef, candidate.toJSON());
    });

    const answerRef = ref(db, `calls/${roomId}/answer`);
    onValue(answerRef, async (snapshot) => {
      const raw = snapshot.val();
      console.log("📥 [HOOK] answer 수신됨:", raw);

      if (!raw || peer.pc.signalingState === 'closed') return;

      let sdp = typeof raw === 'string' ? raw : raw.sdp || null;
      if (sdp) {
        await peer.setRemoteDescription({ type: 'answer', sdp });
      }
    });

    const calleeRef = ref(db, `calls/${roomId}/calleeCandidates`);
    onValue(calleeRef, (snapshot) => {
      snapshot.forEach((child) => {
        const raw = child.val() as {
          sdp?: string;
          candidate?: string;
          sdpMid?: string;
          sdpMLineIndex?: number;
        };
        console.log("📥 [HOOK] callee ICE 수신됨:", raw);
    
        // raw.candidate 가 없으면 raw.sdp 를 대신 candidate 로 사용
        const iceInit: RTCIceCandidateInit = {
          candidate: raw.candidate ?? raw.sdp ?? "",
          sdpMid: raw.sdpMid!,
          sdpMLineIndex: raw.sdpMLineIndex!
        };
    
        if (iceInit.candidate) {
          peer.addIceCandidate(iceInit);
        } else {
          console.warn("⚠️ 무시된 빈 ICE candidate:", raw);
        }
      });
    })
  };

  const stopCall = () => {
    console.log("🔴 [HOOK] stopCall 호출됨");
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  useEffect(() => {
    return () => {
      console.log("🧹 [HOOK] useEffect 클린업 실행됨");
      if (peerRef.current) peerRef.current.close();
      off(ref(db, `calls/${roomId}/answer`));
      off(ref(db, `calls/${roomId}/calleeCandidates`));
      remove(ref(db, `calls/${roomId}`));
    };
  }, [roomId]);

  return { localStream, remoteStream, startCall, stopCall };
}

