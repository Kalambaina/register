-- Add check-in tracking fields to individual_tickets
ALTER TABLE public.individual_tickets 
ADD COLUMN IF NOT EXISTS checked_in boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_in_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS checked_in_by text;

-- Add index for faster ticket lookups by ticket_number
CREATE INDEX IF NOT EXISTS idx_individual_tickets_ticket_number ON public.individual_tickets(ticket_number);

-- Add index for faster phone number lookups in individual_registrations
CREATE INDEX IF NOT EXISTS idx_individual_registrations_phone ON public.individual_registrations(phone_number);