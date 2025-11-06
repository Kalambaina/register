import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TrackingSection from "@/components/TrackingSection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Tracking = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

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
        
        <TrackingSection />
      </div>
      <Footer />
    </div>
  );
};

export default Tracking;