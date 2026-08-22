-- Doctor: manual fallback average consultation time + clinic coordinates (for travel-time calc)
alter table doctors add column avg_consultation_min integer;
alter table doctors add column clinic_lat double precision;
alter table doctors add column clinic_lng double precision;

-- Appointments: actual start/complete timestamps (to compute real average duration),
-- patient's last known live location, and a flag to avoid duplicate "time to leave" notifications
alter table appointments add column started_at timestamp;
alter table appointments add column completed_at timestamp;
alter table appointments add column patient_lat double precision;
alter table appointments add column patient_lng double precision;
alter table appointments add column patient_location_updated_at timestamp;
alter table appointments add column leave_notified boolean not null default false;