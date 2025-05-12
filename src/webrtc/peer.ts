const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: [
      'turn:turn.boohoday.com:3478?transport=udp',
      'turn:turn.boohoday.com:3478?transport=tcp',
      'turns:turn.boohoday.com:5349?transport=tcp'
    ],
    username: 'testuser',
    credential: 'testpass',
  },
];

export class WebRTCPeer {
  pc: RTCPeerConnection;
  localStream: MediaStream;
  remoteStream: MediaStream;
  dataChannel: RTCDataChannel;
  onDataChannelMessage?: (msg: string) => void;

  constructor() {
    this.pc = new RTCPeerConnection({ iceServers });
    this.localStream = new MediaStream();
    this.remoteStream = new MediaStream();

    // 데이터 채널 생성 (의사→환자 자막 전송용)
    this.dataChannel = this.pc.createDataChannel('subtitles');
    this.dataChannel.onopen = () => console.log('📡 DC open');
    this.dataChannel.onclose = () => console.log('📡 DC closed');

    // 환자 쪽에서 ondatachannel로 받기
    this.pc.ondatachannel = (event) => {
      const channel = event.channel;
      channel.onmessage = (e) => {
        console.log('📩 received subtitle:', e.data);
        this.onDataChannelMessage?.(e.data);
      };
    };

    this.pc.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE state: ${this.pc.iceConnectionState}`);
    };
    this.pc.onconnectionstatechange = () => {
      console.log(`🔁 Connection state: ${this.pc.connectionState}`);
    };
    this.pc.onsignalingstatechange = () => {
      console.log(`📶 Signaling state: ${this.pc.signalingState}`);
    };

    this.pc.ontrack = (event) => {
      console.log('🎥 useWebRTC ontrack 이벤트 발생:', event);
      const stream = event.streams?.[0] ?? new MediaStream([event.track]);
      stream.getTracks().forEach((track) => {
        console.log(`📥 Adding track: kind=${track.kind}, id=${track.id}`);
        this.remoteStream.addTrack(track);
      });
    };
  }

  async initLocalMedia(constraints = { video: true, audio: true }) {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.localStream = stream;
    stream.getTracks().forEach((track) => {
      this.pc.addTrack(track, stream);
    });
    console.log('🎥 Local media initialized');
    return stream;
  }

  async createOffer() {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    console.log('📤 Created offer:', offer);
    return offer;
  }

  async createAnswer() {
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    console.log('📤 Created answer:', answer);
    return answer;
  }

  async setRemoteDescription(sdp: RTCSessionDescriptionInit) {
    if (this.pc.signalingState === 'closed') {
      console.warn('🚫 Cannot set remote description; connection closed');
      return;
    }
    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    console.log('📥 Remote description set');
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    console.log('❄️ ICE candidate added:', candidate);
  }

  onIceCandidate(callback: (candidate: RTCIceCandidate) => void) {
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('📡 ICE candidate generated:', event.candidate);
        callback(event.candidate);
      } else {
        console.log('📡 All ICE candidates sent');
      }
    };
  }

  startStatsMonitor() {
    setInterval(async () => {
      const stats = await this.pc.getStats();
      stats.forEach((report) => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          console.log('📊 Frames received:', report.framesReceived);
          console.log('📊 Packets lost:', report.packetsLost);
        }
      });
    }, 3000);
  }

  close() {
    this.pc.close();
    this.localStream.getTracks().forEach((t) => t.stop());
    this.remoteStream.getTracks().forEach((t) => t.stop());
    console.log('🧹 Peer connection closed and tracks stopped');
  }
}