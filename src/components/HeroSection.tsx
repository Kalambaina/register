import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import eventFlyer from "@/assets/event-flyer.jpg";

const HeroSection = () => {
  const scrollToRegistration = () => {
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="py-20 bg-gradient-to-br from-background via-accent/30 to-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="text-primary">Our Kids</span>
                <br />
                <span className="text-secondary">to the World</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Showcasing the talents and brilliance of young learners through competitions, 
                performances, and educational excellence.
              </p>
            </div>
            
            {/* Event Details */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-foreground">
                <CalendarDays className="w-5 h-5 text-primary" />
                <span className="font-medium">November 1, 2025</span>
              </div>
              <div className="flex items-center space-x-3 text-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium">8:00 AM - 5:00 PM</span>
              </div>
              <div className="flex items-center space-x-3 text-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">Venue: To be confirmed</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-light text-primary-foreground px-8 py-3"
                onClick={scrollToRegistration}
              >
                Register Your School
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary text-primary hover:bg-primary/10 px-8 py-3"
              >
                Learn More
              </Button>
            </div>
          </div>
          
          {/* Event Flyer */}
          <div className="relative">
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <img 
                src={eventFlyer} 
                alt="Our Kids to the World Event Flyer" 
                className="w-full h-auto object-cover"
              />
            </Card>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-secondary/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;