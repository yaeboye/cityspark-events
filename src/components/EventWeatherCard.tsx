import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, Droplets } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WeatherData {
  eventDate?: {
    temperature: number;
    description: string;
    icon: string;
    precipitation: number;
  };
}

interface EventWeatherCardProps {
  city: string;
  eventDate: string;
  className?: string;
}

export const EventWeatherCard = ({ 
  city, 
  eventDate, 
  className = "" 
}: EventWeatherCardProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!city) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('get-weather', {
          body: {
            city,
            date: eventDate,
          }
        });

        if (error) throw error;

        if (data.success && data.weather.eventDate) {
          setWeather({ eventDate: data.weather.eventDate });
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city, eventDate]);

  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode?.charAt(0)) {
      case '0': return <Sun className="w-4 h-4 text-yellow-500" />;
      case '2': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case '3': return <CloudRain className="w-4 h-4 text-blue-400" />;
      case '5': return <CloudRain className="w-4 h-4 text-blue-600" />;
      case '8': return <Cloud className="w-4 h-4 text-muted-foreground" />;
      default: return <Sun className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <div className="animate-spin rounded-full h-3 w-3 border border-muted-foreground border-t-transparent"></div>
        <span>Loading weather...</span>
      </div>
    );
  }

  if (!weather?.eventDate) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {getWeatherIcon(weather.eventDate.icon)}
      <span className="font-medium">{weather.eventDate.temperature}°C</span>
      <span className="text-muted-foreground capitalize">{weather.eventDate.description}</span>
      {weather.eventDate.precipitation > 0 && (
        <div className="flex items-center gap-1 text-blue-600">
          <Droplets className="w-3 h-3" />
          <span className="text-xs">{weather.eventDate.precipitation}mm</span>
        </div>
      )}
    </div>
  );
};