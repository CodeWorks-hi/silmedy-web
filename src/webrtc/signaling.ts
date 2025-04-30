import { db } from '@/firebase/firebase';
import {
  ref,
  onValue,
  push,
  set,
  remove,
  Unsubscribe,
} from 'firebase/database';

export function sendOffer(roomId: string, offer: RTCSessionDescriptionInit) {
  const offerRef = ref(db, `calls/${roomId}/offer`);
  return set(offerRef, offer);
}

export function sendAnswer(roomId: string, answer: RTCSessionDescriptionInit) {
  const answerRef = ref(db, `calls/${roomId}/answer`);
  return set(answerRef, answer);
}

export function sendIceCandidate(
  roomId: string,
  candidate: RTCIceCandidate,
  isCaller: boolean
) {
  const target = isCaller ? 'callerCandidates' : 'calleeCandidates';
  const candidatesRef = ref(db, `calls/${roomId}/${target}`);
  return push(candidatesRef, candidate.toJSON());
}

export function listenRemoteSDP(
  roomId: string,
  type: 'offer' | 'answer',
  callback: (sdp: RTCSessionDescriptionInit) => void
): Unsubscribe {
  const sdpRef = ref(db, `calls/${roomId}/${type}`);
  return onValue(sdpRef, (snapshot) => {
    const data = snapshot.val();
    if (data) callback(data);
  });
}

export function listenRemoteICE(
  roomId: string,
  isCaller: boolean,
  callback: (candidate: RTCIceCandidateInit) => void
): Unsubscribe {
  const target = isCaller ? 'calleeCandidates' : 'callerCandidates';
  const candidatesRef = ref(db, `calls/${roomId}/${target}`);
  return onValue(candidatesRef, (snapshot) => {
    snapshot.forEach((child) => {
      const candidate = child.val();
      if (candidate) callback(candidate);
    });
  });
}

export async function clearSignalingData(roomId: string) {
  await remove(ref(db, `calls/${roomId}`));
}