-- Query to list all appointments in the database
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
ORDER BY a.date, a.time;
