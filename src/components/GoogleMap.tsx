import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  venue?: string;
  address?: string;
  zoom?: number;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export const GoogleMap = ({ 
  latitude, 
  longitude, 
  venue, 
  address, 
  zoom = 15 
}: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      try {
        // Get API key from environment
        const apiKey = "AIzaSyCOlDOt1oYzvn7jJvj1_yU2V14mwXdYZGY"; // Using configured API key
        
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        
        script.onload = () => {
          setIsLoaded(true);
          initializeMap();
        };
        
        script.onerror = () => {
          toast({
            title: "Map loading failed",
            description: "Unable to load Google Maps. Please check your connection.",
            variant: "destructive",
          });
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        toast({
          title: "Map error",
          description: "Failed to initialize map",
          variant: "destructive",
        });
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          }
        ]
      });

      // Add marker for the event location
      const marker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: venue || "Event Location",
        animation: window.google.maps.Animation.DROP,
      });

      // Add info window with venue details
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">${venue || "Event Location"}</h3>
            ${address ? `<p style="margin: 0; color: #666; font-size: 14px;">${address}</p>` : ""}
            <div style="margin-top: 10px;">
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" 
                target="_blank" 
                rel="noopener noreferrer"
                style="color: #1976d2; text-decoration: none; font-size: 14px;"
              >
                Get Directions →
              </a>
            </div>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      // Open info window by default
      infoWindow.open(map, marker);
    };

    loadGoogleMaps();

    return () => {
      // Cleanup function
      const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      scripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [latitude, longitude, venue, address, zoom, toast]);

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: "300px" }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};