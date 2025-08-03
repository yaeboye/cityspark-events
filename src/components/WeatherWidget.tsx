import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WeatherData {
  current: {
    temperature: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    feelsLike: number;
  };
  eventDate?: {
    date: string;
    temperature: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    feelsLike: number;
    precipitation: number;
  };
  forecast: Array<{
    date: string;
    temperature: number;
    description: string;
    icon: string;
    precipitation: number;
  }>;
  location?: {
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  eventDate?: string;
  className?: string;
}

export const WeatherWidget = ({ 
  latitude, 
  longitude, 
  eventDate, 
  className = "" 
}: WeatherWidgetProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-weather', {
          body: {
            latitude,
            longitude,
            date: eventDate,
          }
        });

        if (error) throw error;

        if (data.success) {
          setWeather(data.weather);
        } else {
          throw new Error(data.error || 'Failed to fetch weather');
        }
      } catch (error: any) {
        console.error('Weather fetch error:', error);
        toast({
          title: "Weather unavailable",
          description: "Unable to fetch weather data for this location",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (latitude && longitude) {
      fetchWeather();
    }
  }, [latitude, longitude, eventDate, toast]);

  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode?.charAt(0)) {
      case '0': return <Sun className="w-8 h-8 text-yellow-500" />;
      case '2': return <CloudRain className="w-8 h-8 text-blue-500" />;
      case '3': return <CloudRain className="w-8 h-8 text-blue-400" />;
      case '5': return <CloudRain className="w-8 h-8 text-blue-600" />;
      case '8': return <Cloud className="w-8 h-8 text-gray-500" />;
      default: return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <Card className={`${className} animate-fade-in`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className={`${className} animate-fade-in`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Weather data unavailable for this location
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} animate-fade-in`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Weather Forecast
        </CardTitle>
        <CardDescription>
          {weather.location?.city && `Current conditions in ${weather.location.city}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Date Weather */}
        {weather.eventDate && (
          <div className="bg-gradient-card rounded-lg p-4 border border-border/50">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">
              Event Day Weather
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getWeatherIcon(weather.eventDate.icon)}
                <div>
                  <div className="text-2xl font-bold">
                    {weather.eventDate.temperature}°C
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {weather.eventDate.description}
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center gap-1 text-sm">
                  <Thermometer className="w-4 h-4" />
                  Feels like {weather.eventDate.feelsLike}°C
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Droplets className="w-4 h-4" />
                  {weather.eventDate.humidity}% humidity
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Wind className="w-4 h-4" />
                  {weather.eventDate.windSpeed} m/s
                </div>
              </div>
            </div>
            {weather.eventDate.precipitation > 0 && (
              <Badge variant="secondary" className="mt-2">
                {weather.eventDate.precipitation}mm rain expected
              </Badge>
            )}
          </div>
        )}

        {/* Current Weather */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground">
            Current Weather
          </h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weather.current.icon)}
              <div>
                <div className="text-xl font-bold">
                  {weather.current.temperature}°C
                </div>
                <div className="text-sm text-muted-foreground capitalize">
                  {weather.current.description}
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-1 text-sm">
                <Thermometer className="w-4 h-4" />
                Feels like {weather.current.feelsLike}°C
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Droplets className="w-4 h-4" />
                {weather.current.humidity}% humidity
              </div>
            </div>
          </div>
        </div>

        {/* 3-Day Forecast */}
        {weather.forecast.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">
              3-Day Forecast
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {weather.forecast.slice(0, 3).map((day, index) => (
                <div 
                  key={index} 
                  className="text-center p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {new Date(day.date).toLocaleDateString('en-IN', { 
                      weekday: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex justify-center mb-1">
                    {getWeatherIcon(day.icon)}
                  </div>
                  <div className="text-sm font-medium">
                    {day.temperature}°C
                  </div>
                  {day.precipitation > 0 && (
                    <div className="text-xs text-blue-600">
                      {day.precipitation}mm
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};