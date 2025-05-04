// src/features/hooks/useRequireAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';    // Firebase Auth 상태 구독
import { useRouter } from 'next/navigation';                 // Next.js 라우터
import { auth } from '@/firebase/firebase';                  // 초기화된 Firebase Auth 인스턴스

/**
 * useRequireAuth 훅
 * - Firebase Auth 상태를 실시간으로 구독합니다.
 * - 사용자가 인증되지 않은 경우 로그인 페이지로 리다이렉트합니다.
 * - 로딩 중 상태(loading)와 인증 여부(isAuthenticated)를 반환합니다.
 */
export function useRequireAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);            // 인증 상태 확인 중 표시
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // 인증 여부 상태

  useEffect(() => {
    // ① Firebase Auth 상태 변경 구독 시작
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        // ② 사용자가 로그인된 상태
        setIsAuthenticated(true);
      } else {
        // ③ 인증되지 않은 상태이면 로그인 페이지로 리다이렉트
        setIsAuthenticated(false);
        router.replace('/auth/login');
      }
      // ④ 인증 확인이 끝났으므로 로딩 해제
      setLoading(false);
    });

    // ⑤ 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, [router]);

  // 로딩 중인지, 인증되었는지 컴포넌트에서 사용할 수 있도록 반환
  return { loading, isAuthenticated };
}