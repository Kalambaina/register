-- Fix security warnings by setting search_path for functions

-- Update generate_tracking_number function with proper search_path
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    tracking_num TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Generate tracking number: CHAF + year + random 6-digit number
        tracking_num := 'CHAF' || EXTRACT(YEAR FROM NOW()) || LPAD(FLOOR(RANDOM() * 999999 + 1)::TEXT, 6, '0');
        
        -- Check if it already exists
        IF NOT EXISTS (SELECT 1 FROM public.registrations WHERE tracking_number = tracking_num) THEN
            RETURN tracking_num;
        END IF;
        
        counter := counter + 1;
        -- Prevent infinite loop
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique tracking number after 100 attempts';
        END IF;
    END LOOP;
END;
$$;

-- Update update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Update calculate_registration_fee function with proper search_path
CREATE OR REPLACE FUNCTION public.calculate_registration_fee(categories TEXT[])
RETURNS DECIMAL 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_fee DECIMAL := 5000; -- Base fee of ₦5,000
    category_fee DECIMAL := 2000; -- Additional ₦2,000 per category
    total_fee DECIMAL;
BEGIN
    -- Calculate total fee: base fee + (number of categories * category fee)
    total_fee := base_fee + (array_length(categories, 1) * category_fee);
    RETURN total_fee;
END;
$$;