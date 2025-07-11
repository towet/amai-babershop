-- Query to check if Joseph has any appointments
-- Joseph's barber ID from console logs: aabc6bd6-cbc2-42b3-8f14-56b86b6a0957

SELECT 
  a.id,
  a.date,
  a.time,
  a.status,
  a.type,
  a.notes,
  a.price,
  b.name AS barber_name,
  c.name AS client_name,
  s.name AS service_name
FROM appointments a
LEFT JOIN barbers b ON a.barber_id = b.id
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN services s ON a.service_id = s.id
WHERE a.barber_id = 'aabc6bd6-cbc2-42b3-8f14-56b86b6a0957'
ORDER BY a.date, a.time;
