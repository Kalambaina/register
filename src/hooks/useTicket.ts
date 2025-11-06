import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface TicketData {
  ticket_number: string;
  qr_code: string;
  registration: {
    tracking_number: string;
    school_name: string;
    contact_name: string;
    contact_phone: string;
    total_amount: number;
    participants: Array<{ name: string; class: string }>;
  };
}

export const useTicket = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateTicketPDF = async (ticketData: TicketData): Promise<string> => {
    try {
      setIsGenerating(true);

      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Set background color
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Header section with CHAF branding
      pdf.setFillColor(59, 130, 246); // Primary blue
      pdf.rect(0, 0, pageWidth, 40, 'F');

      // Add CHAF logo to header
      try {
        // Add logo image (you may need to convert to base64 or use a different approach)
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CHAF', 20, 25);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Creating Happiness Foundation', 20, 32);
      } catch (error) {
        // Fallback text if image fails to load
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CHAF', 20, 25);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Creating Happiness Foundation', 20, 32);
      }

      // Event title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OFFICIAL EVENT TICKET', pageWidth - 20, 20, { align: 'right' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Our Kids to the World Competition', pageWidth - 20, 30, { align: 'right' });

      // Ticket details section
      let yPos = 60;
      
      // Ticket number and QR code section
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TICKET DETAILS', 20, yPos);
      
      yPos += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Ticket Number: ${ticketData.ticket_number}`, 20, yPos);
      
      yPos += 8;
      pdf.text(`Tracking Number: ${ticketData.registration.tracking_number}`, 20, yPos);

      // Generate QR Code
      const qrCodeDataURL = await QRCode.toDataURL(ticketData.qr_code, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Add QR code to PDF
      pdf.addImage(qrCodeDataURL, 'PNG', pageWidth - 50, 50, 30, 30);

      // School information
      yPos += 20;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SCHOOL INFORMATION', 20, yPos);
      
      yPos += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`School Name: ${ticketData.registration.school_name}`, 20, yPos);
      
      yPos += 8;
      pdf.text(`Contact Person: ${ticketData.registration.contact_name}`, 20, yPos);
      
      yPos += 8;
      pdf.text(`Phone Number: ${ticketData.registration.contact_phone}`, 20, yPos);

      // Participants section
      yPos += 20;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`PARTICIPANTS (${ticketData.registration.participants.length})`, 20, yPos);
      
      yPos += 15;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      ticketData.registration.participants.forEach((participant, index) => {
        if (yPos > pageHeight - 40) {
          pdf.addPage();
          yPos = 30;
        }
        pdf.text(`${index + 1}. ${participant.name} - ${participant.class}`, 20, yPos);
        yPos += 7;
      });

      // Event details
      yPos += 15;
      if (yPos > pageHeight - 80) {
        pdf.addPage();
        yPos = 30;
      }

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EVENT DETAILS', 20, yPos);
      
      yPos += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Event: CHAF Competition - Our Kids to the World', 20, yPos);
      
      yPos += 8;
      pdf.text('Date: November 1st, 2025', 20, yPos);
      
      yPos += 8;
      pdf.text('Venue: To be announced', 20, yPos);
      
      yPos += 8;
      pdf.text('Time: To be announced', 20, yPos);

      // Payment information
      yPos += 20;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PAYMENT INFORMATION', 20, yPos);
      
      yPos += 15;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Amount: ₦${ticketData.registration.total_amount.toLocaleString()}`, 20, yPos);
      
      yPos += 8;
      pdf.text('Status: PAID', 20, yPos);

      // Footer with important notes
      yPos = pageHeight - 40;
      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, yPos - 5, pageWidth, 35, 'F');
      
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('IMPORTANT NOTES:', 20, yPos + 5);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text('• Present this ticket (printed or digital) at the event venue', 20, yPos + 12);
      pdf.text('• Arrive 30 minutes early for check-in and registration', 20, yPos + 18);
      pdf.text('• Keep your tracking number for reference and support', 20, yPos + 24);

      // Contact information from footer
      pdf.text('Contact: chafoundation2020@gmail.com | 07038814822', pageWidth - 20, yPos + 30, { align: 'right' });

      // Generate PDF blob
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      return pdfUrl;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate ticket PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadTicket = async (trackingNumber: string) => {
    try {
      setIsGenerating(true);

      // Generate ticket via edge function
      const { data, error } = await supabase.functions.invoke('generate-ticket', {
        body: { tracking_number: trackingNumber }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Failed to generate ticket');
      }

      // Generate PDF
      const pdfUrl = await generateTicketPDF(data.ticket);

      // Create download link
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `CHAF-Ticket-${trackingNumber}.pdf`;
      link.click();

      // Clean up URL
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);

      toast({
        title: "Ticket Downloaded",
        description: "Your event ticket has been downloaded successfully.",
      });

      return pdfUrl;
    } catch (error) {
      console.error('Download ticket error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download ticket",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    downloadTicket,
    generateTicketPDF,
    isGenerating
  };
};