import { useState, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { SearchBar } from "@/components/SearchBar";
import { EventCard } from "@/components/EventCard";
import { EventModal } from "@/components/EventModal";
import { AuthForms } from "@/components/auth/AuthForms";
import { NavigationHeader } from "@/components/NavigationHeader";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { StatsSection } from "@/components/StatsSection";
import { CallToActionSection } from "@/components/CallToActionSection";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music2, PartyPopper, Mic2, Briefcase, Sparkles, MapPin, Star } from "lucide-react";

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  city: string;
  venue: string;
  isPaid: boolean;
  price?: string;
  category: string;
  ticket_url?: string;
  verified?: boolean;
  image?: string;
  latitude?: number;
  longitude?: number;
}

interface SearchFilters {
  city: string;
  date: string;
  category: string;
  priceType: string;
}

// Transform API events to our format
const transformApiEvent = (apiEvent: any): Event => ({
  id: apiEvent.id || apiEvent.external_id, // Use database UUID if available, fallback to external_id
  name: apiEvent.name,
  description: apiEvent.description,
  date: apiEvent.start_date || apiEvent.date,
  city: apiEvent.city,
  venue: apiEvent.venue || 'Venue TBA',
  isPaid: apiEvent.is_paid || false,
  price: apiEvent.price_min ? (apiEvent.price_min / 100).toString() : apiEvent.price,
  category: apiEvent.category || 'Event',
  ticket_url: apiEvent.ticket_url,
  verified: apiEvent.verified || false,
  image: apiEvent.image_url,
  latitude: apiEvent.latitude,
  longitude: apiEvent.longitude
});

const Index = () => {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [showEvents, setShowEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [searchCategory, setSearchCategory] = useState<string>("");
  const [displayLimits, setDisplayLimits] = useState<Record<string, number>>({});
  const [categoryOffsets, setCategoryOffsets] = useState<Record<string, number>>({});
  const [currentCity, setCurrentCity] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    setShowEvents(true);
    setTimeout(() => {
      document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSearch = async (filters: SearchFilters) => {
    setSearchCategory(filters.category || "");
    setDisplayLimits({}); // Reset pagination on new search
    setCategoryOffsets({}); // Reset offsets on new search
    setCurrentCity(filters.city); // Store current city for load more
    if (filters.city) {
      try {
        // Fetch admin-created events from database (only approved ones)
        const { data: adminEvents, error: adminError } = await supabase
          .from('events')
          .select('*')
          .eq('approved', true)
          .eq('verified', true)
          .ilike('city', filters.city)
          .gte('start_date', new Date().toISOString());
        
        if (adminError) {
          console.error('Admin events fetch error:', adminError);
        }

        // Fetch API events from edge function
        const { data: apiData, error: apiError } = await supabase.functions.invoke('fetch-events', {
          body: { city: filters.city, category: filters.category, date: filters.date }
        });
        
        let allEvents: Event[] = [];
        
        // Add admin events (they're already in the correct format)
        if (adminEvents && adminEvents.length > 0) {
          const transformedAdminEvents = adminEvents.map(transformApiEvent);
          allEvents = [...transformedAdminEvents];
        }
        
        // Add API events
        if (apiData?.success && apiData.events) {
          const transformedApiEvents = apiData.events.map(transformApiEvent);
          allEvents = [...allEvents, ...transformedApiEvents];
        }
        
        console.log('Admin events count:', adminEvents?.length || 0);
        console.log('API events count:', apiData?.events?.length || 0);
        console.log('Total events:', allEvents.length);
        console.log('All events:', allEvents);
        
        setFilteredEvents(allEvents);
        
        if (allEvents.length === 0) {
          toast({ 
            title: "No Events Found", 
            description: `No events found in ${filters.city}`,
            variant: "default"
          });
        } else {
          const adminCount = adminEvents?.length || 0;
          const apiCount = apiData?.events?.length || 0;
          toast({ 
            title: "Success!", 
            description: `Found ${allEvents.length} events in ${filters.city} (${adminCount} verified)` 
          });
        }
      } catch (error) {
        console.error('Search error:', error);
        toast({ 
          title: "Search Error", 
          description: "Could not fetch events. Please try again.",
          variant: "destructive" 
        });
        setFilteredEvents([]);
      }
    }
    setShowEvents(true);
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Category derivation and grouping helpers
  const deriveCategory = (event: Event): string => {
    const c = (event.category || '').toLowerCase();
    const text = `${event.name} ${event.description || ''}`.toLowerCase();
    if (c.includes('concert') || /(concert|music|gig)/.test(text)) return 'concert';
    if (c.includes('festival') || /(festival|mela|utsav|fair)/.test(text)) return 'festival';
    if (c.includes('party') || /(party|dj night|club)/.test(text)) return 'party';
    if (c.includes('comedy') || /(comedy|stand-?up)/.test(text)) return 'comedy';
    if (c.includes('workshop') || /(workshop|class|training)/.test(text)) return 'workshop';
    return 'other';
  };

  const groupsOrder: Array<'verified'|'festival'|'concert'|'party'|'comedy'|'workshop'|'other'> = ['verified','festival','concert','party','comedy','workshop','other'];
  
  // Separate verified and non-verified events
  const verifiedEvents = filteredEvents.filter(e => e.verified);
  const nonVerifiedEvents = filteredEvents.filter(e => !e.verified);
  
  console.log('Filtered events total:', filteredEvents.length);
  console.log('Verified events:', verifiedEvents.length);
  console.log('Non-verified events:', nonVerifiedEvents.length);
  
  // Group events: verified first, then others by category
  const groupedEvents = nonVerifiedEvents
    .reduce((acc: Record<string, Event[]>, ev) => {
      const key = deriveCategory(ev);
      (acc[key] ||= []).push(ev);
      return acc;
    }, {} as Record<string, Event[]>);
  
  // Add verified events as first category
  if (verifiedEvents.length > 0) {
    groupedEvents['verified'] = verifiedEvents;
  }
  
  console.log('Grouped events:', groupedEvents);
  console.log('Grouped events keys:', Object.keys(groupedEvents));
  Object.keys(groupedEvents).forEach(key => {
    console.log(`Category "${key}" has ${groupedEvents[key].length} events`);
  });
  
  const handleLoadMore = async (category: string) => {
    if (!currentCity) return;
    
    try {
      const currentOffset = categoryOffsets[category] || 0;
      const newOffset = currentOffset + 10;
      
      // Fetch more events from API
      const { data: apiData, error: apiError } = await supabase.functions.invoke('fetch-events', {
        body: { 
          city: currentCity, 
          category: category === 'verified' ? '' : category,
          offset: newOffset 
        }
      });
      
      if (apiData?.success && apiData.events && apiData.events.length > 0) {
        const transformedApiEvents = apiData.events.map(transformApiEvent);
        
        // Append new events to existing ones
        setFilteredEvents(prev => [...prev, ...transformedApiEvents]);
        
        // Update offset for this category
        setCategoryOffsets(prev => ({
          ...prev,
          [category]: newOffset
        }));
        
        toast({ 
          title: "Success!", 
          description: `Loaded ${transformedApiEvents.length} more events` 
        });
      } else {
        toast({ 
          title: "No More Events", 
          description: "No additional events found",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Load more error:', error);
      toast({ 
        title: "Error", 
        description: "Could not load more events",
        variant: "destructive" 
      });
    }
  };


  if (showAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <AuthForms onSuccess={() => setShowAuth(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background antialiased">
      {/* Navigation */}
      <NavigationHeader user={user} onShowAuth={() => setShowAuth(true)} />

      {/* Hero Section */}
      <HeroSection onGetStarted={handleGetStarted} />

      {/* Search Section */}
      <section className="py-20 bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Find Your Perfect Weekend Events
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover real events happening across India's cities using our live event search
            </p>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Event Results */}
      {showEvents && (
        <section id="events-section" className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Live Event Results
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {filteredEvents.length > 0 
                  ? `Found ${filteredEvents.length} events` 
                  : 'Search for events in your city to see results'
                }
              </p>
            </div>
            {searchCategory ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard 
                    key={event.id}
                    event={event}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {groupsOrder.map((group) => {
                  const events = groupedEvents[group];
                  console.log(`Rendering group "${group}":`, events?.length || 0, 'events');
                  if (!events || events.length === 0) {
                    console.log(`Skipping group "${group}" - no events`);
                    return null;
                  }
                  
                  const limit = displayLimits[group] || 10;
                  const displayEvents = events;
                  console.log(`Displaying ${displayEvents.length} events from "${group}"`);
                  
                  return (
                    <div key={group}>
                      <h3 className="text-2xl font-semibold text-foreground mb-6 capitalize flex items-center gap-2">
                        {group === 'verified' ? (
                          <>
                            <span className="text-green-600">✓</span>
                            Weekend Walla Verified Events
                          </>
                        ) : (
                          `${group} Events`
                        )}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayEvents.map((event) => (
                          <EventCard 
                            key={event.id}
                            event={event}
                            onViewDetails={handleViewDetails}
                          />
                        ))}
                      </div>
                      <div className="mt-6 text-center">
                        <Button 
                          onClick={() => handleLoadMore(group)}
                          variant="outline"
                          size="lg"
                        >
                          See More {group === 'verified' ? 'Verified' : group.charAt(0).toUpperCase() + group.slice(1)} Events
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <FeaturesSection />

      {/* Popular Categories */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Popular Categories</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore events by category and find exactly what you're looking for
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-8 transition-all duration-300 hover:-translate-y-1 border border-border/50 hover:shadow-card-hover group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <Sparkles className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Festivals</h3>
              <p className="text-muted-foreground">City fairs, melas and cultural celebrations with vibrant atmospheres.</p>
            </div>
            <div className="bg-card rounded-xl p-8 transition-all duration-300 hover:-translate-y-1 border border-border/50 hover:shadow-card-hover group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <Music2 className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Concerts</h3>
              <p className="text-muted-foreground">Live music performances, indie gigs and concerts from top artists.</p>
            </div>
            <div className="bg-card rounded-xl p-8 transition-all duration-300 hover:-translate-y-1 border border-border/50 hover:shadow-card-hover group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <PartyPopper className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Parties</h3>
              <p className="text-muted-foreground">DJ nights, club events and social gatherings for unforgettable nights.</p>
            </div>
            <div className="bg-card rounded-xl p-8 transition-all duration-300 hover:-translate-y-1 border border-border/50 hover:shadow-card-hover group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <Mic2 className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Comedy</h3>
              <p className="text-muted-foreground">Stand-up comedy shows and open mics for endless laughter.</p>
            </div>
            <div className="bg-card rounded-xl p-8 transition-all duration-300 hover:-translate-y-1 border border-border/50 hover:shadow-card-hover group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <Briefcase className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Workshops</h3>
              <p className="text-muted-foreground">Learn new skills and build connections through educational events.</p>
            </div>
            <div className="bg-card rounded-xl p-8 transition-all duration-300 hover:-translate-y-1 border border-border/50 hover:shadow-card-hover group">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <Star className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">More</h3>
              <p className="text-muted-foreground">Art exhibitions, sports events and unique experiences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cities */}
      <section id="featured-cities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Cities</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover amazing events across India's most vibrant cities
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Mumbai','Delhi','Bengaluru','Hyderabad','Chennai','Kolkata','Pune','Goa'].map((city) => (
              <Button 
                key={city} 
                variant="outline" 
                size="lg"
                className="h-auto p-6 flex flex-col items-center gap-2 hover:bg-accent hover:text-accent-foreground border border-border/50 hover:border-primary/50 transition-all duration-200"
              >
                <MapPin className="w-6 h-6 text-primary" />
                <span className="font-medium">{city}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Call to Action */}
      <CallToActionSection onGetStarted={handleGetStarted} />

      {/* Footer */}
      <Footer />

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
        onBookTicket={() => toast({ title: "Booking", description: "Redirecting to payment..." })}
      />
    </div>
  );
};

export default Index;