import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  Building2,
  Phone,
  Mail,
  Clock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface PaymentPageProps {
  trackingNumber: string;
  totalAmount: number;
  onMakePayment?: () => void;
  onNewRegistration?: () => void;
}

const PaymentPage = ({ trackingNumber, totalAmount, onMakePayment, onNewRegistration }: PaymentPageProps) => {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleMakePayment = () => {
    if (onMakePayment) {
      onMakePayment();
    } else {
      // Fallback behavior
      setShowSuccess(true);
    }
  };

  const handleNewRegistration = () => {
    if (onNewRegistration) {
      onNewRegistration();
    } else {
      // Fallback - redirect to home
      window.location.href = '/';
    }
  };

  if (showSuccess) {
    return (
      <section className="py-20 bg-gradient-to-b from-green-50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-green-200">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h2 className="text-2xl font-bold text-green-800 mb-4">Registration Complete!</h2>
                <p className="text-green-700 mb-6">
                  Your registration has been submitted successfully. Please proceed with payment to complete the process.
                </p>
                <Button onClick={handleNewRegistration} variant="outline">
                  Register Another School
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-4xl font-bold text-primary mb-4">Registration Successful!</h2>
            <p className="text-xl text-muted-foreground">
              Complete your payment to secure your school's participation
            </p>
          </div>

          {/* Registration Summary */}
          <Card className="shadow-xl mb-8 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-2xl text-primary">Registration Summary</CardTitle>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tracking Number</p>
                    <p className="text-2xl font-bold font-mono text-primary">{trackingNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Registration Status</p>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Pending Payment
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                    <p className="text-3xl font-bold text-blue-600">₦{totalAmount.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Bank Transfer
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">Important Payment Instructions</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Click "Make Payment" below to see bank transfer details</li>
                      <li>• Use your tracking number ({trackingNumber}) as reference</li>
                      <li>• Payment verification takes 15-30 minutes after transfer</li>
                      <li>• You'll receive dashboard access once payment is verified</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Action */}
          <Card className="shadow-xl mb-8">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="flex items-center space-x-2 text-2xl text-green-800">
                <Building2 className="w-6 h-6" />
                <span>Complete Payment</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Ready to Make Payment?</h3>
                  <p className="text-green-700 mb-6">
                    Click the button below to view our bank account details and complete your transfer
                  </p>
                  
                  <Button 
                    onClick={handleMakePayment}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay ₦{totalAmount.toLocaleString()}
                  </Button>
                </div>

                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>15-30 min verification</span>
                  </div>
                  <div>•</div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Secure bank transfer</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Need Help?</CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+234 07038814822</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">chafoundation2020@gmail.com</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Save your tracking number: <span className="font-mono font-medium">{trackingNumber}</span> for future reference
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center mt-8 space-y-4">
            <Button 
              onClick={handleNewRegistration}
              size="lg"
              variant="outline"
              className="mr-4"
            >
              Register Another School
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/track'}
              size="lg"
              variant="secondary"
            >
              Track Registration Status
            </Button>
          </div>

          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>Questions about payment? Contact us at chafoundation2020@gmail.com or call +234 7038814822</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentPage;
