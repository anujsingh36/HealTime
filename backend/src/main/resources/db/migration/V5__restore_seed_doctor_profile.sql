-- The seed doctor's `doctors` profile row (originally inserted by V2__seed.sql) was found
-- missing on some environments — most likely deleted at some point during manual testing/DB
-- surgery. Without it, GET /api/doctor/appointments and /api/doctor/queue 404 with
-- "Doctor profile not found" for this account. Re-create it if missing, matching V2's original
-- seed values, so the demo/seed doctor account is always fully usable after a fresh migrate.

insert into doctors (user_id, specialization_id, license_number, years_experience, bio, consultation_fee, clinic_name, location, verified)
select u.id, s.id, 'MED-001', 8, 'Board-certified cardiologist with focus on preventive care.', 120.00, 'HealTime Heart Clinic', 'Bangalore', true
from users u, specializations s
where u.email = 'doctor@healtime.io' and s.slug = 'cardiology'
  and not exists (select 1 from doctors d where d.user_id = u.id);
