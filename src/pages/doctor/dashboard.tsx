'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookie from 'js-cookie';
import ScheduleTab from '@/components/doctor/ScheduleTab';
import ProfileTab from '@/components/doctor/ProfileTab';

export default function DoctorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'schedule' | 'profile'>('schedule');

  useEffect(() => {
    const role = Cookie.get('role');
    if (!role || role !== 'doctor') {
      alert('로그인이 필요합니다.');
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cyan-100 p-8">
      {/* 상단 탭 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'schedule' ? 'bg-white border-b-2 border-cyan-500 font-bold' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('schedule')}
          >
            진료 스케줄
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg ${activeTab === 'profile' ? 'bg-white border-b-2 border-cyan-500 font-bold' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('profile')}
          >
            내 프로필
          </button>
        </div>
        <button
          onClick={() => {
            Cookie.remove('role');
            Cookie.remove('doctor_id');
            router.push('/auth/login');
          }}
          className="text-sm text-gray-600 hover:underline"
        >
          로그아웃
        </button>
      </div>

      {/* 탭 본문 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'schedule' && <ScheduleTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>
    </div>
  );
}