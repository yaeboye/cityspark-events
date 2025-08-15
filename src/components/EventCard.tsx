import { Calendar, MapPin, Star, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventWeatherCard } from "@/components/EventWeatherCard";

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  city: string;
  venue: string;
  isPaid: boolean;
  price?: string;
  image?: string;
  category: string;
  latitude?: number;
  longitude?: number;
}

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
  onBookTicket?: (event: Event) => void;
}

export const EventCard = ({ event, onViewDetails, onBookTicket }: EventCardProps) => {
  const formatDate = (dateString: string) => {
    // Handle different date formats and ensure proper parsing
    let date: Date;
    
    if (dateString.includes('T')) {
      // ISO format with time
      date = new Date(dateString);
    } else if (dateString.includes('-')) {
      // YYYY-MM-DD format - explicitly parse to avoid timezone issues
      const parts = dateString.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      
      date = new Date(year, month - 1, day); // month is 0-indexed
    } else {
      date = new Date(dateString);
    }
    
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="group bg-gradient-card rounded-xl p-6 shadow-card hover:shadow-card-hover border border-border/50 transition-all duration-300 hover:-translate-y-1 animate-fade-in">
      {/* Event Image Placeholder */}
      <div className="w-full h-48 bg-gradient-sunset rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-white text-center">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-medium">{event.category}</p>
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {event.name}
          </h3>
          <Badge variant={event.isPaid ? "default" : "secondary"}>
            {event.isPaid ? "Paid" : "Free"}
          </Badge>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            {formatDate(event.date)}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-secondary" />
            {event.venue}, {event.city}
          </div>

          {/* Weather Information */}
          {event.latitude && event.longitude && (
            <EventWeatherCard
              latitude={event.latitude}
              longitude={event.longitude}
              eventDate={event.date}
              className="pt-1"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            className="flex-1 hover:bg-accent hover:text-accent-foreground"
            onClick={() => onViewDetails(event)}
          >
            View Details
          </Button>
          
          {event.isPaid && onBookTicket && (
            <Button 
              className="flex-1 bg-gradient-primary text-primary-foreground hover:shadow-primary"
              onClick={() => onBookTicket(event)}
            >
              <Ticket className="w-4 h-4 mr-2" />
              Book Ticket
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};