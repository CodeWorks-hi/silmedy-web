// src/webrtc/useWebRTC.ts
import { useEffect, useRef, useState } from 'react';
import { WebRTCPeer } from '@/webrtc/peer';
import { db, ref, set, push, onValue, off, remove } from '@/firebase/firebase';

export function useWebRTC(roomId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const peerRef = useRef<WebRTCPeer | null>(null);

  // cleanup on unmount or roomId change
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      // remove all Firebase listeners and data
      off(ref(db, `calls/${roomId}/answer`));
      off(ref(db, `calls/${roomId}/calleeCandidates`));
      remove(ref(db, `calls/${roomId}`));
    };
  }, [roomId]);

  const startCall = async () => {
    const peer = new WebRTCPeer();
    peerRef.current = peer;

    // 1) get local media once
    const stream = await peer.initLocalMedia();
    setLocalStream(stream);
    setRemoteStream(peer.remoteStream);

    // 2) expose data channel for subtitles
    setDataChannel(peer.dataChannel);

    // 3) create & send offer
    const offer = await peer.createOffer();
    await set(ref(db, `calls/${roomId}/offer`), offer);

    // 4) ICE candidate handling
    peer.onIceCandidate((candidate) => {
      push(ref(db, `calls/${roomId}/callerCandidates`), candidate.toJSON());
    });

    // 5) listen for answer
    const answerRef = ref(db, `calls/${roomId}/answer`);
    onValue(answerRef, async (snap) => {
      const raw = snap.val();
      if (!raw || peer.pc.signalingState === 'closed') return;
      const sdp = typeof raw === 'string' ? raw : raw.sdp;
      if (sdp) {
        await peer.setRemoteDescription({ type: 'answer', sdp });
      }
    });

    // 6) listen for callee ICE candidates
    const calleeRef = ref(db, `calls/${roomId}/calleeCandidates`);
onValue(calleeRef, (snapshot) => {
  snapshot.forEach((child) => {
    const raw = child.val() as RTCIceCandidateInit;
    if (raw.candidate) {
      peer.addIceCandidate({
        candidate: raw.candidate,
        sdpMid: raw.sdpMid!,
        sdpMLineIndex: raw.sdpMLineIndex!
      });
    }
  });
});
  };

  const stopCall = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
      setLocalStream(null);
      setRemoteStream(null);
      setDataChannel(null);
      // also clear signaling data immediately
      remove(ref(db, `calls/${roomId}`));
    }
  };

  return { localStream, remoteStream, dataChannel, startCall, stopCall };
}