import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, Trash2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { EventCard } from '@/components/EventCard';
import { EventDetails } from '@/components/EventDetails';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  city: string;
  venue: string;
  is_paid: boolean;
  price_min?: number;
  price_max?: number;
  image_url?: string;
  category: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  ticket_url?: string;
}

interface BookmarkedEvent extends Event {
  bookmarked_at: string;
}

const Bookmarks = () => {
  const [bookmarkedEvents, setBookmarkedEvents] = useState<BookmarkedEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadBookmarkedEvents();
    } else {
      setLoading(false);
    }
  };

  const loadBookmarkedEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_bookmarks')
        .select(`
          bookmarked_at,
          event_id,
          events (
            id,
            name,
            description,
            start_date,
            city,
            venue,
            is_paid,
            price_min,
            price_max,
            image_url,
            category,
            latitude,
            longitude,
            address,
            ticket_url
          )
        `)
        .eq('user_id', user.id)
        .order('bookmarked_at', { ascending: false });

      if (error) throw error;

      const events = data?.map(bookmark => ({
        ...bookmark.events,
        bookmarked_at: bookmark.bookmarked_at
      })) || [];

      setBookmarkedEvents(events);
    } catch (error) {
      console.error('Error loading bookmarked events:', error);
      toast({
        title: "Error",
        description: "Failed to load bookmarked events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', eventId);

      if (error) throw error;

      setBookmarkedEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: "Bookmark removed",
        description: "Event removed from your bookmarks"
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive"
      });
    }
  };

  const transformEventData = (event: BookmarkedEvent) => ({
    id: event.id,
    name: event.name,
    description: event.description || '',
    date: event.start_date,
    city: event.city,
    venue: event.venue || '',
    isPaid: event.is_paid || false,
    price: event.price_min ? `₹${event.price_min}${event.price_max && event.price_max !== event.price_min ? ` - ₹${event.price_max}` : ''}` : undefined,
    image: event.image_url,
    category: event.category,
    latitude: event.latitude,
    longitude: event.longitude,
    start_date: event.start_date,
    is_paid: event.is_paid || false,
    address: event.address,
    ticket_url: event.ticket_url
  });

  if (selectedEvent) {
    return (
      <EventDetails
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-main">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
            <p className="text-muted-foreground">Please sign in to view your bookmarked events</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Bookmark className="w-8 h-8 text-primary" />
              My Bookmarks
            </h1>
            <p className="text-muted-foreground">Your saved events history</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading your bookmarks...</p>
          </div>
        ) : bookmarkedEvents.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No bookmarks yet</h2>
            <p className="text-muted-foreground">Start bookmarking events to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedEvents.map((event) => (
              <div key={event.id} className="relative">
                <EventCard
                  event={transformEventData(event)}
                  onViewDetails={(eventData) => setSelectedEvent(event)}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeBookmark(event.id)}
                  className="absolute top-4 right-4 h-8 w-8 p-0 opacity-80 hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded px-2 py-1">
                  <p className="text-xs text-muted-foreground">
                    Saved {new Date(event.bookmarked_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;