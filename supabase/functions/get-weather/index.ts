import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeatherParams {
  latitude?: number;
  longitude?: number;
  city?: string;
  date?: string;
}

// Helper function to get city coordinates
function getCityCoordinates(city: string): { lat: number; lng: number } {
  const coordinates: Record<string, { lat: number; lng: number }> = {
    'delhi': { lat: 28.6139, lng: 77.2090 },
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'bengaluru': { lat: 12.9716, lng: 77.5946 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    'lucknow': { lat: 26.8467, lng: 80.9462 },
    'kanpur': { lat: 26.4499, lng: 80.3319 },
    'nagpur': { lat: 21.1458, lng: 79.0882 },
    'indore': { lat: 22.7196, lng: 75.8577 },
    'thane': { lat: 19.2183, lng: 72.9781 },
    'bhopal': { lat: 23.2599, lng: 77.4126 },
    'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
    'pimpri': { lat: 18.6298, lng: 73.8000 },
    'patna': { lat: 25.5941, lng: 85.1376 },
    'vadodara': { lat: 22.3072, lng: 73.1812 },
    'ludhiana': { lat: 30.9010, lng: 75.8573 },
    'agra': { lat: 27.1767, lng: 78.0081 },
    'nashik': { lat: 19.9975, lng: 73.7898 },
    'faridabad': { lat: 28.4089, lng: 77.3178 },
    'meerut': { lat: 28.9845, lng: 77.7064 },
    'rajkot': { lat: 22.3039, lng: 70.8022 },
    'kalyan': { lat: 19.2437, lng: 73.1355 },
    'vasai': { lat: 19.4882, lng: 72.8058 },
    'varanasi': { lat: 25.3176, lng: 82.9739 },
    'srinagar': { lat: 34.0837, lng: 74.7973 },
    'aurangabad': { lat: 19.8762, lng: 75.3433 },
    'dhanbad': { lat: 23.7957, lng: 86.4304 },
    'amritsar': { lat: 31.6340, lng: 74.8723 },
    'navi mumbai': { lat: 19.0330, lng: 73.0297 },
    'allahabad': { lat: 25.4358, lng: 81.8463 },
    'prayagraj': { lat: 25.4358, lng: 81.8463 },
    'ranchi': { lat: 23.3441, lng: 85.3096 },
    'howrah': { lat: 22.5958, lng: 88.2636 },
    'coimbatore': { lat: 11.0168, lng: 76.9558 },
    'jabalpur': { lat: 23.1815, lng: 79.9864 },
    'gwalior': { lat: 26.2183, lng: 78.1828 },
    'vijayawada': { lat: 16.5062, lng: 80.6480 },
    'jodhpur': { lat: 26.2389, lng: 73.0243 },
    'madurai': { lat: 9.9252, lng: 78.1198 },
    'raipur': { lat: 21.2514, lng: 81.6296 },
    'kota': { lat: 25.2138, lng: 75.8648 },
    'chandigarh': { lat: 30.7333, lng: 76.7794 },
    'guwahati': { lat: 26.1445, lng: 91.7362 },
  };

  const cityKey = city.toLowerCase().trim();
  return coordinates[cityKey] || { lat: 28.6139, lng: 77.2090 }; // Default to Delhi
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, city, date }: WeatherParams = await req.json();

    let lat: number, lng: number;

    // Use coordinates if provided, otherwise get coordinates from city name
    if (latitude && longitude) {
      lat = latitude;
      lng = longitude;
    } else if (city) {
      const coords = getCityCoordinates(city);
      lat = coords.lat;
      lng = coords.lng;
    } else {
      throw new Error("Either coordinates (latitude, longitude) or city name is required");
    }

    const weatherApiKey = Deno.env.get("OPENWEATHERMAP_KEY");
    if (!weatherApiKey) {
      throw new Error("OpenWeatherMap API key not configured");
    }

    // Get current weather
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${weatherApiKey}&units=metric`;
    const currentResponse = await fetch(currentWeatherUrl);
    const currentData = await currentResponse.json();

    if (!currentResponse.ok) {
      throw new Error(currentData.message || "Failed to fetch current weather");
    }

    // Get 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${weatherApiKey}&units=metric`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    if (!forecastResponse.ok) {
      throw new Error(forecastData.message || "Failed to fetch weather forecast");
    }

    // Find forecast for the specific event date
    let eventDateForecast = null;
    if (date) {
      const eventDate = new Date(date);
      const eventDateString = eventDate.toISOString().split('T')[0];
      
      eventDateForecast = forecastData.list.find((item: any) => {
        const forecastDate = new Date(item.dt * 1000).toISOString().split('T')[0];
        return forecastDate === eventDateString;
      });
    }

    // Format response
    const weatherInfo = {
      current: {
        temperature: Math.round(currentData.main.temp),
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        feelsLike: Math.round(currentData.main.feels_like),
      },
      eventDate: eventDateForecast ? {
        date: date,
        temperature: Math.round(eventDateForecast.main.temp),
        description: eventDateForecast.weather[0].description,
        icon: eventDateForecast.weather[0].icon,
        humidity: eventDateForecast.main.humidity,
        windSpeed: eventDateForecast.wind.speed,
        feelsLike: Math.round(eventDateForecast.main.feels_like),
        precipitation: eventDateForecast.rain ? eventDateForecast.rain['3h'] || 0 : 0,
      } : null,
      forecast: forecastData.list.slice(0, 8).map((item: any) => ({
        date: new Date(item.dt * 1000).toISOString(),
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        precipitation: item.rain ? item.rain['3h'] || 0 : 0,
      })),
      location: {
        city: currentData.name,
        country: currentData.sys.country,
        coordinates: {
          latitude: currentData.coord.lat,
          longitude: currentData.coord.lon,
        }
      }
    };

    return new Response(JSON.stringify({
      success: true,
      weather: weatherInfo,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in get-weather:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});