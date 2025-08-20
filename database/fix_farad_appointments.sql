-- Update walk-in appointments with beard trim services to be associated with Farad
-- This will assign Farad's ID to null barber_id appointments with beard trim notes
UPDATE appointments
SET barber_id = '45bde54b-8dbc-4f65-8886-56176b03d4bb'
WHERE barber_id IS NULL 
  AND notes ILIKE '%beard trim%';

-- If you want to see which appointments were updated
SELECT * FROM appointments
WHERE barber_id = '45bde54b-8dbc-4f65-8886-56176b03d4bb';
