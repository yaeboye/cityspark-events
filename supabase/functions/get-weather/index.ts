import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeatherParams {
  latitude: number;
  longitude: number;
  date: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, date }: WeatherParams = await req.json();

    if (!latitude || !longitude) {
      throw new Error("Latitude and longitude are required");
    }

    const weatherApiKey = Deno.env.get("OPENWEATHERMAP_KEY");
    if (!weatherApiKey) {
      throw new Error("OpenWeatherMap API key not configured");
    }

    // Get current weather
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`;
    const currentResponse = await fetch(currentWeatherUrl);
    const currentData = await currentResponse.json();

    if (!currentResponse.ok) {
      throw new Error(currentData.message || "Failed to fetch current weather");
    }

    // Get 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`;
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