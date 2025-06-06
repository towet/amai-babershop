-- First, let's check the current RLS policies for appointments
SELECT *
FROM pg_policies
WHERE tablename = 'appointments';

-- We need to make sure there's a policy that allows barbers to read their own appointments
-- If not, let's create one
CREATE POLICY "Barbers can view their own appointments" ON "public"."appointments"
FOR SELECT
USING (auth.uid() IN (
  SELECT auth.uid() FROM barbers WHERE id = barber_id
) OR 
EXISTS (
  SELECT 1 FROM barbers 
  WHERE barbers.email = auth.email() AND barbers.id = appointments.barber_id
));

-- And make sure managers can see all appointments
CREATE POLICY "Managers can view all appointments" ON "public"."appointments"
FOR SELECT
USING (
  auth.uid() IN (
    SELECT auth.uid() FROM managers
  ) OR 
  EXISTS (
    SELECT 1 FROM managers WHERE managers.email = auth.email()
  )
);

-- Make sure RLS is enabled on the appointments table
ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;

-- Check again to see our policies
SELECT *
FROM pg_policies
WHERE tablename = 'appointments';
