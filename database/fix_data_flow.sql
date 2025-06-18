-- ======== FIX DATA FLOW & DATABASE STRUCTURE ISSUES ========
-- This script diagnoses and fixes issues with data flowing from frontend to database

-- 1. VERIFY APPOINTMENTS TABLE HAS ALL REQUIRED COLUMNS
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'appointments';

-- 2. VERIFY BARBERS TABLE HAS ALL REQUIRED COLUMNS
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'barbers';

-- 3. VERIFY CLIENTS TABLE HAS ALL REQUIRED COLUMNS
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients';

-- 4. CHECK RECENT APPOINTMENTS TO SEE WHAT'S BEING SAVED
SELECT a.id, 
       a.client_id, 
       c.name as client_name,
       a.barber_id, 
       b.name as barber_name,
       a.service_id,
       s.name as service_name,
       a.date,
       a.time,
       a.status,
       a.type,
       a.price,
       a.commission_amount,
       a.created_at,
       a.updated_at
FROM appointments a
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN barbers b ON a.barber_id = b.id
LEFT JOIN services s ON a.service_id = s.id
ORDER BY a.created_at DESC
LIMIT 20;

-- 5. CHECK FOR NULL CLIENT_IDS THAT MIGHT BE CAUSING "UNKNOWN CLIENT" ISSUE
SELECT a.id, 
       a.client_id, 
       a.barber_id, 
       b.name as barber_name,
       a.service_id,
       s.name as service_name,
       a.created_at
FROM appointments a
LEFT JOIN barbers b ON a.barber_id = b.id
LEFT JOIN services s ON a.service_id = s.id
WHERE a.client_id IS NULL
ORDER BY a.created_at DESC;

-- 6. CHECK COMMISSION CALCULATION ISSUES - LOOK FOR NULL VALUES OR ZEROS
SELECT a.id, 
       a.barber_id, 
       b.name as barber_name,
       b.commission_rate,
       a.service_id,
       s.name as service_name,
       s.price as service_price,
       a.price as recorded_price,
       a.commission_amount,
       a.status,
       (CASE 
          WHEN a.price IS NULL OR b.commission_rate IS NULL THEN 'MISSING DATA'
          ELSE ROUND((a.price * b.commission_rate / 100)::numeric, 2)::text
        END) as expected_commission
FROM appointments a
LEFT JOIN barbers b ON a.barber_id = b.id
LEFT JOIN services s ON a.service_id = s.id
ORDER BY a.created_at DESC
LIMIT 20;

-- 7. FIX NULL CLIENTS BY CREATING UNKNOWN CLIENT IF IT DOESN'T EXIST
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM clients WHERE name = 'Unknown Client') THEN
        INSERT INTO clients (name, email, phone)
        VALUES ('Unknown Client', 'unknown@example.com', '00000000');
    END IF;
END $$;

-- 8. GET UNKNOWN CLIENT ID FOR REFERENCE
SELECT id FROM clients WHERE name = 'Unknown Client';

-- 9. FIX NULL PRICES AND COMMISSION AMOUNTS
UPDATE appointments a
SET price = s.price
FROM services s
WHERE a.service_id = s.id
AND (a.price IS NULL OR a.price = 0);

-- 10. RECALCULATE COMMISSION AMOUNTS WHERE MISSING
UPDATE appointments a
SET commission_amount = ROUND((a.price * b.commission_rate / 100)::numeric, 2)
FROM barbers b
WHERE a.barber_id = b.id
AND (a.commission_amount IS NULL OR a.commission_amount = 0)
AND a.price IS NOT NULL AND a.price > 0
AND b.commission_rate IS NOT NULL;

-- 11. CHECK LINK BETWEEN FRONTEND AND WALK-IN APPOINTMENT CREATION
-- If the NaN issue appears during walk-in creation, this is likely a frontend issue
-- Here's how the data should look:
SELECT 
    'walk-in' as expected_type,
    (SELECT id FROM barbers WHERE name ILIKE '%kairo%') as barber_id_should_be_sent,
    (SELECT commission_rate FROM barbers WHERE name ILIKE '%kairo%') as commission_rate_should_be_used,
    (SELECT price FROM services WHERE name ILIKE '%Premium%') as service_price_should_be_used,
    ROUND(((SELECT price FROM services WHERE name ILIKE '%Premium%') * 
           (SELECT commission_rate FROM barbers WHERE name ILIKE '%kairo%') / 100)::numeric, 2) 
           as commission_amount_should_be;

-- 12. FIX SERVICE PRICES TO ENSURE THEY'RE NUMERIC
UPDATE services
SET price = 0
WHERE price IS NULL;

-- 13. CHECK IF BARBER STATS TRIGGERS ARE WORKING
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name IN ('update_barber_stats', 'update_barber_stats_on_appointment_change', 'ensure_appointment_integrity');

-- 14. MANUALLY UPDATE BARBER STATISTICS AS FALLBACK
DO $$
BEGIN
    PERFORM update_barber_stats();
END $$;
