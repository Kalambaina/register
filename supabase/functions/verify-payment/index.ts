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
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { reference, tracking_number } = await req.json();
    console.log('Verifying payment for reference:', reference);

    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment gateway not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify payment with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.status) {
      console.error('Payment verification failed:', verifyData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: verifyData.message || 'Payment verification failed' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const paymentData = verifyData.data;
    const isSuccessful = paymentData.status === 'success';

    console.log('Payment verification result:', paymentData.status);

    // Update payment record
    const { error: paymentUpdateError } = await supabase
      .from('payment_records')
      .update({
        payment_status: isSuccessful ? 'paid' : 'failed',
        gateway_response: verifyData,
        transaction_id: paymentData.id
      })
      .eq('payment_reference', reference);

    if (paymentUpdateError) {
      console.error('Error updating payment record:', paymentUpdateError);
    }

    if (isSuccessful) {
      // Update registration status to paid
      const { error: regUpdateError } = await supabase
        .from('registrations')
        .update({ 
          payment_status: 'paid',
          status: 'confirmed'
        })
        .eq('tracking_number', tracking_number);

      if (regUpdateError) {
        console.error('Error updating registration:', regUpdateError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update registration' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Generate ticket
      try {
        const { data: ticketData, error: ticketError } = await supabase.functions.invoke('generate-ticket', {
          body: { tracking_number }
        });

        if (ticketError) {
          console.error('Error generating ticket:', ticketError);
        } else {
          console.log('Ticket generated successfully');
        }
      } catch (ticketError) {
        console.error('Ticket generation failed:', ticketError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment verified successfully',
          amount: paymentData.amount / 100, // Convert from kobo
          status: paymentData.status
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Update registration status to failed
      const { error: regUpdateError } = await supabase
        .from('registrations')
        .update({ 
          payment_status: 'failed',
          status: 'payment_failed'
        })
        .eq('tracking_number', tracking_number);

      if (regUpdateError) {
        console.error('Error updating registration status:', regUpdateError);
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment was not successful',
          status: paymentData.status
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Payment verification error:', error);
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