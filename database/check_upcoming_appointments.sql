-- Query to check for upcoming appointments (today and future dates)
-- This will help us see if there are any appointments that should be displayed

SELECT 
  a.id,
  a.date,
  a.time,
  a.status,
  a.type,
  a.notes,
  a.price,
  b.name AS barber_name,
  b.id AS barber_id,
  c.name AS client_name,
  s.name AS service_name
FROM appointments a
LEFT JOIN barbers b ON a.barber_id = b.id
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN services s ON a.service_id = s.id
WHERE a.date >= CURRENT_DATE
  AND a.status != 'cancelled' -- Only show active appointments
ORDER BY a.date, a.time;
