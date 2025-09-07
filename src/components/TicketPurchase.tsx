import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, CreditCard, Download, CheckCircle } from "lucide-react";

interface Event {
  id: string;
  name: string;
  venue?: string;
  city: string;
  start_date: string;
  price_min?: number;
  price_max?: number;
  is_paid: boolean;
}

interface TicketPurchaseProps {
  event: Event;
}

export const TicketPurchase = ({ event }: TicketPurchaseProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState("general");
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<any>(null);
  const { toast } = useToast();

  const ticketPrice = event.price_min || 0;
  const totalAmount = ticketPrice * quantity;

  const handlePurchase = async () => {
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to purchase tickets.",
          variant: "destructive",
        });
        return;
      }

      // Create ticket record
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          event_id: event.id,
          ticket_type: ticketType,
          quantity: quantity,
          total_price: totalAmount,
          payment_status: event.is_paid ? 'pending' : 'paid', // Free events are automatically paid
          ticket_code: `TKT-${Date.now()}`, // Temporary code, will be overridden by trigger
        })
        .select()
        .single();

      if (error) throw error;

      // For paid events, in real implementation, you would integrate with Stripe here
      // For now, we'll just simulate successful payment for demo purposes
      if (event.is_paid) {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update ticket status to paid
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ payment_status: 'paid' })
          .eq('id', ticket.id);

        if (updateError) throw updateError;
      }

      setGeneratedTicket({ ...ticket, payment_status: 'paid' });
      setPurchaseSuccess(true);

      toast({
        title: "Ticket purchased successfully!",
        description: "Your e-ticket has been generated. You can download it below.",
      });

    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateETicket = () => {
    if (!generatedTicket) return;

    const ticketData = {
      ticket_code: generatedTicket.ticket_code,
      event_name: event.name,
      venue: `${event.venue}, ${event.city}`,
      date: new Date(event.start_date).toLocaleDateString(),
      time: new Date(event.start_date).toLocaleTimeString(),
      quantity: generatedTicket.quantity,
      ticket_type: generatedTicket.ticket_type,
      total_paid: `₹${(generatedTicket.total_price / 100).toFixed(2)}`,
      approved_by: "Weekend Walla"
    };

    // Create a simple text-based e-ticket (in real app, you'd generate a PDF)
    const ticketContent = `
=== E-TICKET ===
Weekend Walla - Your Event Partner

Ticket Code: ${ticketData.ticket_code}
Event: ${ticketData.event_name}
Venue: ${ticketData.venue}
Date: ${ticketData.date}
Time: ${ticketData.time}
Type: ${ticketData.ticket_type}
Quantity: ${ticketData.quantity}
Amount Paid: ${ticketData.total_paid}

Approved by: ${ticketData.approved_by}

Please present this ticket at the venue.
For any queries, contact Weekend Walla support.

Generated on: ${new Date().toLocaleString()}
=== END TICKET ===
    `;

    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${generatedTicket.ticket_code}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetPurchase = () => {
    setIsOpen(false);
    setPurchaseSuccess(false);
    setGeneratedTicket(null);
    setQuantity(1);
    setTicketType("general");
  };

  if (!event.is_paid) {
    // For free events, show a simpler flow
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Ticket className="w-4 h-4 mr-2" />
            Get Free Ticket
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Get Your Free Ticket</DialogTitle>
            <DialogDescription>
              Reserve your spot for this free event
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Number of Tickets</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            {!purchaseSuccess ? (
              <Button 
                onClick={handlePurchase} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? "Generating Ticket..." : "Get Free Ticket"}
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Ticket Generated!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Your ticket code: <strong>{generatedTicket?.ticket_code}</strong></p>
                  <Button onClick={generateETicket} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download E-Ticket
                  </Button>
                  <Button onClick={resetPurchase} variant="outline" className="w-full">
                    Close
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <CreditCard className="w-4 h-4 mr-2" />
          Buy Tickets - ₹{(ticketPrice / 100).toLocaleString()}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Tickets</DialogTitle>
          <DialogDescription>
            Buy tickets for {event.name}
          </DialogDescription>
        </DialogHeader>
        
        {!purchaseSuccess ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ticket-type">Ticket Type</Label>
              <Select value={ticketType} onValueChange={setTicketType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Admission</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span>Total Amount:</span>
                <span className="font-bold text-lg">
                  ₹{(totalAmount / 100).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>⚠️ Stripe integration not implemented yet. This is a demo purchase.</p>
              <p>In production, this would redirect to Stripe Checkout.</p>
            </div>

            <Button 
              onClick={handlePurchase} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? "Processing Payment..." : `Pay ₹${(totalAmount / 100).toLocaleString()}`}
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Payment Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Your ticket code: <strong>{generatedTicket?.ticket_code}</strong></p>
              <p>Amount paid: <strong>₹{(generatedTicket?.total_price / 100).toFixed(2)}</strong></p>
              
              <Button onClick={generateETicket} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download E-Ticket
              </Button>
              <Button onClick={resetPurchase} variant="outline" className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};