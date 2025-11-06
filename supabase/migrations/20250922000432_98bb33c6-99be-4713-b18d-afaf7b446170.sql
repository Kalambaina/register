-- Add categories table and update participants table to include category
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  fee NUMERIC NOT NULL DEFAULT 100000,
  max_participants INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the three competition categories
INSERT INTO public.categories (name, fee, max_participants, description) VALUES
  ('Debate', 100000, 3, 'Inter-school debate competition with maximum 3 participants'),
  ('Quiz', 100000, 2, 'Academic quiz competition with maximum 2 participants'),
  ('Spelling Bee', 100000, 2, 'Spelling bee competition with maximum 2 participants');

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (read-only for public)
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

-- Add category_id to participants table
ALTER TABLE public.participants ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Add registration_categories junction table for many-to-many relationship
CREATE TABLE public.registration_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.registrations(id),
  category_id UUID NOT NULL REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(registration_id, category_id)
);

-- Enable RLS on registration_categories
ALTER TABLE public.registration_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for registration_categories
CREATE POLICY "Anyone can create registration categories" 
ON public.registration_categories 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view registration categories" 
ON public.registration_categories 
FOR SELECT 
USING (true);

-- Add trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update calculate_registration_fee function to handle categories array
CREATE OR REPLACE FUNCTION public.calculate_registration_fee(category_ids UUID[])
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    category_count INTEGER;
    per_category_fee DECIMAL := 100000; -- ₦100,000 per category
    total_fee DECIMAL;
BEGIN
    -- Calculate total fee: ₦100,000 × number of categories
    category_count := array_length(category_ids, 1);
    IF category_count IS NULL THEN
        category_count := 0;
    END IF;
    
    total_fee := per_category_fee * category_count;
    RETURN total_fee;
END;
$function$;