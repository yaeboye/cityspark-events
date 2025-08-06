import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-events.jpg";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 text-white/90 text-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          Live Event Search Across India
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          <span className="bg-gradient-sunset bg-clip-text text-transparent">
            Weekend Walla
          </span>
          <span className="block text-4xl md:text-6xl mt-2">
            Find Your Perfect Weekend
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Discover real events, festivals, and activities happening across India's vibrant cities every weekend
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-gradient-primary text-primary-foreground hover:shadow-primary text-lg px-8 py-6 group"
            onClick={onGetStarted}
          >
            Explore Events
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 text-lg px-8 py-6"
          >
            How It Works
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">50K+</div>
            <div className="text-white/80">Events Listed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary">20+</div>
            <div className="text-white/80">Cities Covered</div>
          </div>
        </div>
      </div>
    </div>
  );
};