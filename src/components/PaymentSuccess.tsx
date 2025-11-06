import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Ticket, School, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentSuccessProps {
  trackingNumber: string;
  totalAmount: number;
  ticketUrl?: string;
  onNewRegistration: () => void;
}

const PaymentSuccess = ({ trackingNumber, totalAmount, ticketUrl, onNewRegistration }: PaymentSuccessProps) => {
  const { toast } = useToast();
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false);

  const handleDownloadTicket = async () => {
    if (!ticketUrl) {
      setIsGeneratingTicket(true);
      // Simulate ticket generation
      setTimeout(() => {
        setIsGeneratingTicket(false);
        toast({
          title: "Ticket Generated",
          description: "Your event ticket has been generated and is ready for download.",
        });
      }, 2000);
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = ticketUrl;
      link.download = `CHAF-Ticket-${trackingNumber}.pdf`;
      link.click();
      
      toast({
        title: "Ticket Downloaded",
        description: "Your event ticket has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download ticket. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-green-50 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-4xl font-bold text-green-800 mb-4">Payment Successful!</h2>
            <p className="text-xl text-green-700">
              Your registration has been confirmed and your payment has been processed successfully.
            </p>
          </div>

          {/* Success Details */}
          <Card className="shadow-xl mb-8 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="flex items-center space-x-2 text-2xl text-green-800">
                <School className="w-6 h-6" />
                <span>Registration Confirmed</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tracking Number</p>
                    <p className="text-2xl font-bold font-mono text-primary">{trackingNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Paid Successfully
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                    <p className="text-2xl font-bold text-green-800">₦{totalAmount.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Registration Status</p>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      Confirmed
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Download */}
          <Card className="shadow-xl mb-8">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="flex items-center space-x-2 text-2xl text-primary">
                <Ticket className="w-6 h-6" />
                <span>Event Ticket</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <Ticket className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">Your Event Ticket is Ready!</h3>
                  <p className="text-blue-700 mb-4">
                    Download your official CHAF event ticket. You'll need this for entry to the competition venue.
                  </p>
                  
                  <Button 
                    onClick={handleDownloadTicket}
                    disabled={isGeneratingTicket}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isGeneratingTicket ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Ticket...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download Ticket
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>• Bring your ticket (printed or digital) to the event venue</p>
                  <p>• Keep your tracking number ({trackingNumber}) for reference</p>
                  <p>• Arrive 30 minutes early for check-in</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-primary">What's Next?</CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Download and Save Your Ticket</p>
                    <p className="text-sm text-muted-foreground">Keep your ticket safe - you'll need it for entry</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Prepare Your Students</p>
                    <p className="text-sm text-muted-foreground">Brief your participants about the competition format and rules</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Arrive Early on Event Day</p>
                    <p className="text-sm text-muted-foreground">Check-in opens 30 minutes before the competition starts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <Button 
              onClick={onNewRegistration}
              size="lg"
              variant="outline"
              className="mr-4"
            >
              Register Another School
            </Button>
            
            <Button 
              onClick={() => window.location.href = '#track'}
              size="lg"
              className="bg-primary hover:bg-primary-light text-primary-foreground"
            >
              Track Registration
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>Need help? Contact us at chafoundation2020@gmail.com or call +234 07038814822 </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSuccess;
