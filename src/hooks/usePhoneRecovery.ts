import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RecoveryResult {
  success: boolean;
  trackingNumbers?: string[];
  error?: string;
}

export const usePhoneRecovery = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const { toast } = useToast();

  const recoverByPhone = async (phoneNumber: string): Promise<RecoveryResult> => {
    try {
      setIsRecovering(true);

      const { data, error } = await supabase
        .from('registrations')
        .select('tracking_number, school_name, created_at')
        .eq('contact_phone', phoneNumber.trim())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const trackingNumbers = data.map(reg => reg.tracking_number);
        
        toast({
          title: "Recovery Successful",
          description: `Found ${data.length} registration(s) for this phone number`,
        });

        return {
          success: true,
          trackingNumbers
        };
      } else {
        toast({
          title: "No Registrations Found",
          description: "No registrations found for this phone number",
          variant: "destructive"
        });

        return {
          success: false,
          error: "No registrations found for this phone number"
        };
      }
    } catch (error) {
      console.error('Recovery error:', error);
      
      toast({
        title: "Recovery Failed",
        description: "Failed to recover tracking numbers. Please try again.",
        variant: "destructive"
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Recovery failed"
      };
    } finally {
      setIsRecovering(false);
    }
  };

  return {
    recoverByPhone,
    isRecovering
  };
};