import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface IndividualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingNumber: string;
  amount: number;
}

const IndividualPaymentModal = ({
  isOpen,
  onClose,
  trackingNumber,
  amount
}: IndividualPaymentModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);

  const bankDetails = {
    bankName: "Sterling Bank",
    accountName: "Creating Happiness Foundation",
    accountNumber: "0094409632",
    amount: amount.toLocaleString()
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

    try {
      // Update payment status to awaiting verification
      const { error } = await supabase
        .from('individual_registrations')
        .update({ 
          payment_status: 'awaiting_verification'
        })
        .eq('tracking_number', trackingNumber);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Payment Confirmation Received",
        description: "Your payment will be verified by the admin. Please check back later using your tracking number.",
      });

      // Close modal and show success message
      onClose();
      
      // Optionally navigate to tracking page
      setTimeout(() => {
        navigate('/track');
      }, 2000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Instructions</DialogTitle>
          <DialogDescription>
            Complete your registration by making payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Summary */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration Fee:</span>
                <span className="font-semibold">₦{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracking Number:</span>
                <span className="font-mono text-sm font-semibold">{trackingNumber}</span>
              </div>
            </CardContent>
          </Card>

          {/* Bank Transfer Details */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Bank Transfer Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Name</p>
                    <p className="font-semibold">{bankDetails.bankName}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(bankDetails.bankName, "Bank name")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Name</p>
                    <p className="font-semibold">{bankDetails.accountName}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(bankDetails.accountName, "Account name")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Number</p>
                    <p className="font-semibold font-mono">{bankDetails.accountNumber}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "Account number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount to Transfer</p>
                    <p className="font-bold text-lg">₦{bankDetails.amount}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(amount.toString(), "Amount")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="border-orange-500/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 text-orange-600">Important Notes:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Please use your tracking number <strong>{trackingNumber}</strong> as reference when making payment</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>After payment, click "I've Made Payment" button below</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Payment verification may take 15-30 minutes</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>You can track your registration status using your tracking number</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handlePaymentConfirmed}
              disabled={isConfirming}
              className="w-full"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  I've Made Payment - Verify
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isConfirming}
              className="w-full"
            >
              Cancel Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IndividualPaymentModal;
