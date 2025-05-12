import { useEffect, useRef, useState } from "react";
import { WebRTCPeer } from "@/webrtc/peer";
import { db,ref,set,onValue,push,off,remove } from "@/firebase/firebase";
import { sendOffer, sendAnswer, sendIceCandidate, listenRemoteSDP, listenRemoteICE, clearSignalingData } from './signaling';


export function useWebRTC(roomId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<WebRTCPeer | null>(null);
  const [dataChannel, setDataChannel]     = useState<RTCDataChannel|null>(null);

  const startCall = async () => {
    const peer = new WebRTCPeer();
    peerRef.current = peer;

    await peer.initLocalMedia();
    setLocalStream(peer.localStream);
    setRemoteStream(peer.remoteStream);
    

    const stream = await peer.initLocalMedia();
    setLocalStream(stream);
    setRemoteStream(peer.remoteStream);

    const offer = await peer.createOffer();
    await set(ref(db, `calls/${roomId}/offer`), offer);
    

    peer.onIceCandidate((candidate) => {
      console.log("📡 [HOOK] 로컬 ICE 후보 전송:", candidate);
      const callerRef = ref(db, `calls/${roomId}/callerCandidates`);
      push(callerRef, candidate.toJSON());
    });

    const answerRef = ref(db, `calls/${roomId}/answer`);
    onValue(answerRef, async (snapshot) => {
      const raw = snapshot.val();
      

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

