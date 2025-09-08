-- Add admin policies for the events table
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can view all events" ON public.events;
DROP POLICY IF EXISTS "Admin can update all events" ON public.events;
DROP POLICY IF EXISTS "Admin can delete all events" ON public.events;

-- Create admin policies to allow authenticated users to manage events
CREATE POLICY "Admin can view all events" ON public.events
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can update all events" ON public.events
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete all events" ON public.events
  FOR DELETE 
  USING (auth.role() = 'authenticated');