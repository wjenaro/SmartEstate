-- SQL to create proper utility_readings table
CREATE TABLE IF NOT EXISTS unit_utilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) NOT NULL,
  unit_id UUID REFERENCES units(id) NOT NULL,
  utility_type TEXT NOT NULL CHECK (utility_type IN ('water', 'electricity')),
  reading_date TIMESTAMP WITH TIME ZONE NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  current_reading NUMERIC NOT NULL,
  previous_reading NUMERIC NOT NULL DEFAULT 0,
  rate NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_unit_utilities_property_id ON unit_utilities (property_id);
CREATE INDEX IF NOT EXISTS idx_unit_utilities_unit_id ON unit_utilities (unit_id);

-- RLS Policies to ensure data isolation based on account
ALTER TABLE unit_utilities ENABLE ROW LEVEL SECURITY;

-- Policy to allow viewing of utility readings belonging to the user's account
CREATE POLICY view_unit_utilities ON unit_utilities
  FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties 
      WHERE account_id = auth.jwt() ->> 'account_id'::text
    )
  );

-- Policy to allow insertion of utility readings for properties belonging to the user's account
CREATE POLICY insert_unit_utilities ON unit_utilities
  FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties 
      WHERE account_id = auth.jwt() ->> 'account_id'::text
    )
  );
