import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { SearchBar } from "@/components/SearchBar";
import { EventCard } from "@/components/EventCard";
import { useToast } from "@/components/ui/use-toast";

// Mock event data for demonstration
const mockEvents = [
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
  },
  {
    id: "3",
    name: "Stand-up Comedy Show",
    description: "Hilarious evening with India's top comedians",
    date: "2024-01-25",
    city: "Bangalore",
    venue: "Phoenix MarketCity",
    isPaid: true,
    price: "599",
    category: "Comedy"
  },
  {
    id: "4",
    name: "Classical Music Concert",
    description: "An enchanting evening of Indian classical music by renowned artists",
    date: "2024-02-01",
    city: "Chennai",
    venue: "Music Academy",
    isPaid: true,
    price: "899",
    category: "Concert"
  },
  {
    id: "5",
    name: "Tech Startup Workshop",
    description: "Learn from successful entrepreneurs and network with like-minded people",
    date: "2024-02-05",
    city: "Hyderabad",
    venue: "T-Hub",
    isPaid: false,
    category: "Workshop"
  },
  {
    id: "6",
    name: "Bollywood Dance Party",
    description: "Dance the night away to the best Bollywood hits",
    date: "2024-02-10",
    city: "Pune",
    venue: "Hard Rock Cafe",
    isPaid: true,
    price: "799",
    category: "Party"
  }
];

interface SearchFilters {
  city: string;
  date: string;
  category: string;
  priceType: string;
}

const Index = () => {
  const [filteredEvents, setFilteredEvents] = useState(mockEvents);
  const [showEvents, setShowEvents] = useState(false);
  const { toast } = useToast();

  const handleGetStarted = () => {
    setShowEvents(true);
    // Smooth scroll to events section
    setTimeout(() => {
      document.getElementById('events-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const handleSearch = (filters: SearchFilters) => {
    let filtered = mockEvents;

    if (filters.city) {
      filtered = filtered.filter(event => 
        event.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(event => 
        event.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.priceType) {
      if (filters.priceType === 'free') {
        filtered = filtered.filter(event => !event.isPaid);
      } else if (filters.priceType === 'paid') {
        filtered = filtered.filter(event => event.isPaid);
      }
    }

    if (filters.date) {
      filtered = filtered.filter(event => event.date >= filters.date);
    }

    setFilteredEvents(filtered);
    setShowEvents(true);

    toast({
      title: "Search Results",
      description: `Found ${filtered.length} events matching your criteria`,
    });
  };

  const handleViewDetails = (event: any) => {
    toast({
      title: "Event Details",
      description: `Opening details for ${event.name}`,
    });
  };

  const handleBookTicket = (event: any) => {
    toast({
      title: "Booking Ticket",
      description: `Redirecting to booking for ${event.name}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection onGetStarted={handleGetStarted} />

      {/* Search Section */}
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

      {/* Events Section */}
      {showEvents && (
        <div id="events-section" className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Trending Events
              </h2>
              <p className="text-muted-foreground text-lg">
                {filteredEvents.length} amazing events waiting for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <EventCard 
                    event={event}
                    onViewDetails={handleViewDetails}
                    onBookTicket={handleBookTicket}
                  />
                </div>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No events found matching your criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;