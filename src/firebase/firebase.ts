// src/firebase/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getDatabase,
  ref,
  set,
  onValue,
  push,
  off,
  remove,
} from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:             process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:         process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId:  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:              process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  databaseURL:        process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
};

// **1) 클라이언트 환경에서만 Firebase 앱 초기화**
let app;
if (typeof window !== 'undefined') {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

// **2) Analytics (브라우저 전용)**
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported && app) analytics = getAnalytics(app);
  });
}

// **3) 데이터베이스 / firestore / auth도 클라이언트 전용으로 설정**
const db = typeof window !== 'undefined' && app ? getDatabase(app) : null;
const firestore = typeof window !== 'undefined' && app ? getFirestore(app) : null;
const auth = typeof window !== 'undefined' && app ? getAuth(app) : null;

export {
  app,
  analytics,
  db,
  firestore,
  auth,
  ref,
  set,
  onValue,
  push,
  off,
  remove,
};