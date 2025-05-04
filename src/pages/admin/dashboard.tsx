// src/pages/admin/dashboard.tsx
'use client';

import { useState } from 'react';
import UploadTab from '@/components/admin/UploadTab';
import ManageTab from '@/components/admin/ManageTab';
import { useRouter } from 'next/navigation';
import Cookie from 'js-cookie';
import { useRequireAuth } from '@/features/hooks/useRequireAuth';  // Firebase 인증 훅

export default function AdminDashboard() {
  const router = useRouter();

  // 1) Firebase 로그인 상태 확인
  const { loading, isAuthenticated } = useRequireAuth();
  // 2) 탭 상태 훅 (항상 호출되어야 함)
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');

  // 로딩 중 표시
  if (loading) {
    return <div className="p-8 text-center">인증 확인 중…</div>;
  }
  // 인증 실패 시 로그인 페이지로 이동
  if (!isAuthenticated) {
    router.replace('/auth/login');
    return null;
  }

  // 3) 역할 기반 접근 제어
  const role = Cookie.get('role');            // 쿠키에서 role 읽기
  const adminId = Cookie.get('admin_id');     // 쿠키에서 admin_id 읽기
  if (role !== 'admin' || !adminId) {
    alert('관리자 권한이 필요합니다.');
    router.replace('/auth/login');
    return null;
  }

  // 로그아웃 처리: 쿠키 제거 후 로그인 페이지로 이동
  const handleLogout = () => {
    Cookie.remove('role');
    Cookie.remove('admin_id');
    router.replace('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cyan-100 p-8">
      {/* 상단 탭 및 로그아웃 버튼 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex space-x-4">
          {/* 직원 등록 탭 */}
          <button
            className={`px-4 py-2 rounded-t-lg ${
              activeTab === 'upload'
                ? 'bg-white border-b-2 border-cyan-500 font-bold'
                : 'bg-gray-100'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            직원 등록
          </button>
          {/* 직원 관리 탭 */}
          <button
            className={`px-4 py-2 rounded-t-lg ${
              activeTab === 'manage'
                ? 'bg-white border-b-2 border-cyan-500 font-bold'
                : 'bg-gray-100'
            }`}
            onClick={() => setActiveTab('manage')}
          >
            직원 관리
          </button>
        </div>
        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:underline"
        >
          로그아웃
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'upload' && <UploadTab />}
        {activeTab === 'manage' && <ManageTab />}
      </div>
    </div>
  );
}