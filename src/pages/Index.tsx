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

// Mock events for demo
const mockEvents: Event[] = [
  {
    id: "1",
    name: "Sunburn Festival Mumbai",
    description: "India's biggest electronic music festival featuring international and local DJs",
    date: "2024-01-15",
    city: "Mumbai",
    venue: "Mahalaxmi Race Course",
    isPaid: true,
    price: "2999",
    category: "Festival"
  },
  {
    id: "2",
    name: "Diwali Cultural Night",
    description: "Celebrate the festival of lights with traditional music, dance, and food",
    date: "2024-01-20",
    city: "Delhi",
    venue: "India Gate Lawns",
    isPaid: false,
    category: "Festival"
  }
];

const Index = () => {
  const [filteredEvents, setFilteredEvents] = useState(mockEvents);
  const [showEvents, setShowEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
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
    // In production, this would call the real API
    if (filters.city) {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-events', {
          body: { city: filters.city, category: filters.category, date: filters.date }
        });
        
        if (data?.success) {
          setFilteredEvents(data.events);
        }
      } catch (error) {
        // Fallback to mock data
        setFilteredEvents(mockEvents);
      }
    }
    setShowEvents(true);
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
  };

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
              Find Events Near You
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Search through thousands of events happening across India's vibrant cities
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
                Trending Events
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id}
                  event={event}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;