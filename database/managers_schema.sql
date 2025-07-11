-- Create managers table
CREATE TABLE IF NOT EXISTS "managers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "photo_url" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS "managers" ENABLE ROW LEVEL SECURITY;

-- Create trigger for managers table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_managers_updated_at') THEN
    CREATE TRIGGER update_managers_updated_at
    BEFORE UPDATE ON managers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  END IF;
END
$$;

-- Create RLS policies for managers table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow authenticated read access to managers') THEN
    CREATE POLICY "Allow authenticated read access to managers"
      ON "managers" FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow authenticated update access to managers') THEN
    CREATE POLICY "Allow authenticated update access to managers"
      ON "managers" FOR UPDATE
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow authenticated insert access to managers') THEN
    CREATE POLICY "Allow authenticated insert access to managers"
      ON "managers" FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END
$$;

-- Insert initial manager (if not exists)
INSERT INTO "managers" (name, email)
SELECT 'Admin Manager', 'manager@amaibarbershop.com'
WHERE NOT EXISTS (
  SELECT 1 FROM managers WHERE email = 'manager@amaibarbershop.com'
);
