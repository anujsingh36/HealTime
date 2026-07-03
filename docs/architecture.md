# Architecture

```
┌─────────────────────┐        HTTPS / JSON         ┌──────────────────────────────┐
│   React SPA (Vite)  │ ─────────────────────────▶  │  Spring Boot REST API        │
│  Tailwind · RR · Zus│  Bearer <JWT>               │  Controller → Service → Repo │
└─────────────────────┘ ◀─────────────────────────  │  Spring Security · JWT       │
                                                    │  JPA / Hibernate             │
                                                    └──────────────┬───────────────┘
                                                                   │ JDBC
                                                            ┌──────▼─────┐
                                                            │ PostgreSQL │
                                                            └────────────┘
```

## Backend packages
```
io.healtime
├── config        // CORS, OpenAPI, JPA auditing
├── security      // JwtService, JwtAuthFilter, SecurityConfig, UserDetails
├── exception     // ApiException, GlobalExceptionHandler
├── dto           // request/response records
├── entity        // JPA entities
├── repository    // Spring Data JPA repositories
├── service       // business logic (transactional)
└── controller    // REST endpoints
```

## Frontend
```
src/
├── api/          // axios client + endpoint modules
├── store/        // zustand auth store
├── components/   // UI primitives, layout, role-aware nav
├── pages/        // route components (patient/doctor/admin)
├── hooks/        // useAuth, useApi
├── lib/          // utils, formatters
└── main.jsx
```

## Auth flow
1. `POST /api/auth/login` returns `{ token, user }`.
2. Frontend persists token in `localStorage` + zustand store.
3. Axios interceptor attaches `Authorization: Bearer <token>`.
4. Backend `JwtAuthFilter` validates and sets `SecurityContext`.
5. `@PreAuthorize` and `SecurityConfig` enforce role-based access.
