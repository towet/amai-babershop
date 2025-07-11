-- ========== COMPREHENSIVE DATA INTEGRITY SOLUTION ==========
-- This script implements proper data integrity across the entire system
-- to ensure accurate statistics, commissions, and dashboard displays

-- ===== 1. DATA ANALYSIS FOR BARBER APPOINTMENTS =====
-- This query identifies appointments with NULL barber_id for manager review
-- NOTE: We're NOT automatically assigning barbers; this is strictly a manager responsibility

-- Identifies existing appointments with NULL barber_id that mention beard trims (for reference only)
SELECT id, date, time, notes, service_id, status, type
FROM appointments
WHERE barber_id IS NULL 
  AND (notes ILIKE '%beard trim%' OR notes ILIKE '%beard%');

-- Identifies remaining NULL barber_id appointments grouped by service for manager assignment
SELECT s.name as service_name, COUNT(*) as appointment_count
FROM appointments a
JOIN services s ON a.service_id = s.id
WHERE a.barber_id IS NULL
GROUP BY s.name
ORDER BY appointment_count DESC;

-- Count of appointments without barber_id (for reporting to manager)
SELECT COUNT(*) AS appointments_needing_assignment
FROM appointments
WHERE barber_id IS NULL;

-- ===== 2. ENSURE PRICE AND COMMISSION VALUES ARE CORRECT =====
-- Update appointments to ensure price matches service price
UPDATE appointments a
SET price = s.price
FROM services s
WHERE a.service_id = s.id
  AND (a.price IS NULL OR a.price = 0);

-- Update commission amounts based on barber commission rate
UPDATE appointments a
SET commission_amount = ROUND((a.price * b.commission_rate / 100)::numeric, 2)
FROM barbers b
WHERE a.barber_id = b.id
  AND (a.commission_amount IS NULL OR a.commission_amount = 0);

-- ===== 3. UPDATE BARBER STATISTICS =====
-- Create or replace function to recalculate barber statistics
CREATE OR REPLACE FUNCTION update_barber_stats()
RETURNS VOID AS $$
BEGIN
  -- Update total_cuts, appointment_cuts, walk_in_cuts
  UPDATE barbers b
  SET 
    total_cuts = COALESCE(stats.total, 0),
    appointment_cuts = COALESCE(stats.appointment_count, 0),
    walk_in_cuts = COALESCE(stats.walk_in_count, 0),
    total_commission = COALESCE(stats.total_commission, 0)
  FROM (
    SELECT 
      barber_id,
      COUNT(*) FILTER (WHERE status = 'completed') AS total,
      COUNT(*) FILTER (WHERE status = 'completed' AND type = 'appointment') AS appointment_count,
      COUNT(*) FILTER (WHERE status = 'completed' AND type = 'walk-in') AS walk_in_count,
      COALESCE(SUM(commission_amount) FILTER (WHERE status = 'completed'), 0) AS total_commission
    FROM 
      appointments
    GROUP BY 
      barber_id
  ) AS stats
  WHERE b.id = stats.barber_id;
  
  -- Also update barbers who have no appointments at all (they would be missed by the join)
  UPDATE barbers
  SET 
    total_cuts = 0,
    appointment_cuts = 0,
    walk_in_cuts = 0,
    total_commission = 0
  WHERE id NOT IN (SELECT DISTINCT barber_id FROM appointments WHERE barber_id IS NOT NULL);
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update stats now
SELECT update_barber_stats();

-- ===== 4. CREATE DATABASE TRIGGERS FOR FUTURE DATA INTEGRITY =====
-- Trigger to ensure price and commission values are correctly set
CREATE OR REPLACE FUNCTION ensure_appointment_integrity()
RETURNS TRIGGER AS $$
BEGIN
  -- NOTE: We do NOT auto-assign barber_id; this remains a manager responsibility
  -- The barber_id must be explicitly set by the manager when creating or updating appointments
  
  -- Ensure price is set from service if service_id is provided
  IF (NEW.price IS NULL OR NEW.price = 0) AND NEW.service_id IS NOT NULL THEN
    SELECT price INTO NEW.price FROM services WHERE id = NEW.service_id;
    -- If still NULL after trying to get from service, set a default
    IF NEW.price IS NULL THEN
      NEW.price := 0;
    END IF;
  END IF;
  
  -- Calculate commission based on barber rate if barber_id is provided
  IF (NEW.commission_amount IS NULL OR NEW.commission_amount = 0) AND NEW.barber_id IS NOT NULL AND NEW.price IS NOT NULL THEN
    -- Get commission rate from barber
    DECLARE
      commission_rate NUMERIC;
    BEGIN
      SELECT b.commission_rate INTO commission_rate
      FROM barbers b WHERE b.id = NEW.barber_id;
      
      -- Only calculate if we got a valid commission rate
      IF commission_rate IS NOT NULL THEN
        NEW.commission_amount := ROUND((NEW.price * commission_rate / 100)::numeric, 2);
      ELSE
        -- Default to zero if no rate found
        NEW.commission_amount := 0;
      END IF;
    END;
  END IF;
  
  -- Ensure commission_amount is never NULL
  IF NEW.commission_amount IS NULL THEN
    NEW.commission_amount := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment integrity
CREATE OR REPLACE TRIGGER trg_appointment_integrity
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION ensure_appointment_integrity();

-- Trigger to update barber stats when appointment status changes
CREATE OR REPLACE FUNCTION update_barber_stats_on_appointment_change()
RETURNS TRIGGER AS $$
DECLARE
  affected_barber_id UUID;
BEGIN
  -- Determine which barber is affected by this change
  IF TG_OP = 'INSERT' THEN
    affected_barber_id := NEW.barber_id;
  ELSIF TG_OP = 'DELETE' THEN
    affected_barber_id := OLD.barber_id;
  ELSE -- UPDATE
    affected_barber_id := NEW.barber_id;
  END IF;

  -- Skip if no barber ID is set
  IF affected_barber_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Only run for status changes or completion status
  IF (TG_OP = 'UPDATE' AND (OLD.status != NEW.status OR OLD.barber_id != NEW.barber_id)) OR 
     (TG_OP = 'INSERT' AND NEW.status = 'completed') OR
     (TG_OP = 'DELETE' AND OLD.status = 'completed') THEN
    
    -- Update stats for the affected barber
    UPDATE barbers b
    SET 
      total_cuts = COALESCE((
        SELECT COUNT(*) 
        FROM appointments 
        WHERE barber_id = affected_barber_id AND status = 'completed'
      ), 0),
      appointment_cuts = COALESCE((
        SELECT COUNT(*) 
        FROM appointments 
        WHERE barber_id = affected_barber_id AND status = 'completed' AND type = 'appointment'
      ), 0),
      walk_in_cuts = COALESCE((
        SELECT COUNT(*) 
        FROM appointments 
        WHERE barber_id = affected_barber_id AND status = 'completed' AND type = 'walk-in'
      ), 0),
      total_commission = COALESCE((
        SELECT SUM(commission_amount) 
        FROM appointments 
        WHERE barber_id = affected_barber_id AND status = 'completed'
      ), 0)
    WHERE b.id = affected_barber_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment status changes
CREATE OR REPLACE TRIGGER trg_update_barber_stats
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_barber_stats_on_appointment_change();

-- ===== 5. ADD DATABASE CONSTRAINTS =====
-- Uncomment these after ensuring all data is clean:
-- ALTER TABLE appointments ALTER COLUMN barber_id SET NOT NULL;
-- ALTER TABLE appointments ALTER COLUMN service_id SET NOT NULL;
-- ALTER TABLE appointments ALTER COLUMN price SET NOT NULL;
-- ALTER TABLE appointments ALTER COLUMN date SET NOT NULL;
-- ALTER TABLE appointments ALTER COLUMN time SET NOT NULL;

-- ===== 6. VERIFY RESULTS =====
-- Check for any remaining NULL barber_id
SELECT COUNT(*) AS null_barber_ids FROM appointments WHERE barber_id IS NULL;

-- Check Farad's appointments after fixes
SELECT a.*, b.name as barber_name, s.name as service_name
FROM appointments a
JOIN barbers b ON a.barber_id = b.id
LEFT JOIN services s ON a.service_id = s.id
WHERE b.id = '45bde54b-8dbc-4f65-8886-56176b03d4bb'
ORDER BY a.date DESC, a.time;

-- Check barber statistics
SELECT name, total_cuts, appointment_cuts, walk_in_cuts, total_commission, commission_rate
FROM barbers
ORDER BY total_cuts DESC;
