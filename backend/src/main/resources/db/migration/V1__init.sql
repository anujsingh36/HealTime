create extension if not exists "pgcrypto";

create table users (
    id uuid primary key default gen_random_uuid(),
    email varchar(255) not null unique,
    password_hash varchar(255) not null,
    full_name varchar(255) not null,
    phone varchar(40),
    date_of_birth date,
    gender varchar(20),
    address varchar(500),
    avatar_url varchar(500),
    enabled boolean not null default true,
    created_at timestamp,
    updated_at timestamp
);

create table user_roles (
    user_id uuid not null references users(id) on delete cascade,
    role varchar(20) not null,
    primary key (user_id, role)
);

create table specializations (
    id uuid primary key default gen_random_uuid(),
    name varchar(120) not null unique,
    slug varchar(120) not null unique,
    description varchar(500),
    icon varchar(120),
    created_at timestamp, updated_at timestamp
);

create table doctors (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references users(id) on delete cascade,
    specialization_id uuid not null references specializations(id),
    license_number varchar(100) not null unique,
    years_experience integer,
    bio text,
    consultation_fee numeric(10,2),
    clinic_name varchar(200),
    location varchar(200),
    rating numeric(3,2) default 0,
    verified boolean not null default false,
    created_at timestamp, updated_at timestamp
);

create table doctor_availability (
    id uuid primary key default gen_random_uuid(),
    doctor_id uuid not null references doctors(id) on delete cascade,
    day_of_week varchar(20) not null,
    start_time time not null,
    end_time time not null,
    slot_duration_min integer not null,
    created_at timestamp, updated_at timestamp,
    unique (doctor_id, day_of_week)
);

create table appointments (
    id uuid primary key default gen_random_uuid(),
    patient_id uuid not null references users(id),
    doctor_id uuid not null references doctors(id),
    scheduled_at timestamp not null,
    status varchar(20) not null default 'PENDING',
    reason text,
    notes text,
    queue_position integer,
    estimated_wait_min integer,
    created_at timestamp, updated_at timestamp
);
create index idx_appt_doctor_date on appointments(doctor_id, scheduled_at);
create index idx_appt_patient on appointments(patient_id);

create table medical_records (
    id uuid primary key default gen_random_uuid(),
    patient_id uuid not null references users(id) on delete cascade,
    uploaded_by uuid references users(id),
    title varchar(200) not null,
    record_type varchar(80),
    file_url varchar(500) not null,
    file_size bigint,
    notes text,
    created_at timestamp, updated_at timestamp
);

create table prescriptions (
    id uuid primary key default gen_random_uuid(),
    appointment_id uuid not null references appointments(id) on delete cascade,
    doctor_id uuid not null references doctors(id),
    patient_id uuid not null references users(id),
    diagnosis text,
    instructions text,
    file_url varchar(500),
    medications jsonb,
    created_at timestamp, updated_at timestamp
);

create table notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    type varchar(30) not null,
    title varchar(200) not null,
    body text,
    link varchar(500),
    read boolean not null default false,
    created_at timestamp, updated_at timestamp
);
create index idx_notif_user on notifications(user_id, read);
