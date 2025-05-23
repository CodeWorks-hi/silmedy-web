
# 🩺 Silmedy Web App (의사 및 관리자용 통합 웹)

### 말하지 않아도, 아픔은 보입니다 — 비대면 진료 시스템 웹 클라이언트

---

## 📌 앱 개요
Silmedy는 청각장애인을 포함한 모든 사용자를 위한 비대면 진료 플랫폼입니다. 본 웹 애플리케이션은 관리자 및 의사 전용 시스템으로, 환자 관리, 진료 요청 수락, 영상 통화 기반 진료, 진단 및 처방 등록 등 진료 전반의 백오피스 기능을 제공합니다.

---

## 📀 사용 기술 및 라이브러리

| 분야           | 라이브러리 및 기술 |
|----------------|---------------------|
| 프론트엔드 프레임워크 | React (Next.js)      |
| 상태 관리      | React Hooks         |
| 인증/인가      | Firebase Auth, Cookie |
| 스타일링       | Tailwind CSS        |
| 실시간 통신    | WebRTC + Firebase RTDB |
| 데이터 시각화  | Chart.js 등 (해당 기능 포함 시) |

---

## 🔧 주요 기능

### 🧑‍⚕️ 진료 요청 수신 및 수락  
- 의사는 자신의 보건소로 접수된 진료 요청을 확인하고, 해당 요청을 선택해 영상 진료를 시작할 수 있습니다.

### 📹 영상 진료 및 실시간 자막 송출  
- WebRTC 기반으로 환자와 영상 진료를 수행하며, 음성 인식을 통해 자막을 환자에게 실시간 전송합니다.

### 📋 진단 기록 및 처방 등록  
- 의사는 진단 내용을 작성하고, 질병 코드 및 의약품 정보를 입력해 처방을 생성할 수 있으며, 처방전은 PDF 이미지로 자동 저장됩니다.

---

## 📁 프로젝트 구조

```
silmedy-web/
├── src/
│   ├── components/     # 컴포넌트 모음 (공통, 관리자, 의사 등)
│   ├── features/       # 커스텀 훅 및 기능 단위 로직
│   ├── lib/            # API, Firebase, S3 관련 유틸
│   ├── pages/          # Next.js 페이지 라우팅 구조
│   ├── types/          # 타입스크립트 인터페이스 정의
│   └── styles/         # 글로벌 스타일 정의
├── public/             # 정적 파일 (favicon 등)
├── .env.local          # 환경변수 (API URL, Firebase Key 등)
├── package.json
├── README.md
└── ...
```

---

## 🚀 실행 방법

### 1. 환경 변수 설정 (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_S3_BUCKET=...
NEXT_PUBLIC_S3_REGION=...
NEXT_PUBLIC_S3_ACCESS_KEY=...
NEXT_PUBLIC_S3_SECRET_KEY=...
```

### 2. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

### 3. Swagger 문서 확인:
http://3.34.104.170/docs

---

## 👥 역할 기반 접근

| 역할   | 기능                              |
|--------|-----------------------------------|
| 관리자 | 의사 등록/수정/삭제, CSV 업로드     |
| 의사   | 진료 대기 환자 관리, 진단 및 처방     |
| 환자   | 진료 요청, 영상 진료 수신, 진단서 열람 |

---

## 📬 문의

📧 Email: codekookiz@gmail.com
