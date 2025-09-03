import { Search, MapPin, Bell, Calendar, Globe, Shield } from "lucide-react";

const features = [
  {
    name: "Live Event Search",
    description: "Search real-time events across India's major cities with our live data feeds.",
    icon: Search,
  },
  {
    name: "Location-Based Discovery",
    description: "Find events near you with intelligent location-based recommendations.",
    icon: MapPin,
  },
  {
    name: "Smart Notifications",
    description: "Get notified about events you love with our intelligent matching system.",
    icon: Bell,
  },
  {
    name: "Advanced Filters",
    description: "Filter by date, category, price, and more to find exactly what you're looking for.",
    icon: Calendar,
  },
  {
    name: "Multi-City Coverage",
    description: "Covering 20+ major cities across India with more being added regularly.",
    icon: Globe,
  },
  {
    name: "Secure & Private",
    description: "Your data is secure with us. We prioritize your privacy and security.",
    icon: Shield,
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Why Choose Weekend Walla
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We offer comprehensive event discovery solutions to help you find the perfect weekend activities
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.name}
              className="bg-card rounded-xl p-8 transition-all duration-300 hover:-translate-y-1 border border-border/50 hover:shadow-card-hover group"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <feature.icon className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.name}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};