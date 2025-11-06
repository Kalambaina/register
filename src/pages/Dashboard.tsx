import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SchoolDashboard from "@/components/SchoolDashboard";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    verifyAccess();
  }, [trackingNumber]);

  const verifyAccess = async () => {
    if (!trackingNumber) {
      setIsVerifying(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('payment_status')
        .eq('tracking_number', trackingNumber.toUpperCase())
        .single();

      if (error || !data) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(data.payment_status === 'paid');
      }
    } catch (error) {
      console.error('Access verification error:', error);
      setIsAuthorized(false);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!trackingNumber) {
    return <Navigate to="/" replace />;
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen overflow-x-hidden max-w-full">
        <div className="container mx-auto px-4 py-8 max-w-md overflow-x-hidden">
          <Card className="mx-auto">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Verifying access...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen overflow-x-hidden max-w-full">
        <div className="container mx-auto px-4 py-8 max-w-md overflow-x-hidden">
          <Card className="mx-auto">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">Payment Being Processed</h3>
              <p className="text-muted-foreground mb-4">
                Your payment is being verified. Please check back later using your tracking number.
              </p>
              <p className="text-sm text-muted-foreground">
                Verification may take 15-30 minutes after payment confirmation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <SchoolDashboard trackingNumber={trackingNumber} />;
};

export default Dashboard;