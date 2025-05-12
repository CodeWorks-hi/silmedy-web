// src/pages/_app.tsx
import '@/styles/globals.css';           // ① 글로벌 스타일 임포트
import type { AppProps } from 'next/app';
import Head from 'next/head';            // ② Head 추가
import Footer from '@/components/common/Footer';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* ── 모든 페이지에 적용될 기본 헤드 설정 ── */}
      <Head>
        {/* 탭(브라우저 제목) */}
        <title>Silmedy "말하지 않아도, 아픔은 보입니다"</title>
        {/* 파비콘 */}
        <link rel="icon" href="/favicon.ico" />
        {/* 메타 태그 예시 */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen">
        <Component {...pageProps} />
      </main>
      <Footer />
    </>
  );
}