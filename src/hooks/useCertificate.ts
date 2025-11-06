import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";

interface CertificateData {
  participantName: string;
  trackingNumber: string;
  state: string;
  lga: string;
  checkedInAt: string;
  gender: string;
}

export const useCertificate = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchCertificateData = async (trackingNumber: string): Promise<CertificateData | null> => {
    try {
      const { data, error } = await supabase
        .from('individual_registrations')
        .select(`
          *,
          individual_tickets (
            checked_in,
            checked_in_at
          )
        `)
        .eq('tracking_number', trackingNumber.toUpperCase())
        .single();

      if (error) throw error;

      // Check if participant has checked in
      const ticket = Array.isArray(data.individual_tickets) 
        ? data.individual_tickets[0] 
        : data.individual_tickets;

      if (!ticket || !ticket.checked_in) {
        toast({
          title: "Certificate Not Available",
          description: "Certificates are only available for participants who have checked in at the event.",
          variant: "destructive"
        });
        return null;
      }

      return {
        participantName: data.full_name,
        trackingNumber: data.tracking_number,
        state: data.state,
        lga: data.lga,
        checkedInAt: ticket.checked_in_at,
        gender: data.gender
      };
    } catch (error) {
      console.error('Error fetching certificate data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch certificate data",
        variant: "destructive"
      });
      return null;
    }
  };

  const generateCertificatePDF = async (
    certificateElement: HTMLElement,
    participantName: string,
    trackingNumber: string
  ) => {
    setIsGenerating(true);
    try {
      // Wait for all resources to load
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Capture the certificate as canvas
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
      });

      // Create PDF in landscape A4
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Download
      pdf.save(`CHAF_Certificate_${participantName.replace(/\s+/g, '_')}_${trackingNumber}.pdf`);

      toast({
        title: "Success",
        description: "Your certificate PDF has been downloaded successfully!",
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error",
        description: "Failed to generate certificate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCertificateImage = async (
    certificateElement: HTMLElement,
    participantName: string,
    trackingNumber: string
  ) => {
    setIsGenerating(true);
    try {
      // Wait for all resources to load
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const canvas = await html2canvas(certificateElement, {
        scale: 3, // Higher quality for images
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
      });
      
      // Convert to PNG and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `CHAF_Certificate_${participantName.replace(/\s+/g, '_')}_${trackingNumber}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Success",
            description: "Certificate image downloaded successfully!",
          });
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Error generating certificate image:', error);
      toast({
        title: "Error",
        description: "Failed to generate certificate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    fetchCertificateData,
    generateCertificatePDF,
    generateCertificateImage
  };
};
