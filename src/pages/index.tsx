// pages/index.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/auth/login')  // 🔁 로그인 페이지로 리다이렉트
  }, [])

  return null
}