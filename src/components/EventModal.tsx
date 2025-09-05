import { EventDetails } from "@/components/EventDetails";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  latitude?: number;
  longitude?: number;
  image_url?: string;
  ticket_url?: string;
}

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onBookTicket?: () => void;
}

export const EventModal = ({ event, isOpen, onClose, onBookTicket }: EventModalProps) => {
  if (!event) return null;

  // Transform event to match EventDetails interface
  const transformedEvent = {
    ...event,
    start_date: event.date,
    is_paid: event.isPaid,
    venue: event.venue,
    address: event.city,
    price_min: event.price ? parseInt(event.price) * 100 : undefined,
    price_max: event.price ? parseInt(event.price) * 100 : undefined,
    image_url: event.image_url,
    ticket_url: event.ticket_url,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <EventDetails 
          event={transformedEvent as any}
          onBack={onClose}
          onBookTicket={onBookTicket ? () => onBookTicket() : undefined}
        />
      </DialogContent>
    </Dialog>
  );
};