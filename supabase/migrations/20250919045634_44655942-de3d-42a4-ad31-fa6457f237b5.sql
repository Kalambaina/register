-- Update payment_records to make payment_method optional with cash default
ALTER TABLE public.payment_records 
ALTER COLUMN payment_method DROP NOT NULL,
ALTER COLUMN payment_method SET DEFAULT 'cash';