-- Comprehensive database diagnostics queries

-- 1. Check appointments table structure to confirm fields exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments';

-- 2. Check barbers table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'barbers';

-- 3. Check all appointments for the new barber (Kairo)
SELECT a.*, 
       b.name AS barber_name,
       c.name AS client_name,
       s.name AS service_name
FROM appointments a
LEFT JOIN barbers b ON a.barber_id = b.id
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN services s ON a.service_id = s.id
WHERE b.name ILIKE '%kairo%';

-- 4. Check if commission_amount is being calculated properly
SELECT a.id, a.price, a.commission_amount, b.name AS barber_name, b.commission_rate
FROM appointments a
JOIN barbers b ON a.barber_id = b.id
ORDER BY a.created_at DESC
LIMIT 20;

-- 5. Check for NULL or missing client_id
SELECT COUNT(*) AS missing_client_count
FROM appointments 
WHERE client_id IS NULL;

-- 6. Check if any triggers exist on the appointments table 
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'appointments';

-- 7. Check if any appointments are not linked to a barber
SELECT COUNT(*) AS missing_barber_count
FROM appointments 
WHERE barber_id IS NULL;

-- 8. Check walk-in appointments specifically 
SELECT a.*, b.name AS barber_name, s.name AS service_name
FROM appointments a
LEFT JOIN barbers b ON a.barber_id = b.id
LEFT JOIN services s ON a.service_id = s.id
WHERE a.type = 'walk-in'
ORDER BY a.created_at DESC
LIMIT 10;

-- 9. Check if barber statistics match the actual appointment counts
SELECT 
    b.id AS barber_id,
    b.name AS barber_name,
    b.total_cuts,
    (SELECT COUNT(*) FROM appointments a WHERE a.barber_id = b.id AND a.status = 'completed') AS actual_completed_count,
    b.total_commission,
    (SELECT COALESCE(SUM(commission_amount), 0) FROM appointments a WHERE a.barber_id = b.id AND a.status = 'completed') AS actual_commission
FROM barbers b;

-- 10. Check if the triggers we created are registered in the database
SELECT routine_name, routine_type, routine_definition
FROM information_schema.routines 
WHERE routine_name IN ('update_barber_stats', 'update_barber_stats_on_appointment_change', 'ensure_appointment_integrity');
