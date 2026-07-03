# HealTime — Smart Healthcare Appointment & Queue Management System

A production-grade reference implementation of a full-stack healthcare platform.

- **Backend:** Spring Boot 3.3 · Spring Security · JWT · Spring Data JPA · Lombok · PostgreSQL
- **Frontend:** React 18 · Vite · Tailwind CSS · React Router · Axios · Zustand · Framer Motion
- **Database:** PostgreSQL 15+

## Roles
- **Patient** — register, search doctors, book/cancel appointments, view live queue, upload records, get notifications
- **Doctor** — manage profile/availability, view appointments, manage queue, upload prescriptions, view patient history
- **Admin** — manage doctors/patients/appointments, dashboard analytics, reports

## Repository layout
```
healtime/
├── backend/        Spring Boot application (Maven)
├── frontend/       React + Vite SPA
├── docs/           ERD, API examples, architecture
└── README.md
```

## Quickstart

### 1. Database
```bash
createdb healtime
psql healtime < docs/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env       # then edit DB creds + JWT_SECRET
./mvnw spring-boot:run
# API on http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:8080/api
npm install
npm run dev
# UI on http://localhost:5173
```

## Default seed accounts
| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Admin   | admin@healtime.io    | Admin@123   |
| Doctor  | doctor@healtime.io   | Doctor@123  |
| Patient | patient@healtime.io  | Patient@123 |

## See also
- `docs/ERD.md` — entity-relationship diagram (Mermaid)
- `docs/API.md` — REST API reference with request/response examples
- `docs/architecture.md` — module + deployment overview
