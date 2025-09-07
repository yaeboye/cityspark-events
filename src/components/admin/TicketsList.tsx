import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, Filter, Ticket, User, Calendar } from "lucide-react";
import { format } from "date-fns";

interface TicketWithEvent {
  id: string;
  ticket_code: string;
  ticket_type: string;
  quantity: number;
  total_price: number;
  payment_status: string;
  purchased_at: string;
  user_id: string;
  event: {
    id: string;
    name: string;
    start_date: string;
    venue: string;
    city: string;
  } | null;
}

export const TicketsList = () => {
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          event:events(
            id,
            name,
            start_date,
            venue,
            city
          )
        `)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching tickets",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ payment_status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Ticket status updated to ${newStatus}.`,
      });

      fetchTickets();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportTickets = () => {
    const csvData = tickets.map(ticket => ({
      ticket_code: ticket.ticket_code,
      event_name: ticket.event?.name || 'N/A',
      quantity: ticket.quantity,
      total_price: (ticket.total_price / 100).toFixed(2),
      payment_status: ticket.payment_status,
      purchased_at: format(new Date(ticket.purchased_at), "yyyy-MM-dd HH:mm:ss")
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'refunded':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.event?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.event?.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.payment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={exportTickets} variant="outline" className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No tickets found.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket Code</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-primary" />
                      <span className="font-mono font-medium">{ticket.ticket_code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{ticket.event?.name || 'Event Deleted'}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.event?.venue}, {ticket.event?.city}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">Type: {ticket.ticket_type}</p>
                      <p className="text-sm">Qty: {ticket.quantity}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      ₹{(ticket.total_price / 100).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(ticket.payment_status)}>
                      {ticket.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(ticket.purchased_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ticket.purchased_at), "HH:mm")}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={ticket.payment_status}
                      onValueChange={(value) => handleStatusUpdate(ticket.id, value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Summary */}
      <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
        <span className="text-sm text-muted-foreground">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </span>
        <span className="text-sm font-medium">
          Total Revenue: ₹{filteredTickets
            .filter(t => t.payment_status === 'paid')
            .reduce((sum, t) => sum + t.total_price, 0) / 100}
        </span>
      </div>
    </div>
  );
};