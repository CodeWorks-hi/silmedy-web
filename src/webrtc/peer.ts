const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:13.209.17.4:3478',
    username: 'testuser',
    credential: 'testpass',
  },
];

export class WebRTCPeer {
  pc: RTCPeerConnection;
  localStream: MediaStream;
  remoteStream: MediaStream;

  constructor() {
    this.pc = new RTCPeerConnection({ iceServers });
    this.localStream = new MediaStream();
    this.remoteStream = new MediaStream();

    console.log('🛠️ [WEB] WebRTCPeer 인스턴스 생성됨');

    this.pc.oniceconnectionstatechange = () => {
      console.log(`🧊 [WEB] ICE 연결 상태 변경: ${this.pc.iceConnectionState}`);
    };

    this.pc.onconnectionstatechange = () => {
      console.log(`🔁 [WEB] PeerConnection 상태 변경: ${this.pc.connectionState}`);
    };

    this.pc.onsignalingstatechange = () => {
      console.log(`📶 [WEB] Signaling 상태 변경: ${this.pc.signalingState}`);
    };

    this.pc.ontrack = (event) => {
      console.log('📺 [WEB] ontrack fired:', event);

      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        console.log('📺 [WEB] 수신 스트림 트랙 목록:', stream.getTracks());
        stream.getTracks().forEach((track) => {
          console.log(
            `📥 [WEB] remoteStream에 추가: kind=${track.kind}, id=${track.id}`
          );
          this.remoteStream.addTrack(track);
        });
      } else {
        console.log(
          `📥 [WEB] 단일 트랙 수신: kind=${event.track.kind}, id=${event.track.id}`
        );
        this.remoteStream.addTrack(event.track);
      }

      // 🔍 실제로 remoteStream에 붙은 비디오 트랙들 확인
      console.log(
        '🔍 remoteStream videoTracks:',
        this.remoteStream.getVideoTracks()
      );
    };
  }

  startStatsMonitor() {
    console.log('📈 [WEB] WebRTC 통계 수집 시작');
    setInterval(() => {
      this.pc.getStats(null).then((stats) => {
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            console.log('📊 수신 프레임:', report.framesReceived);
            console.log('📊 패킷 손실:', report.packetsLost);
            console.log('📊 비디오 바이트:', report.bytesReceived);
          }
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            console.log('📶 연결된 candidate pair:', report);
          }
        });
      });
    }, 3000);
  }

  async initLocalMedia(constraints = { video: true, audio: true }) {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.localStream = stream;

    console.log('🎥 [WEB] 로컬 스트림 획득:', stream);
    console.log('🎥 [WEB] VideoTracks:', stream.getVideoTracks());
    console.log('🔊 [WEB] AudioTracks:', stream.getAudioTracks());

    stream.getTracks().forEach((track) => {
      console.log(`➡️ [WEB] addTrack: kind=${track.kind}, id=${track.id}`);
      this.pc.addTrack(track, stream);
    });

    return stream;
  }

  async createOffer() {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    console.log('📤 [WEB] SDP Offer 생성됨:', offer.sdp);
    return offer;
  }

  async createAnswer() {
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    console.log('📤 [WEB] SDP Answer 생성됨:', answer.sdp);
    return answer;
  }

  async setRemoteDescription(sdp: RTCSessionDescriptionInit) {
    if (!this.pc || this.pc.signalingState === 'closed') {
      console.warn(
        '🚫 [WEB] PeerConnection 닫힘. remoteDescription 설정 불가.'
      );
      return;
    }

    console.log('📥 [WEB] setRemoteDescription 호출됨:', sdp);

    try {
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log('✅ [WEB] setRemoteDescription 성공');
    } catch (err) {
      console.error('❌ [WEB] setRemoteDescription 실패:', err);
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    console.log('❄️ [WEB] ICE Candidate 추가됨:', candidate);
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ [WEB] ICE Candidate 적용 성공');
    } catch (err) {
      console.error('❌ [WEB] ICE Candidate 적용 실패:', err);
    }
  }

  onIceCandidate(callback: (candidate: RTCIceCandidate) => void) {
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('📡 [WEB] onicecandidate 발생:', event.candidate);
        callback(event.candidate);
      } else {
        console.log('📡 [WEB] onicecandidate: 모든 후보 전송 완료');
      }
    };
  }

  close() {
    this.pc.close();
    this.localStream.getTracks().forEach((t) => t.stop());
    this.remoteStream.getTracks().forEach((t) => t.stop());
    console.log('🧹 [WEB] PeerConnection 및 스트림 정리 완료');
  }
}