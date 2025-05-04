// src/pages/_app.tsx
import '@/styles/globals.css';           // ① 반드시 최상단에 글로벌 스타일 임포트
import type { AppProps } from 'next/app';
import Footer from '@/components/common/Footer';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <main className="min-h-screen">   {/* Tailwind 유틸 그대로 사용 */}
        <Component {...pageProps} />    
      </main>
      <Footer />                        {/* 전역 푸터 */}
    </>
  );
}