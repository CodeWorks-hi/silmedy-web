// src/webrtc/signaling.js

import { getDatabase, ref, onChildAdded, push, remove } from "firebase/database";
import { app } from "../firebase/firebase"; // firebase.js에서 초기화한 Firebase 앱

const db = getDatabase(app);

export const sendSignal = (roomId, data) => {
  const signalsRef = ref(db, `rooms/${roomId}/signals`);
  push(signalsRef, data);
};

export const listenForSignals = (roomId, callback) => {
  const signalsRef = ref(db, `rooms/${roomId}/signals`);
  onChildAdded(signalsRef, snapshot => {
    const data = snapshot.val();
    callback(data);
    remove(snapshot.ref); // 일회성 처리 후 삭제
  });
};