/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // ✅ src 안의 파일을 인식해야 Tailwind가 적용된다
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}