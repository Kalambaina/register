import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentStatusResult {
  isVerified: boolean;
  status: string;
  registration: any | null;
  error?: string;
}

export const usePaymentStatus = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkPaymentStatus = async (trackingNumber: string): Promise<PaymentStatusResult> => {
    setIsChecking(true);
    
    try {
      const { data: registration, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('tracking_number', trackingNumber.toUpperCase())
        .single();

      if (error || !registration) {
        return {
          isVerified: false,
          status: 'not_found',
          registration: null,
          error: 'Registration not found'
        };
      }

      const isVerified = registration.payment_status === 'paid';
      
      return {
        isVerified,
        status: registration.payment_status,
        registration,
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return {
        isVerified: false,
        status: 'error',
        registration: null,
        error: 'Failed to check payment status'
      };
    } finally {
      setIsChecking(false);
    }
  };

  const simulatePaymentVerification = async (trackingNumber: string): Promise<PaymentStatusResult> => {
    setIsChecking(true);
    
    try {
      // Simulate checking and then mark as verified
      // In a real app, this would be handled by admin verification
      const { error } = await supabase
        .from('registrations')
        .update({ 
          payment_status: 'paid',
          status: 'confirmed'
        })
        .eq('tracking_number', trackingNumber.toUpperCase());

      if (error) {
        throw error;
      }

      toast({
        title: "Payment Verified",
        description: "Your payment has been verified! Redirecting to dashboard...",
      });

      return {
        isVerified: true,
        status: 'paid',
        registration: null
      };
    } catch (error) {
      console.error('Error simulating payment verification:', error);
      return {
        isVerified: false,
        status: 'error',
        registration: null,
        error: 'Failed to verify payment'
      };
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkPaymentStatus,
    simulatePaymentVerification,
    isChecking
  };
};