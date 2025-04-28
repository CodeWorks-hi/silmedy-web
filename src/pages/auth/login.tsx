'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookie from 'js-cookie';

interface Hospital {
  name: string;
  hospital_id: number;
}

export default function LoginPage() {
  const router = useRouter();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<number | null>(null);
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    department: '',
    doctorId: '',
    password: '',
  });

  // 🔵 보건소 리스트 가져오기
  useEffect(() => {
    async function fetchHospitals() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/hospitals`);
        setHospitals(res.data.hospitals);
      } catch (error) {
        console.error('보건소 불러오기 실패:', error);
      }
    }
    fetchHospitals();
  }, []);

  // 🔵 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔵 역할 변경 핸들러 (✅ formData 초기화만 하고 보건소는 유지)
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
    setFormData({
      department: '',
      doctorId: '',
      password: '',
    });
    // ❗ selectedHospitalId는 초기화하지 않는다
  };

  // 🔵 보건소 선택 핸들러
  const handleHospitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hospitalId = Number(e.target.value);
    setSelectedHospitalId(hospitalId);
  };

  // 🔵 로그인 요청
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (role === 'admin') {
        if (!selectedHospitalId) {
          alert('보건소를 선택하세요.');
          return;
        }

        // ✅ 관리자 로그인
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/login/admin`, {
          admin_id: selectedHospitalId,
          password: formData.password,
        });

        Cookie.set('role', 'admin');
        Cookie.set('admin_id', String(selectedHospitalId));

        alert('관리자 로그인 성공');
        router.push('/admin/dashboard');

      } else if (role === 'doctor') {
        if (!selectedHospitalId) {
          alert('보건소를 선택하세요.');
          return;
        }
        if (!formData.department || !formData.doctorId || !formData.password) {
          alert('모든 필드를 입력하세요.');
          return;
        }

        // ✅ 의사 로그인
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/login/doctor`, {
          license_number: formData.doctorId,
          department: formData.department,
          password: formData.password,
          
        });

        Cookie.set('role', 'doctor');
        Cookie.set('license_number', formData.doctorId);
        Cookie.set('hospital_id', String(selectedHospitalId));
        Cookie.set('department', formData.department);

        alert('의사 로그인 성공');
        router.push('/doctor/dashboard');

      } else {
        alert('구분을 선택하세요.');
      }
    } catch (error) {
      console.error(error);
      alert('로그인 실패');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-cyan-100">
      <h1 className="text-4xl font-bold text-cyan-500 mb-8">Silmedy</h1>

      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <form onSubmit={handleSubmit}>
          {/* 보건소 */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">보건소</label>
            <select
              value={selectedHospitalId ?? ''}
              onChange={handleHospitalChange}
              className="w-full border rounded-md p-2 text-sm"
              required
            >
              <option value="">보건소 선택</option>
              {hospitals.map((hospital) => (
                <option key={hospital.hospital_id} value={hospital.hospital_id}>
                  {hospital.name}
                </option>
              ))}
            </select>
          </div>

          {/* 구분 */}
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

          {/* 의사 전용 필드 */}
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
                <label className="block mb-1 text-sm font-medium">의사 번호</label>
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

          {/* 비밀번호 */}
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