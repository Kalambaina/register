import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { tracking_number } = await req.json();
    console.log('Generating ticket for tracking number:', tracking_number);

    if (!tracking_number) {
      return new Response(
        JSON.stringify({ success: false, error: 'Tracking number is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get registration details with participants
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select(`
        *,
        participants (*)
      `)
      .eq('tracking_number', tracking_number.toUpperCase())
      .single();

    if (regError || !registration) {
      console.error('Registration not found:', regError);
      return new Response(
        JSON.stringify({ success: false, error: 'Registration not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if ticket already exists
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('*')
      .eq('registration_id', registration.id)
      .single();

    if (existingTicket) {
      console.log('Ticket already exists:', existingTicket.ticket_number);
      return new Response(
        JSON.stringify({ 
          success: true, 
          ticket: existingTicket,
          message: 'Ticket already exists'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate ticket number
    const { data: ticketNumber, error: ticketNumError } = await supabase
      .rpc('generate_ticket_number');

    if (ticketNumError || !ticketNumber) {
      console.error('Failed to generate ticket number:', ticketNumError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate ticket number' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      ticket_number: ticketNumber,
      tracking_number: registration.tracking_number,
      school_name: registration.school_name,
      participant_count: registration.participants?.length || 0,
      event: 'CHAF Competition 2025',
      generated_at: new Date().toISOString()
    });

    // Create ticket record
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        registration_id: registration.id,
        ticket_number: ticketNumber,
        qr_code: qrData,
        status: 'active'
      })
      .select()
      .single();

    if (ticketError || !ticket) {
      console.error('Failed to create ticket:', ticketError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create ticket' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Ticket generated successfully:', ticket.ticket_number);

    // Return ticket data (PDF generation will be handled client-side)
    return new Response(
      JSON.stringify({ 
        success: true, 
        ticket: {
          ...ticket,
          registration: {
            ...registration,
            participants: registration.participants
          }
        },
        message: 'Ticket generated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Ticket generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});