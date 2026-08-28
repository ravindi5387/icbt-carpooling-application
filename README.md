# ICBT Carpooling – Integrated Full System

This package combines the React/Vite frontend with a PostgreSQL REST API backend.

## Stack
- Frontend: React 18 + TypeScript 5.7 + Vite 6
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- Authentication: JWT + bcrypt
- REST API base URL: `http://localhost:5000/api`

## 1. Start PostgreSQL
Create a database named `icbt_carpooling`.

Default example connection:
`postgresql://postgres:postgres@localhost:5432/icbt_carpooling`

## 2. Backend
```bash
cd backend
copy .env.example .env
# edit DATABASE_URL and JWT_SECRET
npm install
npm run dev
```
The backend creates its required tables automatically on first startup.

Optional demo data:
```bash
npm run db:seed
```
Demo student password: `Student@123`
Admin username: `icbt.admin`
Admin password: `Carpool@Admin2026`

## 3. Frontend
```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```
The frontend `.env.example` already uses `VITE_DEMO_MODE=false` and points to the REST API.

## Important
Do not commit `.env` files or real database/JWT credentials to GitHub.
