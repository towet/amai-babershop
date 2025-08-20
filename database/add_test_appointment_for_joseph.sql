-- SQL to add a test appointment for Joseph
-- Joseph's barber ID: aabc6bd6-cbc2-42b3-8f14-56b86b6a0957

-- First, let's fetch a valid service ID
WITH service_data AS (
  SELECT id FROM services LIMIT 1
),
-- And a valid client ID
client_data AS (
  SELECT id FROM clients LIMIT 1
),
-- Current date in ISO format
current_date_value AS (
  SELECT CURRENT_DATE::text AS date_value
)

-- Now insert the test appointment
INSERT INTO appointments (
  id,
  barber_id,
  client_id,
  service_id,
  date,
  time,
  duration,
  status,
  type,
  notes,
  price,
  commission_amount,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(), -- Generate a UUID for the appointment ID
  'aabc6bd6-cbc2-42b3-8f14-56b86b6a0957', -- Joseph's barber ID
  client_data.id, -- Client ID from subquery
  service_data.id, -- Service ID from subquery
  current_date_value.date_value, -- Today's date
  '14:00', -- 2:00 PM
  45, -- 45 minute appointment
  'scheduled', -- Status
  'appointment', -- Type
  'Test appointment created via SQL for testing purposes', -- Notes
  60.00, -- Price
  15.00, -- Commission
  NOW(), -- Created at current time
  NOW() -- Updated at current time
FROM service_data, client_data, current_date_value
RETURNING *;
