// src/components/common/Footer.tsx
'use client';

export default function Footer() {
  return (
    <footer className="bg-white shadow-inner mt-8">
      <div className="container mx-auto text-center py-4 text-sm text-gray-500">
        {/* 저작권 문구 */}
        © {new Date().getFullYear()} Silmedy. All rights reserved.
      </div>
    </footer>
  );
}