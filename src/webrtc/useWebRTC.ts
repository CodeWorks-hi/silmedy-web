import { useEffect, useRef, useState } from "react";
import { WebRTCPeer } from "@/webrtc/peer";
import { db, ref, set, onValue, push, off, remove } from "@/firebase/firebase";
import { sendOffer, sendAnswer, sendIceCandidate, listenRemoteSDP, listenRemoteICE, clearSignalingData } from './signaling';


export function useWebRTC(roomId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<WebRTCPeer | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);

  const startCall = async () => {
    const peer = new WebRTCPeer();
    peerRef.current = peer;
    const dc = peer.pc.createDataChannel("subtitles");
    console.log('[WebRTC] created dataChannel on caller side:', peer.dataChannel.readyState);
    setDataChannel(peer.dataChannel);
    peer.dataChannel.onopen  = () => console.log(" [WebRTC] dataChannel OPEN");
    peer.dataChannel.onclose = () => console.log("[WebRTC] dataChannel CLOSED");

    await peer.initLocalMedia();
    setLocalStream(peer.localStream);
    setRemoteStream(peer.remoteStream);

    peer.pc.ondatachannel = (event) => {
      console.log('[WebRTC] ondatachannel, label=', event.channel.label, 'state=', event.channel.readyState);
      setDataChannel(event.channel);
    };

    const stream = await peer.initLocalMedia();
    setLocalStream(stream);
    setRemoteStream(peer.remoteStream);

    peer.pc.ondatachannel = (event) => {
      setDataChannel(event.channel);
    };

    const offer = await peer.createOffer();
    await set(ref(db, `calls/${roomId}/offer`), offer);

    peer.onIceCandidate((candidate) => {
      const callerRef = ref(db, `calls/${roomId}/callerCandidates`);
      push(callerRef, candidate.toJSON());
    });

    const answerRef = ref(db, `calls/${roomId}/answer`);peer.pc.ondatachannel
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

    // signaling 데이터도 지워서 안드로이드가 종료를 감지하도록
  remove(ref(db, `calls/${roomId}`))
  .then(() => console.log('calls 경로 삭제'))
  .catch(err => console.error(err));
  };

  useEffect(() => {
    return () => {
      if (peerRef.current) peerRef.current.close();
      off(ref(db, `calls/${roomId}/answer`));
      off(ref(db, `calls/${roomId}/calleeCandidates`));
      remove(ref(db, `calls/${roomId}`));
    };
  }, [roomId]);

  return { localStream, remoteStream, dataChannel, startCall, stopCall };
}

