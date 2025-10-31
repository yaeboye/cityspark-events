-- Add verified field to events table
ALTER TABLE public.events 
ADD COLUMN verified boolean DEFAULT false;

-- Set verified=true for events created by admins (not from API)
UPDATE public.events 
SET verified = true 
WHERE source != 'api' AND approved = true;

-- Ensure all API events are not verified
UPDATE public.events 
SET verified = false 
WHERE source = 'api';