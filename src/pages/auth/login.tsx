'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import Cookie from 'js-cookie';  // 쿠키 조작 라이브러리
import { login, getHospitals } from '@/lib/api'; // 공통 API 함수 불러오기
import Image from 'next/image';  // Next.js 최적화 이미지
import { Hospital } from '@/types/consult';

export default function LoginPage() {
  const router = useRouter();

  // 보건소 목록 상태
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalName, setSelectedHospitalName] = useState('');
  // 선택된 보건소 ID 상태
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  // 로그인 역할 상태 ('admin' 또는 'doctor')
  const [role, setRole] = useState('');
  // 폼 입력값 상태 (과, 의사번호, 비밀번호)
  const [formData, setFormData] = useState({
    department: '',
    doctorId: '',
    password: '',
  });

  // 컴포넌트 마운트 시 보건소 목록을 API에서 불러와 상태에 저장
  useEffect(() => {
    async function fetchHospitals() {
      // API 함수로 보건소 목록 가져오기
      try {
        const list = await getHospitals();       // API 호출
        list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        setHospitals(list);                      // 상태에 저장
      } catch (error) {
        console.error('보건소 목록 조회 실패:', error);
      }
    }
    fetchHospitals();
  }, []);

  // input 및 select 요소의 변경 이벤트 처리
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 역할(role) 선택 변경 시 입력 폼 초기화
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
    setFormData({
      department: '',
      doctorId: '',
      password: '',
    });
  };

  // 보건소 선택 변경 시 상태 업데이트
  const handleHospitalChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const hospitalId = Number(e.target.value);
    setSelectedHospitalId(hospitalId);
  };

  // 폼 제출 시 로그인 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 보건소 미선택 시 안내
    if (!selectedHospitalId) {
      alert('보건소를 선택하세요.');
      return;
    }

    // 공통 페이로드 구성
    const commonPayload: any = {
      role,
      hospital_id: selectedHospitalId,
      password: formData.password,
    };

    // 의사 로그인일 경우 추가 필수 필드 검사 및 페이로드에 추가
    if (role === 'doctor') {
      if (!formData.department || !formData.doctorId || !formData.password) {
        alert('모든 필드를 입력하세요.');
        return;
      }
      commonPayload.license_number = formData.doctorId;
      commonPayload.department     = formData.department;
    }

    try {
      // 로그인 API 함수 호출 (모듈화된 공통 함수 사용)
      const { access_token, firebase_token, token_type, admin, doctor } = await login(commonPayload);

      // Firebase Auth에 커스텀 토큰으로 로그인
      await signInWithCustomToken(auth, firebase_token);

      // Local Storage에 토큰과 역할 저장
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('role', role);

      // 쿠키에도 동일한 값 저장 (도메인 전체에서 접근 가능)
      Cookie.set('role', role);
      Cookie.set('hospital_id', String(selectedHospitalId));

      // 역할별 추가 저장 및 페이지 이동
      if (role === 'doctor') {
        localStorage.setItem('doctor_name', doctor.name);
        localStorage.setItem('doctor_id', formData.doctorId);
        localStorage.setItem('department', formData.department);
        Cookie.set('doctor_id', formData.doctorId);
        alert('의사 로그인 완료');
        router.push('/doctor/dashboard');
      } else {  // role === 'admin'
        localStorage.setItem('admin_id', String(selectedHospitalId));
        Cookie.set('admin_id', String(selectedHospitalId));
        alert('관리자 로그인 완료');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      alert('로그인 실패');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-cyan-100">
      {/* 로고와 로그인 텍스트 조합 */}
      <div className="flex items-center mb-8">
        {/* Silmedy 로고 이미지 */}
        <Image
          src="/logo_sil.png"            // public/logo_sil.png
          alt="Silmedy Logo"
          width={120}                     // 로고 너비
          height={40}                     // 로고 높이
        />
        {/* 로그인 텍스트 */}
        <h1 className="text-4xl font-bold text-cyan-500 ml-4">
        Silmedy 로그인
        </h1>
      </div>
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <form onSubmit={handleSubmit}>
          {/* 보건소 선택 */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">보건소</label>
            <input
      list="hospital-list"
      value={selectedHospitalName}
      onChange={e => {
        const name = e.target.value;
        setSelectedHospitalName(name);
        const found = hospitals.find(h => h.name === name);
        setSelectedHospitalId(found?.hospital_id ?? null);
      }}
      placeholder="보건소 선택 또는 입력"
      className="w-full border rounded-md p-2 text-sm"
      required
    />
    <datalist id="hospital-list">
      {hospitals.map(h => (
        <option key={h.hospital_id} value={h.name} />
      ))}
    </datalist>
          </div>

          {/* 역할 선택 */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">구분</label>
            <select
              value={role}
              onChange={handleRoleChange}
              className="w-full border rounded-md p-2 text-sm"
              required
            >
              <option value="">구분 선택</option>
              <option value="admin">관리자</option>
              <option value="doctor">의사</option>
            </select>
          </div>

          {/* 의사 전용 입력란 (조건부 렌더링) */}
          {role === 'doctor' && (
            <>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">과</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 text-sm"
                  required
                >
                  <option value="">과 선택</option>
                  <option value="내과">내과</option>
                  <option value="외과">외과</option>
                  <option value="내외과">내외과</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">
                  의사 번호
                </label>
                <input
                  type="text"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  placeholder="의사 번호 입력"
                  className="w-full border rounded-md p-2 text-sm"
                  required
                />
              </div>
            </>
          )}

          {/* 비밀번호 입력 */}
          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              className="w-full border rounded-md p-2 text-sm"
              required
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-md text-sm"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
