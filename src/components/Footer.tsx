import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Linkedin, Heart } from "lucide-react";

export const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "#" },
    { name: "Events", href: "#events-section" },
    { name: "Cities", href: "#featured-cities" },
    { name: "About", href: "#" },
    { name: "Contact", href: "#" },
  ];

  const eventCategories = [
    { name: "Festivals", href: "#" },
    { name: "Concerts", href: "#" },
    { name: "Parties", href: "#" },
    { name: "Comedy Shows", href: "#" },
    { name: "Workshops", href: "#" },
  ];

  const cities = [
    { name: "Mumbai", href: "#" },
    { name: "Delhi", href: "#" },
    { name: "Bangalore", href: "#" },
    { name: "Chennai", href: "#" },
    { name: "Hyderabad", href: "#" },
  ];

  return (
    <footer className="bg-gray-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-primary">Weekend Walla</h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Discover amazing events and activities across India's vibrant cities. Your perfect weekend is just a search away.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-400">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">Mumbai, India</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">hello@weekendwalla.com</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Event Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Event Categories</h4>
            <ul className="space-y-3">
              {eventCategories.map((category) => (
                <li key={category.name}>
                  <a 
                    href={category.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities & Social */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Popular Cities</h4>
            <ul className="space-y-3 mb-6">
              {cities.map((city) => (
                <li key={city.name}>
                  <a 
                    href={city.href} 
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {city.name}
                  </a>
                </li>
              ))}
            </ul>
            
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
              >
                <Twitter className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
              >
                <Instagram className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
              >
                <Linkedin className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 flex items-center justify-center">
            © 2024 Weekend Walla. Made with{" "}
            <Heart className="w-4 h-4 mx-1 text-red-500 fill-current" />
            in India. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};