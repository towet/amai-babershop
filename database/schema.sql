-- Enable RLS (Row Level Security)
alter table if exists "public"."profiles" enable row level security;

-- Create barbers table
CREATE TABLE IF NOT EXISTS "barbers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT,
  "age" INTEGER,
  "specialty" TEXT,
  "bio" TEXT,
  "photo_url" TEXT,
  "join_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "total_cuts" INTEGER NOT NULL DEFAULT 0,
  "appointment_cuts" INTEGER NOT NULL DEFAULT 0,
  "walk_in_cuts" INTEGER NOT NULL DEFAULT 0,
  "commission_rate" INTEGER NOT NULL DEFAULT 60,
  "total_commission" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "rating" DECIMAL(3, 2),
  "password" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS "barbers" ENABLE ROW LEVEL SECURITY;

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

-- Create services table
CREATE TABLE IF NOT EXISTS "services" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "duration" INTEGER NOT NULL, -- in minutes
  "price" DECIMAL(10, 2) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS "services" ENABLE ROW LEVEL SECURITY;

-- Create clients table
CREATE TABLE IF NOT EXISTS "clients" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE,
  "phone" TEXT,
  "total_visits" INTEGER NOT NULL DEFAULT 0,
  "last_visit" TIMESTAMP WITH TIME ZONE,
  "preferred_barber_id" UUID REFERENCES "barbers" ("id"),
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS "clients" ENABLE ROW LEVEL SECURITY;

-- Create appointments table
CREATE TABLE IF NOT EXISTS "appointments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" UUID REFERENCES "clients" ("id"),
  "barber_id" UUID NOT NULL REFERENCES "barbers" ("id"),
  "service_id" UUID NOT NULL REFERENCES "services" ("id"),
  "date" DATE NOT NULL,
  "time" TEXT NOT NULL, -- stored as 'HH:MM' format
  "status" TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  "type" TEXT NOT NULL CHECK (type IN ('appointment', 'walk-in')),
  "duration" INTEGER NOT NULL, -- in minutes
  "price" DECIMAL(10, 2) NOT NULL,
  "commission_amount" DECIMAL(10, 2) NOT NULL,
  "notes" TEXT,
  "walk_in_client_name" TEXT, -- For walk-in clients without an account
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS "appointments" ENABLE ROW LEVEL SECURITY;

-- Create reviews table
CREATE TABLE IF NOT EXISTS "reviews" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "barber_id" UUID NOT NULL REFERENCES "barbers" ("id"),
  "client_id" UUID REFERENCES "clients" ("id"),
  "rating" INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  "comment" TEXT,
  "client_name" TEXT NOT NULL,
  "client_email" TEXT,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "approved" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS "reviews" ENABLE ROW LEVEL SECURITY;

-- Create function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update 'updated_at'
CREATE TRIGGER update_barbers_updated_at
BEFORE UPDATE ON barbers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_managers_updated_at
BEFORE UPDATE ON managers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create RLS policies
-- Managers policies
CREATE POLICY "Allow authenticated read access to managers"
  ON "managers" FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update access to managers"
  ON "managers" FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert access to managers"
  ON "managers" FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Barbers policies
CREATE POLICY "Allow public read access to barbers"
  ON "barbers" FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Allow authenticated update access to barbers"
  ON "barbers" FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert access to barbers"
  ON "barbers" FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Services policies
CREATE POLICY "Allow public read access to services"
  ON "services" FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated update access to services"
  ON "services" FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert access to services"
  ON "services" FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Clients policies
CREATE POLICY "Allow authenticated read access to clients"
  ON "clients" FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update access to clients"
  ON "clients" FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert access to clients"
  ON "clients" FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Appointments policies
CREATE POLICY "Allow authenticated read access to appointments"
  ON "appointments" FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update access to appointments"
  ON "appointments" FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert access to appointments"
  ON "appointments" FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Reviews policies
CREATE POLICY "Allow public read access to approved reviews"
  ON "reviews" FOR SELECT
  USING (approved = TRUE);

CREATE POLICY "Allow authenticated read access to all reviews"
  ON "reviews" FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update access to reviews"
  ON "reviews" FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public insert access to reviews"
  ON "reviews" FOR INSERT
  WITH CHECK (true);

-- Insert initial data
-- Insert initial manager
INSERT INTO "managers" (name, email) VALUES
  ('Admin Manager', 'manager@amaibarbershop.com');

-- Insert initial services
INSERT INTO "services" (name, description, duration, price) VALUES
  ('Taper fade & beard + hair wash', 'Precision taper fade, beard trim and shape with complimentary hair wash.', 60, 600),
  ('Classic cut & hot towel shave', 'Traditional haircut followed by a relaxing hot towel shave.', 45, 450),
  ('Beard trim & styling', 'Expert beard trimming, shaping, and styling.', 30, 250),
  ('Haircut & styling', 'Haircut tailored to your preferences with professional styling.', 45, 350),
  ('Premium package', 'Complete package with haircut, beard trim, and facial treatment.', 90, 800);
