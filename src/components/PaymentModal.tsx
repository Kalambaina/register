import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CreditCard, Building, X, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  trackingNumber: string;
  onPaymentConfirmed: () => void;
}

const PaymentModal = ({ isOpen, onClose, totalAmount, trackingNumber, onPaymentConfirmed }: PaymentModalProps) => {
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);

  // Bank account details
  const bankDetails = {
    bankName: "Sterling Bank",
    accountName: "Creating Happiness and Assistance Foundation",
    accountNumber: "0094409632"
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handlePaymentConfirmed = async () => {
    setIsConfirming(true);
    
    // Show verification message instead of auto-approving
    try {
      toast({
        title: "Payment Submitted!",
        description: "Verifying your payment. Come back later to access your dashboard using your tracking number.",
        duration: 5000,
      });

      // Small delay for user to see the message
      setTimeout(() => {
        setIsConfirming(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Payment submission error:', error);
      toast({
        title: "Submission Error",
        description: "Please try again or contact support",
        variant: "destructive"
      });
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <CreditCard className="w-6 h-6" />
            <span>Complete Payment</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 w-full">
          {/* Payment Summary */}
          <Card className="border-primary/20 w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 w-full">
              <div className="flex justify-between items-center flex-wrap">
                <span className="text-muted-foreground">Registration Fee:</span>
                <span className="font-semibold text-lg">₦{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center flex-wrap">
                <span className="text-muted-foreground">Tracking Number:</span>
                <Badge variant="outline" className="font-mono">{trackingNumber}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="border-blue-200 bg-blue-50/30 w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg text-blue-800">
                <Building className="w-5 h-5" />
                <span>Bank Transfer Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 w-full">
              <div className="grid gap-4 w-full">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border w-full">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">Bank Name</p>
                    <p className="font-medium break-words">{bankDetails.bankName}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.bankName, "Bank Name")}
                    className="ml-2 flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-white rounded-lg border w-full">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">Account Name</p>
                    <p className="font-medium break-words">{bankDetails.accountName}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountName, "Account Name")}
                    className="ml-2 flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-white rounded-lg border w-full">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">Account Number</p>
                    <p className="font-medium font-mono text-lg break-all">{bankDetails.accountNumber}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "Account Number")}
                    className="ml-2 flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-white rounded-lg border w-full">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">Amount to Transfer</p>
                    <p className="font-bold text-xl text-green-700">₦{totalAmount.toLocaleString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(totalAmount.toString(), "Amount")}
                    className="ml-2 flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4 w-full">
                <h4 className="font-medium text-amber-800 mb-2">Important Notes:</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li className="break-words">• Use your tracking number ({trackingNumber}) as the transfer reference</li>
                  <li className="break-words">• Transfer the exact amount: ₦{totalAmount.toLocaleString()}</li>
                  <li>• Payment verification may take 15-30 minutes</li>
                  <li>• Keep your transfer receipt for reference</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4 w-full">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 w-full"
              disabled={isConfirming}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Payment
            </Button>
            
              <Button 
                onClick={handlePaymentConfirmed}
                disabled={isConfirming}
                className="flex-1 w-full bg-green-600 hover:bg-green-700"
              >
              {isConfirming ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I Have Made Payment
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground break-words w-full">
            By clicking "I Have Made Payment", you confirm that you have completed the bank transfer
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;