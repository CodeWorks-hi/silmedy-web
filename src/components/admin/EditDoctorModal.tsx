'use client';

import { useState } from 'react';
import { Doctor } from '@/features/hooks/useDoctors';
import axios from 'axios';

interface EditDoctorModalProps {
  doctor: Doctor;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditDoctorModal({ doctor, onClose, onUpdated }: EditDoctorModalProps) {
  const [formData, setFormData] = useState({
    contact: doctor.contact || '',
    email: doctor.email || '',
    department: doctor.department || '',
    password: doctor.password || '',
    bio: doctor.bio?.join('\n') || '',
    availability: doctor.availability || {},
  });

  const [updating, setUpdating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvailabilityChange = (day: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setUpdating(true);
    try {
      const payload = {
        contact: formData.contact,
        email: formData.email,
        department: formData.department,
        password: formData.password,
        bio: formData.bio.split('\n').filter((line) => line.trim() !== ''),
        availability: formData.availability,
      };
  
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/update/doctor/${doctor.license_number}`,
        payload
      );
  
      if (res.status === 200) {
        alert('수정 완료');
        onUpdated();
        onClose();
      } else {
        alert('수정 실패');
      }
    } catch (error) {
      console.error(error);
      alert('수정 실패');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-2xl font-bold mb-6">직원 정보 수정</h2>

        {/* 프로필 사진 */}
        <div className="flex justify-center mb-6">
          <img
            src={doctor.profile_url || '/default-profile.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>

        {/* 폼 입력 영역 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 읽기 전용 필드 */}
          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">병원 ID</label>
            <input
              type="text"
              value={doctor.hospital_id ?? ''}
              readOnly
              className="bg-gray-100 border px-4 py-2 rounded-md"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">이름</label>
            <input
              type="text"
              value={doctor.name}
              readOnly
              className="bg-gray-100 border px-4 py-2 rounded-md"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">성별</label>
            <input
              type="text"
              value={doctor.gender}
              readOnly
              className="bg-gray-100 border px-4 py-2 rounded-md"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">라이센스 번호</label>
            <input
              type="text"
              value={doctor.license_number}
              readOnly
              className="bg-gray-100 border px-4 py-2 rounded-md"
            />
          </div>

          {/* 수정 가능 필드 */}
          <div className="flex flex-col col-span-2">
            <label className="text-gray-700 mb-1">연락처</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              className="bg-white border px-4 py-2 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-white border px-4 py-2 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">직책 (과)</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="bg-white border px-4 py-2 rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="bg-white border px-4 py-2 rounded-md"
            />
          </div>

          {/* 학력 (Bio) */}
          <div className="flex flex-col col-span-2">
            <label className="text-gray-700 mb-1">학력 (Bio)</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleInputChange}
              className="bg-white border px-4 py-2 rounded-md resize-none"
            />
          </div>

          {/* 진료 가능 시간 */}
          {['월', '화', '수', '목', '금'].map((day) => (
            <div key={day} className="flex flex-col">
              <label className="text-gray-700 mb-1">{day}</label>
              <input
                type="text"
                value={formData.availability?.[day] || ''}
                onChange={(e) => handleAvailabilityChange(day, e.target.value)}
                className="bg-white border px-4 py-2 rounded-md"
                placeholder="예: 09:00-16:00"
              />
            </div>
          ))}
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md"
            disabled={updating}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-md"
            disabled={updating}
          >
            {updating ? '수정 중...' : '수정'}
          </button>
        </div>
      </div>
    </div>
  );
}