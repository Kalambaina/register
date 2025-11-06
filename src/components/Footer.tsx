import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* CHAF Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {/* Logo instead of background icon */}
              <img
                src="/chaf-logo.png"
                alt="CHAF Logo"
                className="w-12 h-12 rounded-lg object-contain bg-white/10 p-1"
              />
              <div>
                <h3 className="font-bold text-xl">CHAF</h3>
                <p className="text-primary-foreground/80 text-sm">
                  Creating Happiness Foundation
                </p>
              </div>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              Dedicated to nurturing young minds and celebrating educational
              excellence through innovative competitions and performances.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#home"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#register"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Register
                </a>
              </li>
              <li>
                <a
                  href="#categories"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/80 text-sm">
                  chafoundation2020@gmail.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/80 text-sm">
                  07038814822
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/80 text-sm">
                  No C4, STMY Plaza Titin Rafin Dan Nana, Kano, Nigeria
                </span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center hover:bg-secondary-light transition-colors"
              >
                <Facebook className="w-5 h-5 text-secondary-foreground" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center hover:bg-secondary-light transition-colors"
              >
                <Twitter className="w-5 h-5 text-secondary-foreground" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center hover:bg-secondary-light transition-colors"
              >
                <Instagram className="w-5 h-5 text-secondary-foreground" />
              </a>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Stay updated with our latest events and educational initiatives.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-primary-foreground/80 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Creating Happiness Foundation (CHAF). All rights reserved. <br />
              Powered by{" "}
              <a
                href="https://www.xelorra.com.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                Xelorra Tech Industry (XTI)
              </a>
            </p>
       
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
