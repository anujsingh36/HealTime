# HealTime REST API

Base URL: `http://localhost:8080`
All authenticated endpoints require: `Authorization: Bearer <JWT>`

## Auth

### POST /api/auth/register
```json
// request
{ "email":"jane@x.com","password":"Passw0rd!","fullName":"Jane Doe","phone":"+1...","role":"PATIENT" }
// 200
{ "token":"eyJ...","user":{"id":"...","email":"jane@x.com","fullName":"Jane Doe","roles":["PATIENT"],"avatarUrl":null} }
```

### POST /api/auth/login
```json
{ "email":"jane@x.com","password":"Passw0rd!" }
```

## Me
`GET /api/me` → `{ id, email, fullName, roles[], avatarUrl }`

## Doctors (public search)
`GET /api/doctors/search?spec=cardiology&q=heart&page=0&size=12` → paginated `DoctorView`
`GET /api/doctors/{id}` → `DoctorView`
`GET /api/doctors/{id}/availability` → `[AvailabilitySlot]`
`GET /api/specializations` → `[SpecializationView]`

### PUT /api/doctors/me  (ROLE_DOCTOR)
```json
{ "bio":"...","consultationFee":120.00,"clinicName":"...","location":"Bangalore" }
```

### PUT /api/doctors/me/availability  (ROLE_DOCTOR)
```json
{ "slots":[{"dayOfWeek":"MONDAY","startTime":"09:00","endTime":"13:00","slotDurationMin":15}] }
```

## Appointments

### POST /api/patient/appointments  (ROLE_PATIENT)
```json
{ "doctorId":"uuid","scheduledAt":"2026-06-25T10:00:00Z","reason":"Chest discomfort" }
```
Response:
```json
{ "id":"...","doctorId":"...","doctorName":"Dr. Maya Rao","specialization":"Cardiology",
  "patientId":"...","patientName":"Jane Doe","scheduledAt":"2026-06-25T10:00:00Z",
  "status":"CONFIRMED","queuePosition":3,"estimatedWaitMin":30,"reason":"Chest discomfort","notes":null }
```

- `GET    /api/patient/appointments`
- `DELETE /api/patient/appointments/{id}`
- `GET    /api/patient/appointments/{id}/queue` → `{ appointmentId, position, estimatedWaitMin, status }`
- `GET    /api/doctor/appointments` (ROLE_DOCTOR)
- `GET    /api/doctor/queue` (ROLE_DOCTOR)
- `PATCH  /api/doctor/appointments/{id}/status` body `{ "status":"IN_PROGRESS","notes":"..." }`

## Medical records (ROLE_PATIENT)
- `GET  /api/patient/records`
- `POST /api/patient/records` `multipart/form-data` fields: `file`, `title`, `recordType?`, `notes?`
- `GET  /api/doctor/patients/{patientId}/records` (ROLE_DOCTOR/ADMIN)

## Prescriptions
- `POST /api/doctor/prescriptions` (ROLE_DOCTOR)
```json
{ "appointmentId":"uuid","diagnosis":"Mild hypertension","instructions":"...",
  "medications":{"items":[{"name":"Amlodipine","dose":"5mg","freq":"OD","days":30}]},
  "fileUrl":null }
```
- `GET  /api/patient/prescriptions`
- `GET  /api/appointments/{id}/prescriptions`

## Notifications
- `GET  /api/notifications`
- `GET  /api/notifications/unread-count` → `{ "count": 3 }`
- `POST /api/notifications/{id}/read`

## Admin (ROLE_ADMIN)
- `GET  /api/admin/stats`
- `GET  /api/admin/patients`
- `GET  /api/admin/doctors`
- `POST /api/admin/doctors/{id}/verify`
- `POST /api/admin/users/{id}/disable`

## Errors
```json
{ "timestamp":"2026-06-22T10:00:00Z", "status":400, "message":"Validation failed",
  "errors":{ "email":"must be a well-formed email address" } }
```
