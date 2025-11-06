import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  registrationId: string;
  trackingNumber: string;
  amount: number;
  email: string;
  name: string;
  phone?: string;
  schoolName: string;
  participants: Array<{ name: string; class: string }>;
}

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

    const requestData: PaymentRequest = await req.json();
    console.log('Processing payment for:', requestData.trackingNumber);

    // Validate required fields
    if (!requestData.registrationId || !requestData.amount || !requestData.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required payment data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if payment gateway is configured
    if (!paystackSecretKey) {
      console.log('Paystack secret key not configured, falling back to cash payment');
      
      // Update registration to confirmed status for cash payment
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ 
          payment_method: 'cash',
          status: 'confirmed'
        })
        .eq('id', requestData.registrationId);

      if (updateError) {
        console.error('Error updating registration:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update registration' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Registration confirmed for cash payment',
          paymentMethod: 'cash'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize payment with Paystack
    const paymentPayload = {
      email: requestData.email,
      amount: requestData.amount * 100, // Convert to kobo
      currency: 'NGN',
      reference: `chaf_${requestData.trackingNumber}_${Date.now()}`,
      callback_url: `${req.headers.get('origin')}/payment-success?tracking=${requestData.trackingNumber}`,
      metadata: {
        registration_id: requestData.registrationId,
        tracking_number: requestData.trackingNumber,
        school_name: requestData.schoolName,
        participant_count: requestData.participants.length,
        custom_fields: [
          {
            display_name: "School Name",
            variable_name: "school_name",
            value: requestData.schoolName
          },
          {
            display_name: "Tracking Number",
            variable_name: "tracking_number", 
            value: requestData.trackingNumber
          }
        ]
      }
    };

    console.log('Initializing Paystack payment:', paymentPayload.reference);

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack initialization failed:', paystackData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: paystackData.message || 'Failed to initialize payment' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payment_records')
      .insert({
        registration_id: requestData.registrationId,
        amount: requestData.amount,
        payment_method: 'gateway',
        payment_gateway: 'paystack',
        payment_reference: paymentPayload.reference,
        gateway_reference: paystackData.data.reference,
        payment_status: 'pending',
        gateway_response: paystackData
      });

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create payment record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update registration status
    const { error: regError } = await supabase
      .from('registrations')
      .update({ 
        payment_method: 'gateway',
        status: 'pending_payment'
      })
      .eq('id', requestData.registrationId);

    if (regError) {
      console.error('Error updating registration status:', regError);
    }

    console.log('Payment initialized successfully:', paystackData.data.reference);

    return new Response(
      JSON.stringify({ 
        success: true, 
        paymentUrl: paystackData.data.authorization_url,
        reference: paystackData.data.reference
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
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