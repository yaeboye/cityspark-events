import { Users, Calendar, MapPin, Heart } from "lucide-react";

const stats = [
  {
    name: "Active Users",
    value: "10K+",
    description: "People discovering events daily",
    icon: Users,
  },
  {
    name: "Events Listed",
    value: "50K+",
    description: "Live events across India",
    icon: Calendar,
  },
  {
    name: "Cities Covered", 
    value: "20+",
    description: "Major cities and growing",
    icon: MapPin,
  },
  {
    name: "Events Attended",
    value: "100K+",
    description: "Through our platform",
    icon: Heart,
  },
];

export const StatsSection = () => {
  return (
    <section className="py-20 bg-gradient-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join our growing community of event enthusiasts across India
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center group"
            >
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-all duration-300">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold mb-2 text-white">
                {stat.value}
              </div>
              <div className="text-lg font-medium mb-1 text-white">
                {stat.name}
              </div>
              <div className="text-white/80">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};