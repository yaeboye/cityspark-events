import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroFestival from "@/assets/hero-festival.jpg";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="bg-gradient-hero text-white py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-white/90 text-sm">
              <Sparkles className="w-4 h-4 text-white" />
              Live Event Search Across India
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              We help you discover events that matter
            </h1>
            
            <p className="text-xl text-white/90 mb-8">
              Weekend Walla is your gateway to amazing events, festivals, and activities happening across India's vibrant cities.
            </p>
            
            <div className="flex space-x-4">
              <Button 
                size="lg"
                onClick={onGetStarted}
                className="bg-white text-primary hover:bg-gray-100 px-6 py-3 font-medium transition-all duration-200 hover:shadow-lg group"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border border-white text-white hover:bg-white hover:bg-opacity-10 px-6 py-3 font-medium transition-all duration-200 hover:shadow-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="relative bg-white rounded-lg shadow-xl p-6">
                <img 
                  src={heroFestival} 
                  alt="Event discovery" 
                  className="rounded-lg w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};