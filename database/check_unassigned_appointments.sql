-- Check for unassigned appointments
SELECT 
  id,
  date,
  time,
  status,
  barber_id,
  client_id,
  service_id,
  price,
  commission_amount,
  commission_rate,
  walk_in_client_name
FROM 
  appointments 
WHERE 
  barber_id IS NULL
  OR barber_id = '';

-- Check all appointments (for reference)
SELECT 
  count(*) as total_appointments
FROM 
  appointments;

-- Get barber info for Farad
SELECT 
  id,
  name,
  commission_rate,
  total_cuts,
  appointment_cuts,
  walk_in_cuts,
  total_commission
FROM 
  barbers 
WHERE 
  email = 'farad@amaimenscare.com'
  OR name ILIKE '%farad%';

-- Create a test appointment for Farad
INSERT INTO appointments (
  date, 
  time, 
  status, 
  barber_id,
  client_id,
  service_id,
  price,
  commission_amount,
  commission_rate,
  notes
) VALUES (
  CURRENT_DATE, -- Today's date
  '14:00', -- Time
  'completed', -- Status (completed to count in stats)
  '45bde54b-8dbc-4f65-8886-56176b03d4bb', -- Farad's ID
  (SELECT id FROM clients LIMIT 1), -- First client in the database
  (SELECT id FROM services LIMIT 1), -- First service in the database
  25.00, -- Price
  12.50, -- Commission amount (50% of price)
  50, -- Commission rate (%)
  'Test appointment for Farad'
);

-- Manually refresh stats for all barbers
SELECT update_barber_stats();

-- Check barber stats after update
SELECT 
  id,
  name,
  commission_rate,
  total_cuts,
  appointment_cuts,
  walk_in_cuts,
  total_commission
FROM 
  barbers 
WHERE 
  email = 'farad@amaimenscare.com'
  OR name ILIKE '%farad%';
