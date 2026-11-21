# MedQueue

Starter full-stack doctor booking platform built with React + Vite, Node.js, Express, and MongoDB.

## Requirements
- Node.js (LTS recommended)
- MongoDB Community Server running locally, OR a MongoDB Atlas connection string
- VS Code

## 1. Configure backend
Open `backend/.env` and set `MONGODB_URI`.
For local MongoDB:
`MONGODB_URI=mongodb://127.0.0.1:27017/medqueue`

For MongoDB Atlas, use your own connection string. Never commit `.env`.

## 2. Install and run backend
```bash
cd backend
npm install
npm run dev
```
Backend: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`
Doctors endpoint: `http://localhost:5000/api/doctors`

## 3. Install and run frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL Vite prints (usually `http://localhost:5173`).

The frontend uses Vite's development proxy to send `/api` requests to `http://localhost:5000`.

## Notes
- The app includes a MongoDB connection, starter schemas, health endpoint, and doctor listing endpoint.
- Login, role-based access, appointment creation, payments, chat, and prescriptions are scaffolding/future work, not production-ready features yet.
- Before handling real patient data, add authentication, authorization, input validation, rate limiting, audit logging, secure deployment, and privacy/legal review.
