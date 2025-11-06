import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign,
  Clock,
  CheckCircle,
  School,
  RefreshCw
} from "lucide-react";
import { useRegistration } from "@/hooks/useRegistration";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import IndividualPaymentModal from "@/components/IndividualPaymentModal";

interface Registration {
  id: string;
  tracking_number: string;
  school_name: string;
  contact_name: string;
  contact_phone: string;
  payment_method: string;
  comments: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  participants: Array<{
    name: string;
    class: string;
  }>;
}

const TrackingSection = () => {
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [recoveredTrackingNumbers, setRecoveredTrackingNumbers] = useState<string[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    tracking_number: string;
    amount: number;
  } | null>(null);
  const { getRegistrationByTracking } = useRegistration();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      return;
    }

    setIsSearching(true);
    setNotFound(false);
    setRegistration(null);

    try {
      // First try individual registrations
      const { data: individualData, error: individualError } = await supabase
        .from('individual_registrations')
        .select('*')
        .eq('tracking_number', trackingNumber.trim().toUpperCase())
        .maybeSingle();

      if (individualData) {
        // Handle different payment statuses
        if (individualData.payment_status === 'paid' && individualData.admin_verified) {
          window.location.href = `/individual-dashboard/${trackingNumber}`;
        } else if (individualData.payment_status === 'pending') {
          // Show payment modal for pending payments
          setPendingRegistration({
            tracking_number: individualData.tracking_number,
            amount: individualData.amount
          });
          setShowPaymentModal(true);
          toast({
            title: "Complete Your Payment",
            description: "Please complete your payment to proceed with verification.",
            variant: "default"
          });
        } else if (individualData.payment_status === 'awaiting_verification') {
          toast({
            title: "Payment Verification Pending",
            description: "Your registration is awaiting admin verification. Please check back later.",
            variant: "default"
          });
        }
        return;
      }

      // If not found in individual, try school registrations (old system)
      const result = await getRegistrationByTracking(trackingNumber.trim());
      
      if (result.success && result.data) {
        const regData = result.data as Registration;
        setRegistration(regData);
        
        // Auto-redirect to dashboard if payment is verified
        if (regData.payment_status === 'paid') {
          setTimeout(() => {
            window.location.href = `/dashboard/${regData.tracking_number}`;
          }, 1000);
        }
      } else {
        setNotFound(true);
      }
    } catch (error) {
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'unpaid': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const recoverTrackingNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to recover tracking number",
        variant: "destructive"
      });
      return;
    }

    setIsRecovering(true);
    setRecoveredTrackingNumbers([]);

    try {
      // Search in both individual and school registrations
      const [individualResult, schoolResult] = await Promise.all([
        supabase
          .from('individual_registrations')
          .select('tracking_number, full_name, created_at')
          .eq('phone_number', phoneNumber.trim())
          .order('created_at', { ascending: false }),
        supabase
          .from('registrations')
          .select('tracking_number, school_name, created_at')
          .eq('contact_phone', phoneNumber.trim())
          .order('created_at', { ascending: false })
      ]);

      const allRegistrations = [
        ...(individualResult.data || []).map(r => r.tracking_number),
        ...(schoolResult.data || []).map(r => r.tracking_number)
      ];

      if (allRegistrations.length > 0) {
        setRecoveredTrackingNumbers(allRegistrations);
        toast({
          title: "Tracking Numbers Found",
          description: `Found ${allRegistrations.length} registration(s) for this phone number`,
        });
      } else {
        toast({
          title: "No Registrations Found",
          description: "No registrations found for this phone number",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Recovery error:', error);
      toast({
        title: "Recovery Failed",
        description: "Failed to recover tracking numbers",
        variant: "destructive"
      });
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <section id="track" className="py-20 bg-gradient-to-b from-accent/20 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">Track Your Registration</h2>
            <p className="text-xl text-muted-foreground">
              Enter your tracking number to check your registration status and details.
            </p>
          </div>

          {/* Search and Recovery Forms */}
          <Card className="shadow-xl mb-8">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="flex items-center space-x-2 text-2xl text-primary">
                <Search className="w-6 h-6" />
                <span>Registration Lookup</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8">
              <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="search">Track by Number</TabsTrigger>
                  <TabsTrigger value="recover">Recover Number</TabsTrigger>
                </TabsList>
                
                <TabsContent value="search" className="space-y-6">
                  <form onSubmit={handleSearch} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="trackingNumber">Tracking Number</Label>
                      <div className="flex space-x-4">
                        <Input
                          id="trackingNumber"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Enter your tracking number (e.g., CHAF2025123456)"
                          className="flex-1"
                          disabled={isSearching}
                        />
                        <Button 
                          type="submit" 
                          disabled={isSearching || !trackingNumber.trim()}
                          className="px-8"
                        >
                          {isSearching ? "Searching..." : "Search"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="recover" className="space-y-6">
                  <form onSubmit={recoverTrackingNumber} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <div className="flex space-x-4">
                        <Input
                          id="phoneNumber"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter your registered phone number"
                          className="flex-1"
                          disabled={isRecovering}
                        />
                        <Button 
                          type="submit" 
                          disabled={isRecovering || !phoneNumber.trim()}
                          className="px-8"
                          variant="outline"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          {isRecovering ? "Recovering..." : "Recover"}
                        </Button>
                      </div>
                    </div>
                  </form>
                  
                  {/* Display recovered tracking numbers */}
                  {recoveredTrackingNumbers.length > 0 && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Recovered Tracking Numbers:</h4>
                      <div className="space-y-2">
                        {recoveredTrackingNumbers.map((number, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                            <span className="font-mono text-sm">{number}</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setTrackingNumber(number);
                                // Switch to search tab and auto search
                                const searchTab = document.querySelector('[value="search"]') as HTMLElement;
                                searchTab?.click();
                                setTimeout(() => {
                                  const form = document.querySelector('form') as HTMLFormElement;
                                  form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                                }, 100);
                              }}
                            >
                              Use This Number
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Registration Not Found */}
          {notFound && (
            <Card className="shadow-xl mb-8 border-red-200">
              <CardContent className="p-8 text-center">
                <div className="text-red-600 mb-4">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold">Registration Not Found</h3>
                  <p className="text-red-500 mt-2">
                    No registration found with tracking number "{trackingNumber}". 
                    Please check your tracking number and try again.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {registration && (
            <>
              {registration.payment_status === 'unpaid' && (
                <Card className="shadow-xl mb-8 border-blue-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <CardTitle className="text-2xl text-primary">Payment Verification</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 text-center">
                    <div className="mb-6">
                      <Clock className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                      <h3 className="text-xl font-semibold text-blue-800 mb-2">Payment Being Verified</h3>
                      <p className="text-blue-700 mb-4">
                        Your payment is currently being verified by our admin team. Please check back later or contact CHAF Foundation for assistance.
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                        <p className="text-sm text-blue-600 font-medium">What's Next?</p>
                        <ul className="text-sm text-blue-600 mt-2 space-y-1">
                          <li>• Our team will verify your bank transfer</li>
                          <li>• You'll receive confirmation once verified</li>
                          <li>• Your school dashboard will be unlocked</li>
                          <li>• You can then download event tickets</li>
                        </ul>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p><strong>Contact:</strong> chafoundation2020@gmail.com | +234 07038814822</p>
                        <p><strong>Tracking Number:</strong> {registration.tracking_number}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {registration.payment_status === 'paid' && (
                <Card className="shadow-xl mb-8 border-green-200">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                    <CardTitle className="text-2xl text-primary">Payment Verified ✓</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 text-center">
                    <div className="mb-6">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                      <h3 className="text-xl font-semibold text-green-800 mb-2">Redirecting to Dashboard...</h3>
                      <p className="text-green-700 mb-4">
                        Your payment has been verified! Redirecting to your school dashboard...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-primary">Registration Details</CardTitle>
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(registration.status)}>
                      {registration.status.toUpperCase()}
                    </Badge>
                    <Badge className={getPaymentStatusColor(registration.payment_status)}>
                      Payment: {registration.payment_status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* School Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-primary border-b border-border pb-2">
                      School Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">School Name</Label>
                        <p className="text-lg font-semibold">{registration.school_name}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Contact Person</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <p>{registration.contact_name}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <p>{registration.contact_phone}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Registration Date</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <p>{new Date(registration.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <p className="text-lg font-semibold">₦{registration.total_amount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Competition Details */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-primary border-b border-border pb-2">
                      Competition Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Package</Label>
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            CHAF Competition Package
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Bank Transfer
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Participants ({registration.participants.length})
                        </Label>
                        <div className="space-y-2 mt-2">
                          {registration.participants.map((participant, index) => (
                            <Card key={index} className="p-3 bg-accent/30">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{participant.name}</span>
                                <span className="text-sm text-muted-foreground">{participant.class}</span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {registration.comments && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Comments</Label>
                          <p className="mt-1 text-sm bg-accent/30 p-3 rounded">{registration.comments}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Status Actions */}
                {registration.payment_status === 'paid' && (
                  <div className="mt-8 pt-6 border-t border-border text-center">
                    <Button 
                      onClick={() => window.location.href = `/dashboard/${registration.tracking_number}`}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <School className="w-5 h-5 mr-2" />
                      Access Dashboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal for Pending Registrations */}
      {pendingRegistration && (
        <IndividualPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPendingRegistration(null);
          }}
          trackingNumber={pendingRegistration.tracking_number}
          amount={pendingRegistration.amount}
        />
      )}
    </section>
  );
};

export default TrackingSection;
