import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Trophy, Users, Award } from "lucide-react";

const PricingSection = () => {
  const scrollToRegistration = () => {
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
  };

  const categories = [
    {
      name: "Debate",
      price: "₦100,000",
      maxParticipants: 3,
      icon: Trophy,
      features: [
        "Maximum 3 participants per school",
        "8 event tickets included (3 students + 2 teachers + 3 visitors)",
        "Event materials and resources",
        "Participation certificates for school and pupils",
        "Award for category winners",
        "Refreshments during the event",
        "Official event documentation",
        "Photo and video coverage"
      ]
    },
    {
      name: "Quiz",
      price: "₦100,000",
      maxParticipants: 2,
      icon: Award,
      features: [
        "Maximum 2 participants per school",
        "8 event tickets included (2 students + 2 teachers + 4 visitors)",
        "Event materials and resources",
        "Participation certificates for school and pupils",
        "Award for category winners",
        "Refreshments during the event",
        "Official event documentation",
        "Photo and video coverage"
      ]
    },
    {
      name: "Spelling Bee",
      price: "₦100,000",
      maxParticipants: 2,
      icon: Users,
      features: [
        "Maximum 2 participants per school",
        "8 event tickets included (2 students + 2 teachers + 4 visitors)",
        "Event materials and resources",
        "Participation certificates for school and pupils",
        "Award for category winners",
        "Refreshments during the event",
        "Official event documentation",
        "Photo and video coverage"
      ]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-accent/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">
            Competition Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Choose one or multiple competition categories for your school. Each category costs ₦100,000 and includes comprehensive benefits.
          </p>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg max-w-2xl mx-auto">
            <p className="text-lg font-semibold text-primary">
              Schools can register for multiple categories
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Total fee = ₦100,000 × number of selected categories
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.name}
                className="relative hover:shadow-xl transition-all duration-300 ring-1 ring-primary/20"
              >
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground px-4 py-1">
                  <Star className="w-4 h-4 mr-1" />
                  Popular
                </Badge>

                <CardHeader className="text-center pb-8">
                  <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-primary mb-2">
                    {category.name}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">
                      {category.price}
                    </span>
                    <span className="text-muted-foreground ml-2">per category</span>
                  </div>
                  <p className="text-primary font-semibold">
                    Max {category.maxParticipants} participants
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {category.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button
            className="py-3 px-8 bg-primary hover:bg-primary-light text-primary-foreground text-lg"
            onClick={scrollToRegistration}
          >
            Start Registration
          </Button>
          <p className="text-muted-foreground mt-4">
            Need help with registration?{" "}
            <a href="#contact" className="text-primary hover:underline">
              Contact us
            </a>{" "}
            for assistance.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;