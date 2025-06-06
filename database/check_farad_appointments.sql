-- Check for any appointments for Farad
SELECT a.*, b.name as barber_name, b.email as barber_email
FROM appointments a
JOIN barbers b ON a.barber_id = b.id
WHERE b.id = '45bde54b-8dbc-4f65-8886-56176b03d4bb'
   OR b.email = 'farad@amaimenscare.com' 
   OR b.name ILIKE '%farad%';

-- Check all appointments in the system (to see if there are any)
SELECT COUNT(*) as total_appointments FROM appointments;

-- Check if there are appointments with different barber ID formats
-- Sometimes UUID format issues can cause mismatches
SELECT DISTINCT barber_id FROM appointments;

-- Check for appointments that might be missing barber_id but have client info
SELECT * FROM appointments 
WHERE barber_id IS NULL;

-- Check if there are any walk-in appointments
SELECT * FROM appointments 
WHERE type = 'walk-in' OR walk_in_client_name IS NOT NULL;
