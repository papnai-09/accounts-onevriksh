# Onevriksh Central Accounts

Enterprise Central Accounts management application built with Next.js 16 (Turbopack), Express + TypeScript REST API, Firebase Phone Authentication, and MongoDB Atlas Cloud Database.

---

## 📁 Repository Structure

```
onevriksh-accounts/
├── frontend/                 ← Next.js 16 Client Application (Port 3000)
│   ├── app/                  ← Auth & Dashboard Pages
│   ├── actions/              ← Server Actions
│   ├── components/           ← Reusable UI & Layout Components
│   ├── lib/                  ← Firebase SDK & Auth Utilities
│   ├── public/               ← Static Assets & Logos
│   └── package.json
│
└── backend/                  ← Express REST API Server (Port 5000)
    ├── src/
    │   ├── config/           ← MongoDB Atlas & Firebase Config
    │   ├── controllers/      ← API Request Handlers
    │   ├── middleware/       ← JWT Auth & Rate Limiters
    │   ├── models/           ← Mongoose Schemas (User, Session, Audit)
    │   ├── routes/           ← Express Routers
    │   ├── services/         ← Business Logic Layer
    │   └── server.ts         ← Server Entrypoint
    └── package.json
```

---

## 🚀 How to Run Locally

### 1. Start Express Backend API (Port 5000)
```bash
cd backend
npm run dev
```

### 2. Start Next.js Frontend (Port 3000)
```bash
cd frontend
npm run dev
```

---

## 🗄️ Database & Services

*   **MongoDB Atlas Cloud**: Connection string configured in `backend/.env` & `frontend/.env`.
*   **Firebase Authentication**: Web App ID `1:735599274991:web:72898eca20c267a2cae41a` configured in `frontend/lib/firebase.ts`.
