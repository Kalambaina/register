import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, Clock, XCircle, Loader2, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import Header from "./Header";
import Footer from "./Footer";
import Certificate from "./Certificate";
import { useCertificate } from "@/hooks/useCertificate";

interface Registration {
  id: string;
  tracking_number: string;
  full_name: string;
  phone_number: string;
  email: string;
  gender: string;
  state: string;
  lga: string;
  payment_status: string;
  admin_verified: boolean;
  amount: number;
  created_at: string;
  individual_tickets?: Array<{
    checked_in: boolean;
    checked_in_at: string | null;
  }>;
}

interface IndividualDashboardProps {
  trackingNumber: string;
}

const IndividualDashboard = ({ trackingNumber }: IndividualDashboardProps) => {
  const { toast } = useToast();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const { isGenerating: isGeneratingCertificate, fetchCertificateData, generateCertificatePDF, generateCertificateImage } = useCertificate();
  const [certificateData, setCertificateData] = useState<any>(null);

  useEffect(() => {
    fetchRegistration();
  }, [trackingNumber]);

  const fetchRegistration = async () => {
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
      setRegistration(data);
    } catch (error) {
      console.error('Error fetching registration:', error);
      toast({
        title: "Error",
        description: "Failed to load registration details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateTicketPDF = async () => {
    if (!registration) return;

    setIsGeneratingTicket(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      });

      const qrCodeDataUrl = await QRCode.toDataURL(registration.tracking_number, { width: 200, margin: 2 });

      try {
        const logoImg = new Image();
        logoImg.src = '/chaf-logo.png';
        await new Promise((resolve) => { logoImg.onload = resolve; });
        pdf.addImage(logoImg, 'PNG', 10, 10, 30, 30);
      } catch (error) {
        console.log('Logo not found, continuing without logo');
      }

      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EVENT TICKET', 105, 20, { align: 'center' });

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('CHAF Our Kids To The World', 105, 30, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text('Date: November 1st, 2025', 105, 37, { align: 'center' });
      pdf.text('Time: 10:00 AM', 105, 43, { align: 'center' });
      pdf.text('Venue: Khalifa Isyaku Rabiu University (KHAIRUN), Kano State', 105, 49, { align: 'center' });

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Participant Information:', 15, 65);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${registration.full_name}`, 15, 72);
      pdf.text(`Gender: ${registration.gender}`, 15, 79);
      pdf.text(`State: ${registration.state}`, 15, 86);
      pdf.text(`LGA: ${registration.lga}`, 15, 93);
      pdf.text(`Phone: ${registration.phone_number}`, 15, 100);
      if (registration.email) pdf.text(`Email: ${registration.email}`, 15, 107);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Tracking #: ${registration.tracking_number}`, 105, 120, { align: 'center' });

      pdf.addImage(qrCodeDataUrl, 'PNG', 65, 130, 80, 80);

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('For inquiries: info@chaf.org | +234 123 456 7890', 105, 220, { align: 'center' });

      pdf.save(`CHAF-Ticket-${registration.tracking_number}.pdf`);

      toast({ title: "Success", description: "Your ticket has been downloaded successfully!" });
    } catch (error) {
      console.error('Error generating ticket:', error);
      toast({ title: "Error", description: "Failed to generate ticket. Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingTicket(false);
    }
  };

  const getStatusBadge = () => {
    if (!registration) return null;
    if (registration.admin_verified && registration.payment_status === 'paid') return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" />Verified & Paid</Badge>;
    if (registration.payment_status === 'awaiting_verification') return <Badge className="bg-yellow-500"><Clock className="w-4 h-4 mr-1" />Awaiting Verification</Badge>;
    if (registration.payment_status === 'pending') return <Badge variant="secondary"><Clock className="w-4 h-4 mr-1" />Payment Pending</Badge>;
    return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" />Payment Failed</Badge>;
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card><CardContent className="p-6 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" /><p>Loading registration details...</p></CardContent></Card>
      </div>
      <Footer />
    </div>
  );

  if (!registration) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card><CardContent className="p-6 text-center"><p className="text-destructive">Registration not found</p></CardContent></Card>
      </div>
      <Footer />
    </div>
  );

  const canDownloadTicket = registration.admin_verified && registration.payment_status === 'paid';
  const ticket = Array.isArray(registration.individual_tickets) ? registration.individual_tickets[0] : registration.individual_tickets;
  const isCheckedIn = ticket?.checked_in === true;

  const handleDownloadCertificatePDF = async () => {
    const data = await fetchCertificateData(trackingNumber);
    if (data) { setCertificateData(data); await new Promise(resolve => setTimeout(resolve, 1500)); if (certificateRef.current) await generateCertificatePDF(certificateRef.current, data.participantName, data.trackingNumber); }
  };

  const handleDownloadCertificateImage = async () => {
    const data = await fetchCertificateData(trackingNumber);
    if (data) { setCertificateData(data); await new Promise(resolve => setTimeout(resolve, 1500)); if (certificateRef.current) await generateCertificateImage(certificateRef.current, data.participantName, data.trackingNumber); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Your Registration</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Tracking Number: {registration.tracking_number}</p>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Full Name</p><p className="font-semibold">{registration.full_name}</p></div>
              <div><p className="text-sm text-muted-foreground">Gender</p><p className="font-semibold">{registration.gender}</p></div>
              <div><p className="text-sm text-muted-foreground">Phone Number</p><p className="font-semibold">{registration.phone_number}</p></div>
              {registration.email && <div><p className="text-sm text-muted-foreground">Email</p><p className="font-semibold">{registration.email}</p></div>}
              <div><p className="text-sm text-muted-foreground">State</p><p className="font-semibold">{registration.state}</p></div>
              <div><p className="text-sm text-muted-foreground">Local Government</p><p className="font-semibold">{registration.lga}</p></div>
              <div><p className="text-sm text-muted-foreground">Amount Paid</p><p className="font-semibold">₦{registration.amount.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">Registration Date</p><p className="font-semibold">{new Date(registration.created_at).toLocaleDateString()}</p></div>
            </div>

            {/* Ticket Download */}
            <div className="pt-6 border-t">
              {canDownloadTicket ? (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <Button onClick={generateTicketPDF} disabled={isGeneratingTicket} className="w-full md:w-auto">
                    {isGeneratingTicket ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Ticket...</> : <><Download className="mr-2 h-4 w-4" />Download Ticket</>}
                  </Button>
                  <p className="text-sm text-muted-foreground md:mt-0 mt-2">Download your event ticket as PDF to present at the venue.</p>
                </div>
              ) : (
                <Card className="bg-yellow-50 border-yellow-200"><CardContent className="pt-6"><h3 className="font-semibold mb-2 text-yellow-800">Payment Verification in Progress</h3><p className="text-sm text-yellow-700">Your payment is being verified by our admin team. This typically takes 15-30 minutes. Please check back later to download your ticket.</p></CardContent></Card>
              )}
            </div>

            {/* Certificate Section */}
            <div className="pt-6 border-t">
              <div className="flex items-center gap-3 mb-4"><Award className="w-6 h-6 text-primary" /><h3 className="font-semibold text-lg">Certificate of Participation</h3></div>
              {isCheckedIn && ticket?.checked_in_at ? (
                <Card className="bg-success/10 border-success/30">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <p className="font-medium text-success mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" />Certificate Available</p>
                        <p className="text-sm text-muted-foreground mb-1">You attended the event on {new Date(ticket.checked_in_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="text-xs text-muted-foreground">Download your professional certificate as PDF or image</p>
                      </div>
                      <div className="flex gap-2 flex-wrap md:flex-nowrap shrink-0">
                        <Button onClick={handleDownloadCertificatePDF} disabled={isGeneratingCertificate} variant="default">
                          {isGeneratingCertificate ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Download className="mr-2 h-4 w-4" />PDF</>}
                        </Button>
                        <Button onClick={handleDownloadCertificateImage} disabled={isGeneratingCertificate} variant="outline">
                          {isGeneratingCertificate ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Download className="mr-2 h-4 w-4" />Image</>}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/50 border-muted">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Certificate Not Yet Available</p>
                        <p className="text-sm text-muted-foreground">Certificates are only available for participants who have checked in at the event. Please visit the event and check in to receive your certificate.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Hidden Certificate for Generation */}
        {certificateData && (
          <div className="fixed top-0 left-0 opacity-0 pointer-events-none" style={{ zIndex: -1 }}>
            <Certificate
              ref={certificateRef}
              participantName={certificateData.participantName}
              trackingNumber={certificateData.trackingNumber}
              state={certificateData.state}
              lga={certificateData.lga}
              checkedInAt={certificateData.checkedInAt}
              gender={certificateData.gender}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default IndividualDashboard;
