-- V2__seed.sql inserted all three demo accounts with the SAME bcrypt hash, which does not
-- correspond to the passwords documented in the README (verified earlier via
-- bcrypt.compareSync -> false for all three). Since V2 has already run against existing
-- databases, we can't edit it in place (Flyway would reject the checksum change) — so this
-- migration corrects the three seed accounts' password_hash going forward, and will also
-- apply automatically on any fresh database setup (a new teammate cloning the repo, or a
-- recreated local DB), preventing this bug from silently reappearing.

update users set password_hash = '$2b$10$4RUh58GBEVEomgNdbZbB2.u9UtHOD51Qv3Rxme6LA7w2Ucdagn5lC'
where email = 'admin@healtime.io';

update users set password_hash = '$2b$10$5a6gX982IgSUhaxT3qfm9.YQrWNAR9X6pn046jtrUIXFnZLDFlC2S'
where email = 'doctor@healtime.io';

update users set password_hash = '$2b$10$CK8/Mg9Ua9G8Xn4vR8nU3OgKv2jdBGSSfE2RJ/6/ogAFr8s.vwfj6'
where email = 'patient@healtime.io';
