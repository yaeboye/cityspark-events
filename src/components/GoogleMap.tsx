import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current).setView([latitude, longitude], 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker for the event location
    const marker = L.marker([latitude, longitude]).addTo(map);
    
    if (venue || address) {
      marker.bindPopup(`
        <div class="text-center">
          <h3 class="font-semibold">${venue || 'Event Location'}</h3>
          ${address ? `<p class="text-sm text-gray-600">${address}</p>` : ''}
        </div>
      `);
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, venue, address]);

  const openInMaps = () => {
    const destination = `${latitude},${longitude}`;
    const urls = [
      `https://maps.google.com/maps?q=${destination}`,
      `https://maps.apple.com/?q=${destination}`,
      `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`
    ];
    
    // Try to open Google Maps, fallback to others if needed
    window.open(urls[0], '_blank');
  };

  return (
    <div className="w-full h-full relative">
      <Card className="w-full h-full min-h-[400px] overflow-hidden">
        <div className="relative w-full h-full">
          <div ref={mapRef} className="w-full h-full min-h-[400px]" />
          
          {/* Map controls overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button 
              onClick={openInMaps}
              size="sm"
              variant="secondary"
              className="flex items-center gap-2 shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Maps
            </Button>
          </div>

          {/* Location info overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="p-3 bg-background/95 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">
                    {venue || "Event Location"}
                  </h3>
                  {address && (
                    <p className="text-xs text-muted-foreground">{address}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};