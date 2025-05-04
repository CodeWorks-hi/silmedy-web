'use client';

import { useEffect, useRef, useState } from 'react';
import axios from '@/lib/axios';              // axios 인스턴스 (baseURL: http://…/api/v1 로 설정)
import {
  db,
  ref,
  set,
  push,
  onValue,
} from '@/firebase/firebase';                // RTDB 접근용 Firebase 클라이언트

export default function VideoCallPage() {
  // ─────────────────────────────────────────────
  // 상태 관리
  // ─────────────────────────────────────────────
  const [roomId, setRoomId] = useState<string | null>(null);    // 생성된 콜룸 ID
  const [remoteSdpReceived, setRemoteSdpReceived] = useState(false); // 원격 SDP 한 번만 처리하도록

  // ─────────────────────────────────────────────
  // Ref: PeerConnection 객체, 로컬·원격 비디오
  // ─────────────────────────────────────────────
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream    = useRef<MediaStream | null>(null);
  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // ─────────────────────────────────────────────
  // 1) 콜방 생성 & Offer 전송
  // ─────────────────────────────────────────────
  const handleStartCall = async () => {
    // 서버에 전송할 페이로드: doctor_id, patient_id, created_at, status
    const payload = {
      doctor_id:  'doctor_123456',           // 실제 로그인한 의사 ID로 교체
      patient_id: 'patient_22',              // 상담 대상 환자 ID로 교체
      created_at: new Date().toISOString(),  // 회의 생성 시각
      status:     'waiting',                 // 초기 상태
    };

    try {
      // **검수 1:** axios 인스턴스가 baseURL=`…/api/v1/video_calls` 로 설정되어 있는지 확인!
      // => 여기서는 POST '/create' → 실제 호출 URL: POST http://…/api/v1/video_calls/create
      const res = await axios.post('/create', payload);
      setRoomId(res.data.id);
      alert(`✅ 통화방 생성 완료: ${res.data.id}`);
    } catch (e) {
      console.error('❌ 통화방 생성 실패:', e);
      alert('통화방 생성에 실패했습니다.');
    }
  };

  // ─────────────────────────────────────────────
  // 2) roomId가 생기면 WebRTC 연결 절차 시작
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    // 🔍 검수 2: ICE 서버 설정(STUN만 써도 OK)
    const servers = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };
    peerConnection.current = new RTCPeerConnection(servers);

    // 2-1) ICE Candidate 발생 시 RTDB에 저장
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        const candidateRef = ref(db, `signaling/${roomId}/callerCandidates`);
        push(candidateRef, event.candidate.toJSON());
      }
    };

    // 2-2) 원격 트랙 수신 시 비디오 엘리먼트에 연결
    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // 2-3) 로컬 미디어(카메라·마이크) 획득 → PeerConnection에 추가 → Offer 생성·전송
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, stream);
        });
        return peerConnection.current!.createOffer();
      })
      .then((offer) => peerConnection.current!.setLocalDescription(offer).then(() => offer))
      .then((offer) => {
        // RTDB에 offer 저장
        const offerRef = ref(db, `signaling/${roomId}/offer`);
        return set(offerRef, offer);
      })
      .catch((err) => {
        console.error('❌ offer error:', err);
      });

    // 2-4) RTDB에서 answer 수신 대기
    const answerRef = ref(db, `signaling/${roomId}/answer`);
    const unsubscribeAnswer = onValue(answerRef, (snapshot) => {
      const answer = snapshot.val();
      if (answer && !remoteSdpReceived) {
        // 원격 SDP(Answer)를 PeerConnection에 설정
        const rtcAnswer = new RTCSessionDescription(answer);
        peerConnection.current?.setRemoteDescription(rtcAnswer);
        setRemoteSdpReceived(true);
      }
    });

    // 2-5) RTDB에서 callee ICE 후보 수신 대기
    const calleeCandidatesRef = ref(db, `signaling/${roomId}/calleeCandidates`);
    const unsubscribeCallee = onValue(calleeCandidatesRef, (snapshot) => {
      snapshot.forEach((child) => {
        const candidate = child.val();
        peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
      });
    });

    // 언마운트 시점에 리스너 해제
    return () => {
      unsubscribeAnswer();
      unsubscribeCallee();
      peerConnection.current?.close();
    };
  }, [roomId, remoteSdpReceived]);

  // ─────────────────────────────────────────────
  // 3) 렌더링
  // ─────────────────────────────────────────────
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">🩺 영상 통화 - 의사</h2>

      {/* 통화방 생성 & Offer 전송 버튼 */}
      <button
        onClick={handleStartCall}
        className="px-4 py-2 bg-cyan-500 text-white rounded"
      >
        통화방 생성 및 Offer 전송
      </button>

      {/* 로컬·원격 비디오 */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="font-semibold">내 화면</p>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full bg-black rounded"
          />
        </div>
        <div>
          <p className="font-semibold">상대 화면</p>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full bg-black rounded"
          />
        </div>
      </div>

      {/* 콜룸 ID 보여주기 */}
      {roomId && (
        <p className="text-green-600 font-mono">Room ID: {roomId}</p>
      )}
    </div>
  );
}