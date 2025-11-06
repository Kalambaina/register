-- Create individual_registrations table for the new individual registration flow
CREATE TABLE IF NOT EXISTS public.individual_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  gender TEXT NOT NULL,
  state TEXT NOT NULL,
  lga TEXT NOT NULL,
  comments TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  admin_verified BOOLEAN NOT NULL DEFAULT false,
  amount NUMERIC NOT NULL DEFAULT 3000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.individual_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (same pattern as school registrations)
CREATE POLICY "Anyone can create individual registrations" 
ON public.individual_registrations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view individual registrations" 
ON public.individual_registrations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update individual registrations" 
ON public.individual_registrations 
FOR UPDATE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_individual_registrations_updated_at
BEFORE UPDATE ON public.individual_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create individual_tickets table
CREATE TABLE IF NOT EXISTS public.individual_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.individual_registrations(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL UNIQUE,
  qr_code TEXT NOT NULL,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for tickets
ALTER TABLE public.individual_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create individual tickets" 
ON public.individual_tickets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view individual tickets" 
ON public.individual_tickets 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update individual tickets" 
ON public.individual_tickets 
FOR UPDATE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_individual_tickets_updated_at
BEFORE UPDATE ON public.individual_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();