-- Add features column to units table
ALTER TABLE public.units 
ADD COLUMN IF NOT EXISTS features TEXT[];

-- Comment explaining the purpose of the column
COMMENT ON COLUMN public.units.features IS 'Array of unit features like "Balcony", "Air conditioning", etc.';
