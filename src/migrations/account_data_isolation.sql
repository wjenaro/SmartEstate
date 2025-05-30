-- Migration to implement account-based data isolation in SmartEstate

-- =======================================
-- 1. Add account_id column to tables that might be missing it
-- =======================================

-- Check if account_id column exists in properties table, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'properties' AND column_name = 'account_id') THEN
    ALTER TABLE properties ADD COLUMN account_id UUID REFERENCES user_accounts(id);
  END IF;
END $$;

-- Check if account_id column exists in units table, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'units' AND column_name = 'account_id') THEN
    ALTER TABLE units ADD COLUMN account_id UUID REFERENCES user_accounts(id);
  END IF;
END $$;

-- Check if account_id column exists in utility_readings table, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'utility_readings' AND column_name = 'account_id') THEN
    ALTER TABLE utility_readings ADD COLUMN account_id UUID REFERENCES user_accounts(id);
  END IF;
END $$;

-- Check if account_id column exists in tenants table, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'tenants' AND column_name = 'account_id') THEN
    ALTER TABLE tenants ADD COLUMN account_id UUID REFERENCES user_accounts(id);
  END IF;
END $$;

-- =======================================
-- 2. Add foreign key constraints
-- =======================================

-- Units FK to properties (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_units_property_id' AND table_name = 'units') THEN
    ALTER TABLE units
      ADD CONSTRAINT fk_units_property_id
      FOREIGN KEY (property_id) REFERENCES properties(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Units FK to account_id (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_units_account_id' AND table_name = 'units') THEN
    ALTER TABLE units
      ADD CONSTRAINT fk_units_account_id
      FOREIGN KEY (account_id) REFERENCES user_accounts(id);
  END IF;
END $$;

-- Utility readings FK to account_id (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_utility_readings_account_id' AND table_name = 'utility_readings') THEN
    ALTER TABLE utility_readings
      ADD CONSTRAINT fk_utility_readings_account_id
      FOREIGN KEY (account_id) REFERENCES user_accounts(id);
  END IF;
END $$;

-- Tenants FK to account_id (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_tenants_account_id' AND table_name = 'tenants') THEN
    ALTER TABLE tenants
      ADD CONSTRAINT fk_tenants_account_id
      FOREIGN KEY (account_id) REFERENCES user_accounts(id);
  END IF;
END $$;

-- =======================================
-- 3. Add indexes for better performance
-- =======================================

-- Index on properties.account_id
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                WHERE indexname = 'idx_properties_account_id') THEN
    CREATE INDEX idx_properties_account_id ON properties(account_id);
  END IF;
END $$;

-- Index on units.account_id
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                WHERE indexname = 'idx_units_account_id') THEN
    CREATE INDEX idx_units_account_id ON units(account_id);
  END IF;
END $$;

-- Index on utility_readings.account_id
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                WHERE indexname = 'idx_utility_readings_account_id') THEN
    CREATE INDEX idx_utility_readings_account_id ON utility_readings(account_id);
  END IF;
END $$;

-- Index on tenants.account_id
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                WHERE indexname = 'idx_tenants_account_id') THEN
    CREATE INDEX idx_tenants_account_id ON tenants(account_id);
  END IF;
END $$;

-- =======================================
-- 4. Add Row-Level Security Policies
-- =======================================

-- Enable RLS on properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Properties RLS policy (only allow access to records with matching account_id)
CREATE POLICY "Isolate properties by account" ON properties
  FOR ALL USING (account_id = auth.uid());

-- Enable RLS on units table
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Units RLS policy (only allow access to records with matching account_id)
CREATE POLICY "Isolate units by account" ON units
  FOR ALL USING (account_id = auth.uid());

-- Enable RLS on utility_readings table
ALTER TABLE utility_readings ENABLE ROW LEVEL SECURITY;

-- Utility readings RLS policy (only allow access to records with matching account_id)
CREATE POLICY "Isolate utility readings by account" ON utility_readings
  FOR ALL USING (account_id = auth.uid());

-- Enable RLS on tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Tenants RLS policy (only allow access to records with matching account_id)
CREATE POLICY "Isolate tenants by account" ON tenants
  FOR ALL USING (account_id = auth.uid());

-- =======================================
-- 5. Update existing records to associate with account (example script)
-- =======================================

-- This would need to be adjusted for your specific data, but here's an example
-- It sets account_id on properties that don't have it set based on the created_by field
UPDATE properties 
SET account_id = (
  SELECT auth_user_id 
  FROM user_accounts 
  WHERE id = properties.created_by
)
WHERE account_id IS NULL AND created_by IS NOT NULL;

-- Similarly for units, associate them with the same account as their property
UPDATE units
SET account_id = (
  SELECT account_id
  FROM properties
  WHERE properties.id = units.property_id
)
WHERE account_id IS NULL;

-- For utility readings, associate them with the same account as their property
UPDATE utility_readings
SET account_id = (
  SELECT account_id
  FROM properties
  WHERE properties.id = utility_readings.property_id
)
WHERE account_id IS NULL;
