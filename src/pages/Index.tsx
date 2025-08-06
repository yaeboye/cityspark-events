import { useState, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { SearchBar } from "@/components/SearchBar";
import { EventCard } from "@/components/EventCard";
import { EventDetails } from "@/components/EventDetails";
import { AuthForms } from "@/components/auth/AuthForms";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

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
}

interface SearchFilters {
  city: string;
  date: string;
  category: string;
  priceType: string;
}

// Transform API events to our format
const transformApiEvent = (apiEvent: any): Event => ({
  id: apiEvent.external_id || apiEvent.id,
  name: apiEvent.name,
  description: apiEvent.description,
  date: apiEvent.start_date ? new Date(apiEvent.start_date).toISOString().split('T')[0] : apiEvent.date,
  city: apiEvent.city,
  venue: apiEvent.venue || 'Venue TBA',
  isPaid: apiEvent.is_paid || false,
  price: apiEvent.price_min ? (apiEvent.price_min / 100).toString() : apiEvent.price,
  category: apiEvent.category || 'Event'
});

const Index = () => {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [showEvents, setShowEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [searchCategory, setSearchCategory] = useState<string>("");
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
    if (filters.city) {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-events', {
          body: { city: filters.city, category: filters.category, date: filters.date }
        });
        
        if (data?.success && data.events) {
          const transformedEvents = data.events.map(transformApiEvent);
          setFilteredEvents(transformedEvents);
          toast({ 
            title: "Success!", 
            description: `Found ${transformedEvents.length} events in ${filters.city}` 
          });
        } else {
          throw new Error(data?.error || 'No events found');
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

  const groupsOrder: Array<'festival'|'concert'|'party'|'comedy'|'workshop'|'other'> = ['festival','concert','party','comedy','workshop','other'];
  const groupedEvents = filteredEvents
    .slice(0, 20)
    .reduce((acc: Record<string, Event[]>, ev) => {
      const key = deriveCategory(ev);
      (acc[key] ||= []).push(ev);
      return acc;
    }, {} as Record<string, Event[]>);

  if (selectedEvent) {
    return (
      <EventDetails 
        event={selectedEvent as any}
        onBack={() => setSelectedEvent(null)}
        onBookTicket={() => toast({ title: "Booking", description: "Redirecting to payment..." })}
      />
    );
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <AuthForms onSuccess={() => setShowAuth(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="absolute top-4 right-4 z-10">
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAuth(true)}
          >
            <User className="w-4 h-4 mr-2" />
            Login
          </Button>
        )}
      </div>

      <HeroSection onGetStarted={handleGetStarted} />

      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find Your Perfect Weekend Events
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover real events happening across India's cities using our live event search
            </p>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {showEvents && (
        <div id="events-section" className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Live Event Results
              </h2>
              <p className="text-muted-foreground">
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
              <div className="space-y-10">
                {groupsOrder.map((group) => (
                  groupedEvents[group] && groupedEvents[group].length > 0 ? (
                    <div key={group}>
                      <h3 className="text-2xl font-semibold text-foreground mb-4 capitalize">
                        {group} Events
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedEvents[group].map((event) => (
                          <EventCard 
                            key={event.id}
                            event={event}
                            onViewDetails={handleViewDetails}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;