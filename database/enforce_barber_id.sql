-- 1. First, update existing appointments with NULL barber_id
-- For beard trim services, assign to Farad
UPDATE appointments
SET barber_id = '45bde54b-8dbc-4f65-8886-56176b03d4bb'
WHERE barber_id IS NULL 
  AND (notes ILIKE '%beard trim%' OR notes ILIKE '%beard%');

-- For other services without barber_id, assign based on service specialties
-- This is an example - you'll need to map services to barbers based on your business logic
UPDATE appointments a
SET barber_id = b.id
FROM barbers b
WHERE a.barber_id IS NULL
  AND b.specialty ILIKE '%' || a.notes || '%';

-- 2. Add a database constraint to prevent future NULL barber_id
-- First, make sure all existing records have a barber_id
-- If any still exist without a barber_id, assign them to a default barber
-- This is a safety check before adding the constraint
UPDATE appointments
SET barber_id = (SELECT id FROM barbers WHERE name = 'alex' LIMIT 1)
WHERE barber_id IS NULL;

-- 3. Now add the NOT NULL constraint (Only run this after all NULLs are fixed)
-- ALTER TABLE appointments ALTER COLUMN barber_id SET NOT NULL;

-- 4. Create a database trigger to enforce barber_id assignment for new appointments
CREATE OR REPLACE FUNCTION ensure_barber_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If barber_id is NULL, try to determine from notes or service
  IF NEW.barber_id IS NULL THEN
    -- Check if it's a beard trim for Farad
    IF NEW.notes ILIKE '%beard trim%' OR NEW.notes ILIKE '%beard%' THEN
      NEW.barber_id := '45bde54b-8dbc-4f65-8886-56176b03d4bb'; -- Farad's ID
    ELSE
      -- Default to a barber based on service or to first barber
      NEW.barber_id := (
        SELECT id FROM barbers 
        WHERE specialty ILIKE '%' || COALESCE(NEW.notes, '') || '%' 
        LIMIT 1
      );
      
      -- If still NULL, assign to first active barber
      IF NEW.barber_id IS NULL THEN
        NEW.barber_id := (SELECT id FROM barbers WHERE active = true LIMIT 1);
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for INSERT and UPDATE operations
CREATE OR REPLACE TRIGGER trg_ensure_barber_id
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION ensure_barber_id();

-- 5. Verify fixed data
SELECT COUNT(*) FROM appointments WHERE barber_id IS NULL;
