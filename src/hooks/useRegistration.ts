import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Participant {
  name: string;
  class: string;
  categoryId: string;
}

interface RegistrationData {
  schoolName: string;
  contactName: string;
  contactPhone: string;
  participants: Participant[];
  selectedCategories: string[];
  comments: string;
  paymentMethod: 'bank_transfer';
}

interface RegistrationResult {
  success: boolean;
  trackingNumber?: string;
  registrationId?: string;
  totalAmount?: number;
  error?: string;
}

export const useRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitRegistration = async (data: RegistrationData): Promise<RegistrationResult> => {
    setIsSubmitting(true);

    try {
      // Generate tracking number
      const { data: trackingResult, error: trackingError } = await supabase
        .rpc('generate_tracking_number');

      if (trackingError) {
        throw new Error(`Failed to generate tracking number: ${trackingError.message}`);
      }

      // Calculate total fee based on categories
      const categoryIds = data.selectedCategories;
      const { data: totalAmount, error: feeError } = await supabase
        .rpc('calculate_registration_fee', { category_ids: categoryIds });

      if (feeError) {
        throw new Error(`Failed to calculate fee: ${feeError.message}`);
      }

      // Create registration record
      const { data: registration, error: regError } = await supabase
        .from('registrations')
        .insert({
          tracking_number: trackingResult,
          school_name: data.schoolName,
          contact_name: data.contactName,
          contact_phone: data.contactPhone,
          comments: data.comments || null,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'unpaid',
          payment_method: data.paymentMethod
        })
        .select()
        .single();

      if (regError) {
        throw new Error(`Failed to create registration: ${regError.message}`);
      }

      // Add registration categories
      const categoryRecords = data.selectedCategories.map(categoryId => ({
        registration_id: registration.id,
        category_id: categoryId
      }));

      const { error: categoryError } = await supabase
        .from('registration_categories')
        .insert(categoryRecords);

      if (categoryError) {
        throw new Error(`Failed to add categories: ${categoryError.message}`);
      }

      // Add participants
      const participantRecords = data.participants.map(participant => ({
        registration_id: registration.id,
        name: participant.name,
        class: participant.class,
        category_id: participant.categoryId
      }));

      const { error: participantError } = await supabase
        .from('participants')
        .insert(participantRecords);

      if (participantError) {
        throw new Error(`Failed to add participants: ${participantError.message}`);
      }

      toast({
        title: "Registration Successful!",
        description: `Your tracking number is: ${trackingResult}`,
      });

      return {
        success: true,
        trackingNumber: trackingResult,
        registrationId: registration.id,
        totalAmount: totalAmount
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRegistrationByTracking = async (trackingNumber: string) => {
    try {
      const { data: registration, error } = await supabase
        .from('registrations')
        .select(`
          *,
          participants (*)
        `)
        .eq('tracking_number', trackingNumber.toUpperCase())
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data: registration };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration not found';
      return { success: false, error: errorMessage };
    }
  };

  return {
    submitRegistration,
    getRegistrationByTracking,
    isSubmitting
  };
};