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
$function$;