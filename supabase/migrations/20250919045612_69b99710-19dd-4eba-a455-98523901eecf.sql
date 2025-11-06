-- Remove categories column and add payment method to registrations table
ALTER TABLE public.registrations 
DROP COLUMN IF EXISTS categories,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';