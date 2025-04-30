import { useEffect, useRef, useState } from "react";
import { db, ref, set, onValue, push } from "../firebase";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useWebRTC(roomId) {
  const pcRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    const pc = new RTCPeerConnection(configuration);
    pcRef.current = pc;

    const remote = new MediaStream();
    setRemoteStream(remote);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    });

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remote.addTrack(track);
      });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const callerCandidatesRef = ref(db, `calls/${roomId}/callerCandidates`);
        push(callerCandidatesRef, event.candidate.toJSON());
      }
    };

    pc.createOffer().then((offer) => {
      pc.setLocalDescription(offer);
      set(ref(db, `calls/${roomId}/offer`), offer);
    });

    const answerRef = ref(db, `calls/${roomId}/answer`);
    onValue(answerRef, async (snapshot) => {
      const data = snapshot.val();
      if (data && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
      }
    });

    const calleeCandidatesRef = ref(db, `calls/${roomId}/calleeCandidates`);
    onValue(calleeCandidatesRef, (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const candidate = new RTCIceCandidate(childSnapshot.val());
        pc.addIceCandidate(candidate);
      });
    });

    return () => pc.close();
  }, [roomId]);

  return { remoteStream };
}