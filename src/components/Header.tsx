import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [logoClickCount, setLogoClickCount] = useState(0);

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 12) {
        // Reset count and navigate to admin
        setTimeout(() => setLogoClickCount(0), 1000);
        navigate('/admin');
        return 0;
      }
      // Reset count after 3 seconds if not reached 12
      setTimeout(() => setLogoClickCount(0), 3000);
      return newCount;
    });
  };

  const handleRegisterNow = () => {
    navigate('/register');
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50 w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Title */}
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={handleLogoClick}
            >
              <img
                src="https://events.xelorra.com.ng/chaf-logo.png"
                alt="CHAF Logo"
                className="w-12 h-12 object-contain rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-primary">CHAF</h1>
                <p className="text-xs text-muted-foreground">
                  Creating Happiness Foundation
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#home"
                className="text-foreground hover:text-primary transition-colors"
              >
                Home
              </a>
              <a
                href="#register"
                className="text-foreground hover:text-primary transition-colors"
              >
                Register
              </a>
              <a
                href="#contact"
                className="text-foreground hover:text-primary transition-colors"
              >
                Contact
              </a>
            </nav>

            {/* CTA Button */}
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary-light shrink-0"
              onClick={handleRegisterNow}
            >
              Register Now
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
