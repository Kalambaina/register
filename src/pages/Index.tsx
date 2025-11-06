import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import EventDetails from "@/components/EventDetails";
import PricingSection from "@/components/PricingSection";
import RegistrationForm from "@/components/RegistrationForm";
import TrackingSection from "@/components/TrackingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TrackingSection />
      <HeroSection />
      <EventDetails />
      <PricingSection />
      <RegistrationForm />
      <Footer />
    </div>
  );
};

export default Index;
