// src/firebase/firebase.ts

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  getDatabase,
  ref,
  set,
  onValue,
  push,
  off,
  remove,
} from 'firebase/database';
import { getFirestore } from 'firebase/firestore'; // Firestore 필요 시 사용

// 환경변수에서 Firebase 설정 불러오기
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
};

// 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const firestore = getFirestore(app); // Firestore 필요 시

export {
  app,
  analytics,
  db,
  firestore, // Firestore 쓰지 않으면 제거해도 무방
  ref,
  set,
  onValue,
  push,
  off,
  remove,
};