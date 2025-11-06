import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Star, Palette, MessageSquare } from "lucide-react";

const EventDetails = () => {
  const categories = [
    {
      icon: MessageSquare,
      title: "Debate",
      subtitle: "SS1 - SS3",
      description: "Intellectual discourse and critical thinking showcase",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Trophy,
      title: "Quiz Competition", 
      subtitle: "JS1 - JS3",
      description: "Test knowledge across various academic subjects",
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: Star,
      title: "Spelling Bee",
      subtitle: "Primary Classes",
      description: "Demonstrate mastery of English vocabulary and spelling",
      color: "bg-success/10 text-success"
    },
    {
      icon: Users,
      title: "Cultural Performance",
      subtitle: "JS1 - SS3", 
      description: "Celebrate diverse cultural heritage through performance",
      color: "bg-warning/10 text-warning"
    },
    {
      icon: Palette,
      title: "Art Work Showcase",
      subtitle: "Junior Classes",
      description: "Display creativity and artistic talents",
      color: "bg-primary/10 text-primary"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">Event Categories</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive competition showcases the diverse talents and academic excellence 
            of students across different age groups and skill areas.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.subtitle}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-primary">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Mission Statement */}
        <div className="mt-20">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl font-bold text-primary mb-6">Our Mission</h3>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                Creating Happiness Foundation (CHAF) is dedicated to nurturing young minds and 
                celebrating educational excellence. Through "Our Kids to the World," we provide 
                a platform for students to showcase their talents, build confidence, and inspire 
                one another to reach their full potential.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default EventDetails;