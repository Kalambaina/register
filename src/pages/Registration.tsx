import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RegistrationForm from "@/components/RegistrationForm";
import PaymentPage from "@/components/PaymentPage";
import PaymentModal from "@/components/PaymentModal";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface RegistrationData {
  trackingNumber: string;
  totalAmount: number;
  registrationId: string;
}

const Registration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'form' | 'payment' | 'dashboard'>('form');
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleRegistrationComplete = (data: RegistrationData) => {
    setRegistrationData(data);
    setCurrentStep('payment');
  };

  const handleMakePayment = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentConfirmed = () => {
    // Redirect to dashboard immediately (simulating payment verification)
    if (registrationData?.trackingNumber) {
      // In real app, this would check payment status from server
      // For now, we'll redirect to dashboard
      navigate(`/dashboard/${registrationData.trackingNumber}`);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleNewRegistration = () => {
    setCurrentStep('form');
    setRegistrationData(null);
  };

  if (currentStep === 'form') {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl overflow-x-hidden">
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <RegistrationForm onRegistrationComplete={handleRegistrationComplete} />
        </div>
        <Footer />
      </div>
    );
  }

  if (currentStep === 'payment' && registrationData) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl overflow-x-hidden">
          <Button 
            variant="ghost" 
            onClick={handleNewRegistration}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Registration
          </Button>
          
          <PaymentPage 
            trackingNumber={registrationData.trackingNumber}
            totalAmount={registrationData.totalAmount}
            onMakePayment={handleMakePayment}
            onNewRegistration={handleNewRegistration}
          />

          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            totalAmount={registrationData.totalAmount}
            trackingNumber={registrationData.trackingNumber}
            onPaymentConfirmed={handlePaymentConfirmed}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return null;
};

export default Registration;