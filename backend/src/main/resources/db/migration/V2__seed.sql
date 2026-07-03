-- Specializations
insert into specializations (name, slug, description, icon) values
  ('Cardiology','cardiology','Heart and cardiovascular system','heart'),
  ('Dermatology','dermatology','Skin, hair and nails','sparkles'),
  ('Pediatrics','pediatrics','Children health','baby'),
  ('Neurology','neurology','Brain and nervous system','brain'),
  ('Orthopedics','orthopedics','Bones and joints','bone'),
  ('General Medicine','general-medicine','Primary care','stethoscope');

-- Demo users (bcrypt hashes for Admin@123 / Doctor@123 / Patient@123)
insert into users (email, password_hash, full_name, phone) values
  ('admin@healtime.io',   '$2a$10$2qj7M0qS6N9j8aB4Y1mZ5e8sLMr6zRcL0fSc7HrZb5fO0RJYJxXjC', 'Asha Admin',   '+1-555-0100'),
  ('doctor@healtime.io',  '$2a$10$2qj7M0qS6N9j8aB4Y1mZ5e8sLMr6zRcL0fSc7HrZb5fO0RJYJxXjC', 'Dr. Maya Rao', '+1-555-0101'),
  ('patient@healtime.io', '$2a$10$2qj7M0qS6N9j8aB4Y1mZ5e8sLMr6zRcL0fSc7HrZb5fO0RJYJxXjC', 'Ravi Patel',   '+1-555-0102');

insert into user_roles (user_id, role)
  select id, 'ADMIN' from users where email='admin@healtime.io'
  union all select id, 'DOCTOR' from users where email='doctor@healtime.io'
  union all select id, 'PATIENT' from users where email='patient@healtime.io';

insert into doctors (user_id, specialization_id, license_number, years_experience, bio, consultation_fee, clinic_name, location, verified)
select u.id, s.id, 'MED-001', 8, 'Board-certified cardiologist with focus on preventive care.', 120.00, 'HealTime Heart Clinic', 'Bangalore', true
from users u, specializations s
where u.email='doctor@healtime.io' and s.slug='cardiology';

-- NOTE: replace the password hashes above with real bcrypt hashes for your environment.
