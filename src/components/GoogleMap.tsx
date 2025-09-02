import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  venue?: string;
  address?: string;
  zoom?: number;
}

export const GoogleMap = ({ 
  latitude, 
  longitude, 
  venue, 
  address 
}: GoogleMapProps) => {
  
  const handleOpenInMaps = () => {
    // Try different map applications in order of preference
    const urls = [
      `geo:${latitude},${longitude}`, // Native maps app
      `https://maps.apple.com/?q=${latitude},${longitude}`, // Apple Maps
      `https://www.bing.com/maps?q=${latitude},${longitude}`, // Bing Maps
    ];
    
    // Try to open the first available option
    window.open(urls[1], '_blank');
  };

  const handleGetDirections = () => {
    // Use universal geo protocol for directions
    const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
    window.location.href = geoUrl;
  };

  return (
    <div className="w-full h-full relative">
      <Card className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {venue || "Event Location"}
            </h3>
            {address && (
              <p className="text-sm text-muted-foreground">{address}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button 
              onClick={handleOpenInMaps}
              variant="default"
              className="flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              View Location
            </Button>
            
            <Button 
              onClick={handleGetDirections}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};