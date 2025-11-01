import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const testimonialSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  role: z.string().trim().min(1, "Role/Location is required").max(100),
  content: z.string().trim().min(10, "Testimonial must be at least 10 characters").max(500),
  rating: z.number().min(1).max(5),
});

export const TestimonialForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = testimonialSchema.parse({
        ...formData,
        rating,
      });

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit a testimonial",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("testimonials").insert({
        user_id: user.id,
        name: validated.name,
        role: validated.role,
        content: validated.content,
        rating: validated.rating,
      });

      if (error) throw error;

      toast({
        title: "Testimonial submitted!",
        description: "Your testimonial will be reviewed and published soon.",
      });

      setFormData({ name: "", role: "", content: "" });
      setRating(5);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit testimonial. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
      <h3 className="text-xl font-semibold text-foreground mb-4">
        Share Your Experience
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            required
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="role">Role & Location</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="Event Enthusiast, Mumbai"
            required
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="content">Your Testimonial</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Share your experience with Weekend Walla..."
            required
            maxLength={500}
            className="min-h-[120px]"
          />
        </div>

        <div>
          <Label>Rating</Label>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating
                      ? "text-yellow-400 fill-current"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit Testimonial"}
        </Button>
      </form>
    </div>
  );
};
