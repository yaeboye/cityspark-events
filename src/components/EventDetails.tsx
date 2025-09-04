import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Users, Ticket, Bookmark, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { WeatherWidget } from "@/components/WeatherWidget";
import { GoogleMap } from "@/components/GoogleMap";
import { useToast } from "@/hooks/use-toast";
import { useBookmarks } from "@/hooks/useBookmarks";

interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date?: string;
  city: string;
  venue?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  is_paid: boolean;
  price_min?: number;
  price_max?: number;
  ticket_url?: string;
  image_url?: string;
}

interface EventDetailsProps {
  event: Event;
  onBack: () => void;
  onBookTicket?: (event: Event) => void;
}

export const EventDetails = ({ event, onBack, onBookTicket }: EventDetailsProps) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return "Free";
    if (min === max) return `₹${(min! / 100).toFixed(0)}`;
    if (min && max) return `₹${(min / 100).toFixed(0)} - ₹${(max / 100).toFixed(0)}`;
    if (min) return `From ₹${(min / 100).toFixed(0)}`;
    return `Up to ₹${(max! / 100).toFixed(0)}`;
  };


  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Event link copied to clipboard",
        });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Event link copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleBookmark(event.id)}
                className={isBookmarked(event.id) ? "text-primary border-primary/50" : ""}
              >
                <Bookmark className={`w-4 h-4 mr-1 ${isBookmarked(event.id) ? "fill-current" : ""}`} />
                {isBookmarked(event.id) ? "Bookmarked" : "Bookmark"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Event Image */}
            <div className="relative">
              <div 
                className="w-full h-96 bg-gradient-sunset rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundImage: event.image_url ? `url(${event.image_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!event.image_url && (
                  <>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10 text-white text-center">
                      <Calendar className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <p className="text-lg font-medium">{event.category}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Event Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={event.is_paid ? "default" : "secondary"}>
                    {formatPrice(event.price_min, event.price_max)}
                  </Badge>
                  {event.category && (
                    <Badge variant="outline">{event.category}</Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {event.name}
                </h1>
                
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">{formatDate(event.start_date)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(event.start_date)}
                      {event.end_date && ` - ${formatTime(event.end_date)}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <div>
                    <div className="font-medium">{event.venue || "Venue TBA"}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.address || event.city}
                    </div>
                  </div>
                </div>

                {event.is_paid && (
                  <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-accent" />
                    <div>
                      <div className="font-medium">Tickets Available</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(event.price_min, event.price_max)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {event.ticket_url && (
                  <Button 
                    size="lg"
                    className="flex-1 bg-gradient-primary text-primary-foreground hover:shadow-primary"
                    onClick={() => {
                      try {
                        window.open(event.ticket_url, '_blank');
                        toast({
                          title: "Opening Event Page",
                          description: "Redirecting to the official event page",
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Could not open event page. Please check your browser settings.",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <Ticket className="w-5 h-5 mr-2" />
                    View Event Details
                  </Button>
                )}
                
                {event.is_paid && onBookTicket && (
                  <Button 
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onBookTicket(event)}
                  >
                    <Ticket className="w-5 h-5 mr-2" />
                    Book Tickets
                  </Button>
                )}
                
                <Button 
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Use venue and address for better search results
                    let searchQuery = '';
                    if (event.venue && (event.address || event.city)) {
                      searchQuery = `${event.venue}, ${event.address || event.city}`;
                    } else if (event.venue) {
                      searchQuery = event.venue;
                    } else if (event.address) {
                      searchQuery = event.address;
                    } else if (event.city) {
                      searchQuery = event.city;
                    } else if (event.latitude && event.longitude) {
                      searchQuery = `${event.latitude},${event.longitude}`;
                    }
                    
                    if (searchQuery) {
                      const encodedQuery = encodeURIComponent(searchQuery);
                      const googleMapsUrl = `https://maps.google.com/maps?q=${encodedQuery}`;
                      try {
                        window.open(googleMapsUrl, '_blank');
                        toast({
                          title: "Opening Maps",
                          description: `Opening "${searchQuery}" in Google Maps`,
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Could not open maps. Please check your browser settings.",
                        });
                      }
                    } else {
                      toast({
                        title: "Location not available",
                        description: "No location information available for this event",
                      });
                    }
                  }}
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Weather and Map */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Weather Widget */}
          {event.latitude && event.longitude && (
            <WeatherWidget
              latitude={event.latitude}
              longitude={event.longitude}
              eventDate={event.start_date}
            />
          )}

          {/* Map */}
          {event.latitude && event.longitude && (
            <Card className="animate-fade-in">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Event Location
                </h3>
                <div className="h-80">
                  <GoogleMap
                    latitude={event.latitude}
                    longitude={event.longitude}
                    venue={event.venue}
                    address={event.address}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};