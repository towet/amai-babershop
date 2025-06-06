-- Fix Triggers and Data Issues
-- This script ensures all triggers are properly connected and fixes data issues

-- 1. First, drop and recreate all triggers to ensure they're properly connected
DROP TRIGGER IF EXISTS ensure_appointment_integrity_trigger ON appointments;
DROP TRIGGER IF EXISTS update_barber_stats_trigger ON appointments;

-- 2. Create the appointment integrity trigger
CREATE TRIGGER ensure_appointment_integrity_trigger
BEFORE INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION ensure_appointment_integrity();

-- 3. Create the barber stats update trigger
CREATE TRIGGER update_barber_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_barber_stats_on_appointment_change();

-- 4. Fix NULL commission_amount values in existing appointments
UPDATE appointments a
SET commission_amount = ROUND((a.price * b.commission_rate / 100)::numeric, 2)
FROM barbers b
WHERE a.barber_id = b.id
AND (a.commission_amount IS NULL OR a.commission_amount = 0)
AND a.price IS NOT NULL AND a.price > 0;

-- 5. Fix "Unknown Client" issues by updating walk_in_client_name for NULL client_id
UPDATE appointments
SET walk_in_client_name = 'Walk-in Client'
WHERE client_id IS NULL 
AND walk_in_client_name IS NULL;

-- 6. Ensure any appointments without barber_id have appropriate status
-- (Manager can review and assign these later)
UPDATE appointments
SET status = 'unassigned'
WHERE barber_id IS NULL;

-- 7. Ensure price is never null to prevent NaN calculations
UPDATE appointments
SET price = 0
WHERE price IS NULL;

-- 8. Fix any NULL commission rates for barbers 
UPDATE barbers
SET commission_rate = 25  -- Default commission rate of 25%
WHERE commission_rate IS NULL;

-- 9. Manually force a stats update for all barbers
SELECT update_barber_stats();

-- 10. Fix any inconsistent client links
-- First make sure we have an Unknown Client record
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM clients WHERE name = 'Unknown Client') THEN
        INSERT INTO clients (name, email, phone)
        VALUES ('Unknown Client', 'unknown@example.com', '00000000');
    END IF;
END $$;

-- 11. Link appointments without clients to the Unknown Client
UPDATE appointments a
SET client_id = (SELECT id FROM clients WHERE name = 'Unknown Client')
WHERE a.client_id IS NULL
AND a.type = 'appointment';  -- Only do this for scheduled appointments, not walk-ins

-- 12. Verify all barber stats updated correctly by showing final statistics
SELECT 
    b.id, 
    b.name,
    b.total_cuts,
    b.appointment_cuts,
    b.walk_in_cuts,
    b.total_commission,
    b.commission_rate
FROM 
    barbers b
ORDER BY 
    b.name;

-- 13. Verify all appointments have correct commission_amount values
SELECT 
    a.id,
    a.barber_id,
    b.name as barber_name,
    a.price,
    a.commission_amount,
    ROUND((a.price * b.commission_rate / 100)::numeric, 2) as expected_commission,
    a.status,
    a.type
FROM 
    appointments a
JOIN 
    barbers b ON a.barber_id = b.id
ORDER BY 
    a.created_at DESC
LIMIT 20;
