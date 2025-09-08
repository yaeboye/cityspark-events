import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface CreateTestEventProps {
  onEventCreated: () => void;
}

export const CreateTestEvent = ({ onEventCreated }: CreateTestEventProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createTestEvent = async () => {
    setIsCreating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const testEventData = {
        external_id: `admin-test-${Date.now()}`,
        name: `Test Event for Admin Review - ${new Date().toLocaleDateString()}`,
        description: 'This is a test event created to demonstrate admin approval functionality. You can approve/disapprove and delete this event.',
        venue: 'Test Venue',
        address: '123 Test Street, Test Area',
        city: 'Mumbai',
        category: 'technology',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        end_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
        is_paid: true,
        price_min: 50000, // ₹500
        price_max: 100000, // ₹1000
        source: 'admin',
        approved: false,
        approved_by: null,
      };

      const { error } = await supabase
        .from('events')
        .insert([testEventData]);

      if (error) throw error;

      toast({
        title: "Test event created!",
        description: "A sample unapproved event has been created for testing admin functionality.",
      });

      onEventCreated();
    } catch (error: any) {
      toast({
        title: "Error creating test event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Admin Testing</CardTitle>
        <CardDescription>
          Create a sample unapproved event to test approval/deletion functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={createTestEvent} 
          disabled={isCreating}
          variant="outline"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? "Creating..." : "Create Test Event"}
        </Button>
      </CardContent>
    </Card>
  );
};