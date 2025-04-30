// src/lib/peer.ts

const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

export class WebRTCPeer {
  pc: RTCPeerConnection;
  localStream: MediaStream;
  remoteStream: MediaStream;

  constructor() {
    this.pc = new RTCPeerConnection({ iceServers });
    this.localStream = new MediaStream();
    this.remoteStream = new MediaStream();

    this.pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
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
    await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  onIceCandidate(callback: (candidate: RTCIceCandidate) => void) {
    this.pc.onicecandidate = (event) => {
      if (event.candidate) callback(event.candidate);
    };
  }

  close() {
    this.pc.close();
    this.localStream.getTracks().forEach((t) => t.stop());
    this.remoteStream.getTracks().forEach((t) => t.stop());
  }
}