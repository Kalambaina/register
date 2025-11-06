import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TicketDetails {
  id: string;
  ticket_number: string;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  registration: {
    full_name: string;
    phone_number: string;
    email: string | null;
    gender: string;
    state: string;
    lga: string;
    payment_status: string;
    admin_verified: boolean;
  };
}

const TicketValidation = () => {
  const { ticketNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (ticketNumber) {
      fetchTicketDetails();
    }
  }, [ticketNumber]);

  // Countdown timer effect
  useEffect(() => {
    if (redirectCountdown === null || redirectCountdown <= 0) return;

    if (redirectCountdown === 0) {
      navigate('/admin', { replace: true, state: { openScanner: true } });
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown(redirectCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown, navigate]);

  const fetchTicketDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First try to find an existing ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('individual_tickets')
        .select(`
          id,
          ticket_number,
          checked_in,
          checked_in_at,
          checked_in_by,
          registration_id,
          individual_registrations (
            full_name,
            phone_number,
            email,
            gender,
            state,
            lga,
            payment_status,
            admin_verified
          )
        `)
        .eq('ticket_number', ticketNumber)
        .maybeSingle();

      if (ticketData && ticketData.individual_registrations) {
        setTicket({
          id: ticketData.id,
          ticket_number: ticketData.ticket_number,
          checked_in: ticketData.checked_in,
          checked_in_at: ticketData.checked_in_at,
          checked_in_by: ticketData.checked_in_by,
          registration: ticketData.individual_registrations as any
        });
        return;
      }

      // If no ticket found, try to find registration by tracking number
      const { data: regData, error: regError } = await supabase
        .from('individual_registrations')
        .select('*')
        .eq('tracking_number', ticketNumber)
        .maybeSingle();

      if (regError) throw regError;

      if (!regData) {
        setError('Ticket not found. This ticket may not exist in our system.');
        return;
      }

      // Check if ticket already exists for this registration
      const { data: existingTicket } = await supabase
        .from('individual_tickets')
        .select('*')
        .eq('registration_id', regData.id)
        .maybeSingle();

      if (existingTicket) {
        // Use the existing ticket
        setTicket({
          id: existingTicket.id,
          ticket_number: existingTicket.ticket_number,
          checked_in: existingTicket.checked_in,
          checked_in_at: existingTicket.checked_in_at,
          checked_in_by: existingTicket.checked_in_by,
          registration: {
            full_name: regData.full_name,
            phone_number: regData.phone_number,
            email: regData.email,
            gender: regData.gender,
            state: regData.state,
            lga: regData.lga,
            payment_status: regData.payment_status,
            admin_verified: regData.admin_verified
          }
        });
      } else {
        // Create a new ticket for this registration
        const { data: newTicket, error: createError } = await supabase
          .from('individual_tickets')
          .insert({
            ticket_number: ticketNumber,
            registration_id: regData.id,
            qr_code: ticketNumber,
            checked_in: false
          })
          .select()
          .single();

        if (createError) throw createError;

        setTicket({
          id: newTicket.id,
          ticket_number: newTicket.ticket_number,
          checked_in: false,
          checked_in_at: null,
          checked_in_by: null,
          registration: {
            full_name: regData.full_name,
            phone_number: regData.phone_number,
            email: regData.email,
            gender: regData.gender,
            state: regData.state,
            lga: regData.lga,
            payment_status: regData.payment_status,
            admin_verified: regData.admin_verified
          }
        });
      }

    } catch (error) {
      console.error('Error fetching ticket:', error);
      setError('Failed to load ticket details. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load ticket details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!ticket) return;

    if (ticket.checked_in) {
      toast({
        title: "Already Checked In",
        description: `This ticket was already checked in on ${new Date(ticket.checked_in_at!).toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    if (!ticket.registration.admin_verified || ticket.registration.payment_status !== 'paid') {
      toast({
        title: "Invalid Ticket",
        description: "This ticket's payment has not been verified yet.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsChecking(true);

      const { error } = await supabase
        .from('individual_tickets')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
          checked_in_by: 'admin' // You can update this to track specific admin users
        })
        .eq('id', ticket.id);

      if (error) throw error;

      toast({
        title: "Check-In Successful",
        description: `${ticket.registration.full_name} has been checked in!`,
      });

      // Refresh ticket details
      await fetchTicketDetails();
      
      // Start countdown for auto-redirect
      setRedirectCountdown(5);

    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: "Check-In Failed",
        description: "Failed to check in ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading ticket details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error || 'Ticket not found'}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/admin', { replace: true })} 
              className="w-full mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Countdown Banner */}
        {redirectCountdown !== null && redirectCountdown > 0 && (
          <div className="mb-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Check-in Successful!</p>
                  <p className="text-sm text-green-700">
                    Redirecting to scanner in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/admin', { replace: true, state: { openScanner: true } })}
                variant="outline"
                size="sm"
                className="border-green-600 text-green-600 hover:bg-green-100"
              >
                Skip Wait
              </Button>
            </div>
          </div>
        )}

        <Button 
          onClick={() => navigate('/admin', { replace: true })} 
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ticket Validation</span>
              {ticket.checked_in ? (
                <Badge className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Checked In
                </Badge>
              ) : ticket.registration.admin_verified && ticket.registration.payment_status === 'paid' ? (
                <Badge className="bg-blue-500">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Verified
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Check-in Alert */}
            {ticket.checked_in && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>This ticket has already been checked in!</strong>
                  <br />
                  Check-in time: {new Date(ticket.checked_in_at!).toLocaleString()}
                </AlertDescription>
              </Alert>
            )}

            {/* Ticket Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">Ticket Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Ticket Number</p>
                  <p className="font-mono font-semibold">{ticket.ticket_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Status</p>
                  <Badge variant={ticket.registration.admin_verified ? "default" : "secondary"}>
                    {ticket.registration.admin_verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Participant Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">Participant Information</h3>
              <div className="grid gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Full Name</p>
                  <p className="font-semibold text-lg">{ticket.registration.full_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{ticket.registration.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{ticket.registration.gender}</p>
                  </div>
                </div>
                {ticket.registration.email && (
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{ticket.registration.email}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground">State</p>
                    <p className="font-medium">{ticket.registration.state}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">LGA</p>
                    <p className="font-medium">{ticket.registration.lga}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Check-in Information */}
            {ticket.checked_in && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">Check-in Details</h3>
                <div className="grid gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Checked in at</p>
                    <p className="font-medium">{new Date(ticket.checked_in_at!).toLocaleString()}</p>
                  </div>
                  {ticket.checked_in_by && (
                    <div>
                      <p className="text-muted-foreground">Checked in by</p>
                      <p className="font-medium">{ticket.checked_in_by}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!ticket.checked_in && (
              <Button
                onClick={handleCheckIn}
                disabled={isChecking || !ticket.registration.admin_verified || ticket.registration.payment_status !== 'paid'}
                className="w-full"
                size="lg"
              >
                <UserCheck className="w-5 h-5 mr-2" />
                {isChecking ? 'Checking In...' : 'Check In Participant'}
              </Button>
            )}

            {!ticket.registration.admin_verified && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This ticket cannot be checked in because the payment has not been verified by an admin yet.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketValidation;
