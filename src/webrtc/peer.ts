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
  dataChannel!: RTCDataChannel;            // ★ 추가
  onDataChannelMessage?: (msg: string) => void;

  constructor() {
    this.pc = new RTCPeerConnection({ iceServers });
    this.localStream = new MediaStream();
    this.remoteStream = new MediaStream();

    // **데이터채널 생성 (의사→환자 자막 전송용)**
    this.dataChannel = this.pc.createDataChannel('subtitles');
    this.dataChannel.onopen = () => console.log('📡 DC open');
    this.dataChannel.onclose = () => console.log('📡 DC closed');

    // **환자 쪽에서 ondatachannel로 받기**
    this.pc.ondatachannel = (event) => {
      const channel = event.channel;
      channel.onmessage = (e) => {
        console.log('📩 received subtitle:', e.data);
        if (this.onDataChannelMessage) {
          this.onDataChannelMessage(e.data);
        }
      };
    };
    
    this.pc.oniceconnectionstatechange = () => {
    };

    this.pc.onconnectionstatechange = () => {
    };

    this.pc.onsignalingstatechange = () => {
    };

    this.pc.ontrack = (event) => {

      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        stream.getTracks().forEach((track) => {
          this.remoteStream.addTrack(track);
        });
      } else {
        this.remoteStream.addTrack(event.track);
      }
    };
  }

  startStatsMonitor() {
    setInterval(() => {
      this.pc.getStats(null).then((stats) => {
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
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

    stream.getTracks().forEach((track) => {
      this.pc.addTrack(track, stream);
    });

    return stream;
  }

  async createOffer() {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }

  async createAnswer() {
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }

  async setRemoteDescription(sdp: RTCSessionDescriptionInit) {
    if (!this.pc || this.pc.signalingState === 'closed') {
      console.warn(
        '🚫 [WEB] PeerConnection 닫힘. remoteDescription 설정 불가.'
      );
      return;
    }


    try {
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    } catch (err) {
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
    }
  }

  onIceCandidate(callback: (candidate: RTCIceCandidate) => void) {
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        callback(event.candidate);
      } else {
      }
    };
  }

  close() {
    this.pc.close();
    this.localStream.getTracks().forEach((t) => t.stop());
    this.remoteStream.getTracks().forEach((t) => t.stop());
  }
}