'use client';

import { useState } from 'react';
import { Doctor, useDoctors } from '@/features/hooks/useDoctors';
import { uploadDoctorProfile } from '@/lib/api';
import { useHospitals }      from '@/features/hooks/useHospitals'


interface EditDoctorModalProps {
  doctor: Doctor;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditDoctorModal({
  doctor,
  onClose,
  onUpdated,
}: EditDoctorModalProps) {
  // ★ useDoctors 훅에서 updateDoctor 가져오기
  const { updateDoctor } = useDoctors();
  const { hospitals } = useHospitals();

  // hospital_id → name 맵 생성 (key: hospital_id)
  const hospitalMap = hospitals.reduce<Record<number, string>>((acc, h) => {
    acc[h.hospital_id] = h.name;
    return acc;
  }, {});

  const [formData, setFormData] = useState({
    contact: doctor.contact || '',
    email: doctor.email || '',
    department: doctor.department || '',
    password: doctor.password || '',
    availability: doctor.availability || {},
    profile_url: doctor.profile_url || '',
  });
  const [updating, setUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      availability: { ...prev.availability, [day]: value },
    }));
  };

  const handleSubmit = async () => {
    setUpdating(true);

    // PATCH 페이로드로 보낼 데이터
    const payload = {
      contact: formData.contact,
      email: formData.email,
      department: formData.department,
      password: formData.password,
      availability: formData.availability,
    };

    try {
      // ★ 훅의 updateDoctor 호출 (내부에서 API 패치 + 상태 갱신)
      await updateDoctor(doctor.license_number, payload);
      // 2) 파일이 선택돼 있으면 업로드
      if (selectedFile) {
        const { profile_url: newUrl } = await uploadDoctorProfile(
          doctor.license_number,
          selectedFile
        );
        setFormData(prev => ({ ...prev, profile_url: newUrl }));
      }

      alert('수정 완료');
      onUpdated(); // 필요하다면 상위 목록을 강제로 리패치
      onClose();
    } catch (err) {
      console.error('의사 수정 에러', err);
      alert('수정 실패');
    } finally {
      setUpdating(false);
    }
  };

   // 1) 파일 선택 시 로컬 미리보기로만 사용
 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    // 로컬 URL 생성 후 화면에 바로 반영
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, profile_url: previewUrl }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-2xl font-bold mb-6">직원 정보 수정</h2>

        {/* 프로필 사진 */}
        <div className="flex justify-center mb-6 relative">
          {/** 실제 표시되는 프로필 사진 (formData.profile_url 우선, 없으면 doctor.profile_url) **/}
 <img
   src={formData.profile_url ?? doctor.profile_url ?? '/default-profile.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
          {/* 투명한 파일 입력(input) */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}      // 파일 선택 핸들러 (아래에 구현)
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
          />
          {/* 카메라 아이콘 (버튼처럼) */}
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l3-3m0 0l3 3m-3-3v12a1 1 0 001 1h12a1 1 0 001-1V8m-4 4h.01M12 16h.01M16 12h.01M8 12h.01"
              />
            </svg>
          </div>
        </div>

        {/* 폼 입력 영역 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 읽기 전용 필드 */}
          <div className="flex flex-col">
            <label className="text-gray-700 mb-1">병원명</label>
            <input
              type="text"
              value={hospitalMap[doctor.hospital_id] ?? `ID: ${doctor.hospital_id}`}
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

          {/* 진료 가능 시간 */}
          {['월', '화', '수', '목', '금'].map(day => (
            <div key={day} className="flex flex-col">
              <label className="text-gray-700 mb-1">{day}</label>
              <input
                type="text"
                value={formData.availability?.[day] || ''}
                onChange={e => handleAvailabilityChange(day, e.target.value)}
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