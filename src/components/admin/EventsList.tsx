import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, Trash2, MapPin, Calendar, DollarSign, Filter } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  name: string;
  description: string;
  venue: string;
  city: string;
  category: string;
  start_date: string;
  end_date: string;
  is_paid: boolean;
  price_min: number;
  price_max: number;
  approved: boolean;
  approved_by: string;
  source: string;
  created_at: string;
}

interface EventsListProps {
  onStatsUpdate: () => void;
}

export const EventsList = ({ onStatsUpdate }: EventsListProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterApproval, setFilterApproval] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, [filterSource, filterApproval]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Please log in to access admin features");
      }

      let query = supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply source filter
      if (filterSource !== "all") {
        query = query.eq('source', filterSource);
      }

      // Apply approval filter
      if (filterApproval === "approved") {
        query = query.eq('approved', true);
      } else if (filterApproval === "pending") {
        query = query.eq('approved', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      setEvents(data || []);
    } catch (error: any) {
      console.error("Fetch events error:", error);
      toast({
        title: "Error fetching events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalToggle = async (eventId: string, currentApproval: boolean) => {
    try {
      // Check if user is authenticated first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Please log in to access admin features");
      }

      console.log(`Toggling approval for event ${eventId} from ${currentApproval} to ${!currentApproval}`);
      
      const { error } = await supabase
        .from('events')
        .update({ 
          approved: !currentApproval,
          approved_by: !currentApproval ? 'Weekend Walla' : null
        })
        .eq('id', eventId);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      toast({
        title: `Event ${!currentApproval ? 'approved' : 'unapproved'}`,
        description: `The event has been ${!currentApproval ? 'approved' : 'unapproved'} successfully.`,
      });

      fetchEvents();
      onStatsUpdate();
    } catch (error: any) {
      console.error("Approval toggle error:", error);
      toast({
        title: "Error updating event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      // Check if user is authenticated first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Please log in to access admin features");
      }

      console.log(`Deleting event ${eventId}`);
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error("Delete error:", error);
        throw error;
      }

      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });

      fetchEvents();
      onStatsUpdate();
    } catch (error: any) {
      console.error("Delete event error:", error);
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatPrice = (priceMin: number, priceMax: number) => {
    if (!priceMin && !priceMax) return "Free";
    if (priceMin === priceMax) return `₹${(priceMin / 100).toLocaleString()}`;
    if (priceMin && priceMax) return `₹${(priceMin / 100).toLocaleString()} - ₹${(priceMax / 100).toLocaleString()}`;
    if (priceMin) return `From ₹${(priceMin / 100).toLocaleString()}`;
    return `Up to ₹${(priceMax / 100).toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No events found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="admin">Admin Created</SelectItem>
              <SelectItem value="api">API Events</SelectItem>
              <SelectItem value="fallback">Fallback</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterApproval} onValueChange={setFilterApproval}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Approval Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {events.length} event{events.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Details</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {event.category}
                    </p>
                    <Badge variant={event.source === 'admin' ? 'default' : 'secondary'} className="mt-1">
                      {event.source === 'admin' ? 'Admin' : 'API'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{event.venue}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{event.city}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(event.start_date), "MMM d, yyyy")}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {event.is_paid ? formatPrice(event.price_min, event.price_max) : "Free"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={event.approved}
                      onCheckedChange={() => handleApprovalToggle(event.id, event.approved)}
                    />
                    <Badge variant={event.approved ? "default" : "secondary"}>
                      {event.approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                  {event.approved && event.approved_by && (
                    <p className="text-xs text-muted-foreground mt-1">
                      by {event.approved_by}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // You can implement a view/edit modal here
                        console.log("View event:", event.id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};