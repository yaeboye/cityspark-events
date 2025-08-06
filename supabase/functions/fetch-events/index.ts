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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, category, date }: EventSearchParams = await req.json();
    
    console.log(`Fetching events for city: ${city}, category: ${category}, date: ${date}`);
    
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
      params.append("start_date", date);
    }

    if (!category) {
      params.append("num", "20");
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
    let events = (data.events_results || []).map((event: any) => ({
      external_id: event.event_id || `serp_${Date.now()}_${Math.random()}`,
      name: event.title,
      description: event.description || event.snippet,
      start_date: event.date?.start_date ? new Date(event.date.start_date).toISOString() : new Date().toISOString(),
      end_date: event.date?.end_date ? new Date(event.date.end_date).toISOString() : null,
      city: city,
      venue: event.venue?.name,
      address: event.address?.[0] || event.venue?.address,
      latitude: event.venue?.gps_coordinates?.latitude,
      longitude: event.venue?.gps_coordinates?.longitude,
      category: category || "general",
      is_paid: event.ticket_info?.some((ticket: any) => ticket.price) || false,
      price_min: event.ticket_info?.length > 0 ? 
        Math.min(...event.ticket_info.map((t: any) => parseFloat(t.price?.replace(/[^\d.]/g, '')) * 100 || 0)) : null,
      price_max: event.ticket_info?.length > 0 ? 
        Math.max(...event.ticket_info.map((t: any) => parseFloat(t.price?.replace(/[^\d.]/g, '')) * 100 || 0)) : null,
      ticket_url: event.link,
      image_url: event.thumbnail,
      source: "api",
      approved: true,
    }));

    // If no events found, provide some fallback events for the city
    if (events.length === 0) {
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
          approved: true,
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
          approved: true,
        }
      ];
    }

    console.log(`Returning ${events.length} events for ${city}`);

    return new Response(JSON.stringify({ 
      success: true, 
      events: events,
      total: events.length 
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