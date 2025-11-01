import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventSearchParams {
  city: string;
  category?: string;
  date?: string;
  offset?: number;
}

// Helper function to get approximate city coordinates
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

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { city, category, date, offset = 0 }: EventSearchParams = await req.json();
    
    console.log(`Fetching events for city: ${city}, category: ${category}, date: ${date}, offset: ${offset}`);
    
    if (!city) {
      throw new Error("City parameter is required");
    }

    const serpApiKey = Deno.env.get("SERPAPI_KEY");
    if (!serpApiKey) {
      console.error("SerpApi key not configured");
      throw new Error("SerpApi key not configured");
    }

    // Build SerpApi query parameters
    const params = new URLSearchParams({
      engine: "google_events",
      q: `events ${city}${category ? ` ${category}` : ''}`,
      hl: "en",
      gl: "in",
      api_key: serpApiKey,
    });

    if (date) {
      // Convert YYYY-MM-DD to a format SerpAPI expects
      const dateObj = new Date(date);
      const formattedDate = dateObj.toISOString().split('T')[0]; // Keep YYYY-MM-DD format
      params.append("start_date", formattedDate);
      params.append("end_date", formattedDate); // Also set end_date to search for specific day
    }

    if (!category) {
      params.append("num", "20");
    }

    // Add pagination support
    if (offset > 0) {
      params.append("start", offset.toString());
    }

    console.log(`SerpAPI URL: https://serpapi.com/search?${params}`);

    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data = await response.json();
    
    console.log(`SerpAPI Response status: ${response.status}`);
    console.log(`SerpAPI Response data:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("SerpAPI error:", data.error);
      throw new Error(data.error || "Failed to fetch events");
    }

    // Transform SerpApi response to our event format
    let events = (data.events_results || []).map((event: any) => {
      // Fix date parsing - handle cases where API returns wrong year
      let startDate = event.date?.start_date;
      if (startDate) {
        const parsedDate = new Date(startDate);
        // If the year is 2001 or any year before 2020, it's likely a parsing error
        if (parsedDate.getFullYear() < 2020) {
          // Set to current year with the same month and day
          const currentYear = new Date().getFullYear();
          parsedDate.setFullYear(currentYear);
          startDate = parsedDate.toISOString();
        } else {
          startDate = parsedDate.toISOString();
        }
      } else {
        startDate = new Date().toISOString();
      }

      let endDate = event.date?.end_date;
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (parsedEndDate.getFullYear() < 2020) {
          const currentYear = new Date().getFullYear();
          parsedEndDate.setFullYear(currentYear);
          endDate = parsedEndDate.toISOString();
        } else {
          endDate = parsedEndDate.toISOString();
        }
      }

      // Extract coordinates from Google Maps link if available
      let latitude = null;
      let longitude = null;
      
      if (event.event_location_map?.link) {
        const mapLink = event.event_location_map.link;
        // Extract coordinates from Google Maps URL patterns like: data=!4m2!3m1!1s0x390d1d1bfd29596f:0x3b01784733155eee
        const coordMatch = mapLink.match(/1s0x([a-f0-9]+):0x([a-f0-9]+)/);
        if (coordMatch) {
          // Convert hex coordinates back to decimal (approximate)
          // This is a simplified conversion - for production, you'd need a proper geocoding service
          // For now, let's use city-based default coordinates
          const cityCoords = getCityCoordinates(city);
          latitude = cityCoords.lat;
          longitude = cityCoords.lng;
        }
      }

      return {
        external_id: event.event_id || `serp_${Date.now()}_${Math.random()}`,
        name: event.title,
        description: event.description || event.snippet,
        start_date: startDate,
        end_date: endDate,
        city: city,
        venue: event.venue?.name,
        address: event.address?.[0] || event.venue?.address,
        latitude: latitude,
        longitude: longitude,
        category: category || "general",
        is_paid: event.ticket_info?.some((ticket: any) => ticket.price) || false,
        price_min: event.ticket_info?.length > 0 ? 
          Math.min(...event.ticket_info.map((t: any) => parseFloat(t.price?.replace(/[^\d.]/g, '')) * 100 || 0)) : null,
        price_max: event.ticket_info?.length > 0 ? 
          Math.max(...event.ticket_info.map((t: any) => parseFloat(t.price?.replace(/[^\d.]/g, '')) * 100 || 0)) : null,
        ticket_url: event.link,
        image_url: event.thumbnail,
        source: "api",
        approved: false,
        verified: false,
      };
    });

    // If user specified a date, filter events to only show events for that specific date
    if (date) {
      const requestedDate = new Date(date);
      const requestedDateString = requestedDate.toDateString();
      
      events = events.filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate.toDateString() === requestedDateString;
      });
      
      // If no events found for the specific date, return appropriate message
      if (events.length === 0) {
        const formattedDate = requestedDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
        
        return new Response(JSON.stringify({ 
          success: true, 
          events: [],
          message: `No events found in ${city} for ${formattedDate}. Try searching for a different date or remove the date filter to see all upcoming events.`,
          total: 0 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // If no events found and no specific date, provide fallback events
    if (events.length === 0 && !date) {
      console.log("No events found from SerpAPI, providing fallback events");
      
      const currentDate = new Date();
      const nextWeekend = new Date(currentDate);
      nextWeekend.setDate(currentDate.getDate() + (6 - currentDate.getDay() + 1) % 7 + 1); // Next Saturday
      
      events = [
        {
          external_id: `fallback_${city}_1`,
          name: `Weekend Markets in ${city}`,
          description: `Explore local weekend markets, street food, and artisan crafts in ${city}. Perfect for a leisurely Saturday morning.`,
          start_date: nextWeekend.toISOString(),
          end_date: null,
          city: city,
          venue: "Various Markets",
          address: `${city} City Center`,
          latitude: null,
          longitude: null,
          category: category || "market",
          is_paid: false,
          price_min: null,
          price_max: null,
          ticket_url: null,
          image_url: null,
          source: "fallback",
          approved: false,
          verified: false,
        },
        {
          external_id: `fallback_${city}_2`,
          name: `Cultural Events in ${city}`,
          description: `Discover traditional music, dance performances, and local cultural celebrations happening this weekend in ${city}.`,
          start_date: new Date(nextWeekend.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Sunday
          end_date: null,
          city: city,
          venue: "Cultural Centers",
          address: `${city} Cultural District`,
          latitude: null,
          longitude: null,
          category: category || "cultural",
          is_paid: true,
          price_min: 200,
          price_max: 500,
          ticket_url: null,
          image_url: null,
          source: "fallback",
          approved: false,
          verified: false,
        }
      ];
    }

    // Store events in database and get UUIDs
    const eventsToStore = events.map(event => ({
      external_id: event.external_id,
      name: event.name,
      description: event.description,
      start_date: event.start_date,
      end_date: event.end_date,
      city: event.city,
      venue: event.venue,
      address: event.address,
      latitude: event.latitude,
      longitude: event.longitude,
      category: event.category,
      is_paid: event.is_paid,
      price_min: event.price_min,
      price_max: event.price_max,
      ticket_url: event.ticket_url,
      image_url: event.image_url,
      source: event.source,
      approved: event.approved,
      verified: event.verified || false
    }));

    // Use upsert to avoid duplicates and get the stored events with UUIDs
    const { data: storedEvents, error: storeError } = await supabaseClient
      .from('events')
      .upsert(eventsToStore, { 
        onConflict: 'external_id',
        ignoreDuplicates: false 
      })
      .select();

    if (storeError) {
      console.error('Error storing events:', storeError);
      // Still return the events even if storage fails
    }

    const finalEvents = storedEvents || events;

    console.log(`Returning ${finalEvents.length} events for ${city}`);

    return new Response(JSON.stringify({ 
      success: true, 
      events: finalEvents,
      total: finalEvents.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in fetch-events:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});