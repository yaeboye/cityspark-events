-- Update events table to make events not pre-approved by default
ALTER TABLE public.events 
ALTER COLUMN approved SET DEFAULT false;

-- Update existing admin-created events to be unapproved
UPDATE public.events 
SET approved = false, approved_by = null 
WHERE source = 'admin';