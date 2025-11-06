-- Update the registration fee calculation function to charge per participant
CREATE OR REPLACE FUNCTION public.calculate_registration_fee(participant_count integer)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    per_participant_fee DECIMAL := 100000; -- ₦100,000 per participant
    total_fee DECIMAL;
BEGIN
    -- Calculate total fee: ₦100,000 × number of participants
    total_fee := per_participant_fee * participant_count;
    RETURN total_fee;
END;
$function$

-- Update registrations table to remove categories and add payment method
ALTER TABLE public.registrations 
DROP COLUMN IF EXISTS categories,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';

-- Add payment method to payment_records if not exists
ALTER TABLE public.payment_records 
ALTER COLUMN payment_method DROP NOT NULL,
ALTER COLUMN payment_method SET DEFAULT 'cash';