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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
    setFormData({
      department: '',
      doctorId: '',
      password: '',
    });
  };

  const handleHospitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hospitalId = Number(e.target.value);
    setSelectedHospitalId(hospitalId);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      if (!selectedHospitalId) {
        alert('보건소를 선택하세요.');
        return;
      }
  
      const commonPayload: any = {
        role,
        hospital_id: selectedHospitalId,
        password: formData.password,
      };
  
      if (role === 'doctor') {
        if (!formData.department || !formData.doctorId || !formData.password) {
          alert('모든 필드를 입력하세요.');
          return;
        }
  
        commonPayload.license_number = formData.doctorId;
        commonPayload.department = formData.department;
      }
  
      console.log('👀 payload 전송:', commonPayload);
  
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/login`, commonPayload);
  
      Cookie.set('role', role);
  
      if (role === 'doctor') {
        Cookie.set('license_number', formData.doctorId);
        Cookie.set('hospital_id', String(selectedHospitalId));
        Cookie.set('department', formData.department);
        alert('의사 로그인 성공');
        router.push('/doctor/dashboard');
      } else if (role === 'admin') {
        Cookie.set('admin_id', String(selectedHospitalId));
        Cookie.set('hospital_id', String(selectedHospitalId));
        alert('관리자 로그인 성공');
        router.push('/admin/dashboard');
      } else {
        alert('역할을 선택하세요.');
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