import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventDetails from "@/components/EventDetails";
import IndividualRegistrationForm from "@/components/IndividualRegistrationForm";
import { useNavigate } from "react-router-dom";
import eventFlyer from "@/assets/event-flyer.jpg";
import { 
  UserPlus, 
  Search, 
  Trophy,
  Users,
  Star,
  CheckCircle,
  Calendar,
  MapPin,
  Clock,
  ArrowRight
} from "lucide-react";

const IndexSimplified = () => {
  const navigate = useNavigate();

  const handleTrackRegistration = () => {
    navigate('/track');
  };

  const scrollToRegister = () => {
    const element = document.getElementById('individual-register');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 overflow-hidden max-w-full">
        <div className="container mx-auto max-w-6xl overflow-x-hidden">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  CHAF Our Kids To The World
                </h1>
                <p className="text-xl text-muted-foreground">
                 Be Part Of A Story That Changes The Live Of Orphans
                </p>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-3 text-lg">
                  <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="font-semibold">November 1st, 2025</span>
                </div>
                <div className="flex items-center gap-3 text-lg">
                  <Clock className="h-6 w-6 text-primary flex-shrink-0" />
                  <span>09:00 AM</span>
                </div>
                <div className="flex items-center gap-3 text-lg">
                  <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
                  <span>Khalifa Isyaku Rabiu University (KHAIRUN), <br></br>Gadon Kaya, Kano State.</span>
                </div>
              </div>

              <div className="bg-primary/10 border-2 border-primary rounded-lg p-6">
                <p className="text-3xl font-bold text-primary text-center">
                  Registration Fee: ₦3,000 per person
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="group"
                  onClick={scrollToRegister}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Register as Participant
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleTrackRegistration}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Track Registration
                </Button>
              </div>
            </div>

            <div className="relative">
              <Card className="overflow-hidden shadow-2xl">
                <img 
                  src={eventFlyer} 
                  alt="CHAF Competition Event Flyer" 
                  className="w-full h-auto object-cover"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Event Information */}
      <EventDetails />

      {/* Individual Registration Section */}
      <section id="individual-register" className="py-20 px-4 overflow-hidden max-w-full">
        <div className="container mx-auto px-4 max-w-4xl overflow-x-hidden">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">Register for the Event</h2>
            <p className="text-xl text-muted-foreground">
              Fill in your details below to secure your spot at the competition
            </p>
          </div>
          
          <IndividualRegistrationForm />
        </div>
      </section>

      {/* Why Choose CHAF */}
      <section className="py-20 bg-gradient-to-b from-accent/20 to-background overflow-hidden max-w-full">
        <div className="container mx-auto px-4 max-w-6xl overflow-x-hidden">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">Why Choose CHAF Competition?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join participants from across Nigeria in this premier educational competition
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Excellence Recognition</h3>
              <p className="text-muted-foreground">
                Awards and certificates for outstanding performers
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Collaborative Learning</h3>
              <p className="text-muted-foreground">
                Foster teamwork and healthy competition
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Skill Development</h3>
              <p className="text-muted-foreground">
                Enhance critical thinking and communication skills
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Organization</h3>
              <p className="text-muted-foreground">
                Well-organized events with proper documentation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-primary-foreground overflow-hidden max-w-full">
        <div className="container mx-auto px-4 text-center max-w-6xl overflow-x-hidden">
          <h2 className="text-4xl font-bold mb-4">Ready to Showcase Your Talent?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Register today and seize the opportunity to shine in our exciting debate competition
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button 
              onClick={scrollToRegister}
              size="lg" 
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg"
            >
              Register Now
            </Button>
          </div>

          <p className="mt-8 text-sm opacity-75">
            Event Date: November 1st, 2025 • Registration Fee: ₦3,000 per person
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default IndexSimplified;
