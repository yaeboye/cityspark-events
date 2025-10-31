-- Set all API events to unapproved status
UPDATE public.events 
SET approved = false, approved_by = null 
WHERE source = 'api';