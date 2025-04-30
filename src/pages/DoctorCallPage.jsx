import React, { useEffect, useRef } from "react";
import { useWebRTC } from "../hooks/useWebRTC";

export default function DoctorCallPage() {
  const { remoteStream } = useWebRTC("room_abc123");
  const remoteRef = useRef();

  useEffect(() => {
    if (remoteStream && remoteRef.current) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div>
      <h1>Doctor Call</h1>
      <video ref={remoteRef} autoPlay playsInline />
    </div>
  );
}