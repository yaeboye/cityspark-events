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
    
    if (!city) {
      throw new Error("City parameter is required");
    }

    const serpApiKey = Deno.env.get("SERPAPI_KEY");
    if (!serpApiKey) {
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

    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch events");
    }

    // Transform SerpApi response to our event format
    const events = (data.events_results || []).map((event: any) => ({
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

    // Store events in Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert events (on conflict, update the existing record)
    const { data: insertedEvents, error: insertError } = await supabase
      .from("events")
      .upsert(events, { 
        onConflict: "external_id",
        ignoreDuplicates: false 
      })
      .select();

    if (insertError) {
      console.error("Error inserting events:", insertError);
      // Continue with API response even if DB insert fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      events: insertedEvents || events,
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