import { MapPin, Navigation, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  const copyCoordinates = () => {
    const coordinates = `${latitude}, ${longitude}`;
    navigator.clipboard.writeText(coordinates).then(() => {
      toast({
        title: "Coordinates copied",
        description: "Location coordinates copied to clipboard",
      });
    });
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
              onClick={copyCoordinates}
              variant="default"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Coordinates
            </Button>
            
            <div className="text-xs text-muted-foreground mt-2">
              Use these coordinates in your preferred maps app
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};