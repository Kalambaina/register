-- Add RLS policies to allow admins to update payment status
CREATE POLICY "Anyone can update registrations" 
ON public.registrations 
FOR UPDATE 
USING (true);

-- Add RLS policies to allow ticket generation and custom tickets
CREATE POLICY "Anyone can update tickets" 
ON public.tickets 
FOR UPDATE 
USING (true);

-- Create custom_tickets table for additional tickets (teachers/visitors)
CREATE TABLE public.custom_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Teacher', 'Visitor')),
  ticket_number TEXT UNIQUE,
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on custom_tickets
ALTER TABLE public.custom_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_tickets
CREATE POLICY "Anyone can view custom tickets" 
ON public.custom_tickets 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create custom tickets" 
ON public.custom_tickets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update custom tickets" 
ON public.custom_tickets 
FOR UPDATE 
USING (true);

-- Add trigger for custom_tickets updated_at
CREATE TRIGGER update_custom_tickets_updated_at
BEFORE UPDATE ON public.custom_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();