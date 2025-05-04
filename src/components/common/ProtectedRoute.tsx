'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookie from 'js-cookie';

interface ProtectedRouteProps {
  children: ReactNode;            // 보호할 자식 컴포넌트
  allowedRole: 'admin' | 'doctor';// 허용할 사용자 역할
}

/**
 * 사용자 권한(롤)을 검사하여 인증되지 않았거나 권한이 맞지 않으면
 * 로그인 페이지로 리다이렉트하는 컴포넌트
 */
export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    // 저장된 역할과 사용자 ID 가져오기
    const role = Cookie.get('role');
    const userIdKey = allowedRole === 'admin' ? 'admin_id' : 'doctor_id';
    const userId = Cookie.get(userIdKey);

    // 역할 미일치 또는 ID 미존재 시 로그인 페이지로 이동
    if (role !== allowedRole || !userId) {
      router.replace('/auth/login');
    }
  }, [allowedRole, router]);

  // 인증 검사 완료 후 자식 컴포넌트 렌더링
  return <>{children}</>;
}
