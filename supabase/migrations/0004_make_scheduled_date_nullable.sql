-- Make scheduled_date nullable in activities table
ALTER TABLE public.activities 
  ALTER COLUMN scheduled_date DROP NOT NULL;
