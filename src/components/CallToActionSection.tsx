import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CallToActionSectionProps {
  onGetStarted: () => void;
}

export const CallToActionSection = ({ onGetStarted }: CallToActionSectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to discover amazing events?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of event enthusiasts and never miss out on the perfect weekend plans again.
        </p>
        <Button 
          size="lg"
          onClick={onGetStarted}
          className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-medium transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg group"
        >
          Start Exploring Events
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  );
};