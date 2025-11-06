-- Create tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL,
  ticket_number TEXT NOT NULL UNIQUE,
  qr_code TEXT NOT NULL,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for tickets
CREATE POLICY "Anyone can view tickets" 
ON public.tickets 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create tickets" 
ON public.tickets 
FOR INSERT 
WITH CHECK (true);

-- Add trigger for automatic timestamp updates on tickets
CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update payment_records to add gateway transaction reference
ALTER TABLE public.payment_records 
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS gateway_reference TEXT;

-- Create function to generate ticket number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    ticket_num TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Generate ticket number: TICKET + year + random 8-digit number
        ticket_num := 'TICKET' || EXTRACT(YEAR FROM NOW()) || LPAD(FLOOR(RANDOM() * 99999999 + 1)::TEXT, 8, '0');
        
        -- Check if it already exists
        IF NOT EXISTS (SELECT 1 FROM public.tickets WHERE ticket_number = ticket_num) THEN
            RETURN ticket_num;
        END IF;
        
        counter := counter + 1;
        -- Prevent infinite loop
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique ticket number after 100 attempts';
        END IF;
    END LOOP;
END;
$$;