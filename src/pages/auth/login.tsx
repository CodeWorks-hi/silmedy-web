'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [role, setRole] = useState(''); // 구분 선택값
  const [formData, setFormData] = useState({
    centerName: '',
    department: '',
    doctorId: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
    setFormData({
      centerName: '',
      department: '',
      doctorId: '',
      password: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData, role);
    // TODO: 로그인 API 연결 예정
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-cyan-100">
      <h1 className="text-4xl font-bold text-cyan-500 mb-8">Silmedy</h1>
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">보건소</label>
            <input
              type="text"
              name="centerName"
              value={formData.centerName}
              onChange={handleChange}
              placeholder="보건소"
              className="w-full border rounded-md p-2 text-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">구분</label>
            <select
              name="role"
              value={role}
              onChange={handleRoleChange}
              className="w-full border rounded-md p-2 text-sm"
              required
            >
              <option value="">구분 선택하세요</option>
              <option value="admin">관리자</option>
              <option value="doctor">의사</option>
            </select>
          </div>

          {role === 'doctor' && (
            <>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">과</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="과 입력"
                  className="w-full border rounded-md p-2 text-sm"
                  required
                />
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