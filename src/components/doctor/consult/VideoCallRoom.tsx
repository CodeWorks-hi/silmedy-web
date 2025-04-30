// src/components/VideoCallRoom.tsx

import React, { useEffect, useRef } from "react";
import { useWebRTC } from "@/webrtc/useWebRTC"; 

interface Props {
  roomId: string;
}

const VideoCallRoom: React.FC<Props> = ({ roomId }) => {
  const { remoteStream } = useWebRTC(roomId);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2>원격 영상</h2>
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: "80%", maxWidth: "600px", border: "1px solid #ccc", borderRadius: 8 }}
      />
    </div>
  );
};

export default VideoCallRoom;