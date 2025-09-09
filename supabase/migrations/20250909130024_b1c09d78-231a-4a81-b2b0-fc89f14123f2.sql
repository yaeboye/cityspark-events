-- Update RLS policies for events table to use admin roles
DROP POLICY IF EXISTS "Admin can view all events" ON public.events;
DROP POLICY IF EXISTS "Admin can update all events" ON public.events;
DROP POLICY IF EXISTS "Admin can delete all events" ON public.events;

-- Create new admin-only policies for events
CREATE POLICY "Admins can view all events" ON public.events
  FOR SELECT 
  USING (public.is_admin() OR approved = true);

CREATE POLICY "Admins can update all events" ON public.events
  FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete all events" ON public.events
  FOR DELETE 
  USING (public.is_admin());

-- Update policies for tickets table 
CREATE POLICY "Admins can view all tickets" ON public.tickets
  FOR SELECT 
  USING (public.is_admin() OR auth.uid() = user_id);

-- Function to make current user an admin (for initial setup)
CREATE OR REPLACE FUNCTION public.make_user_admin(_user_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (_user_id, 'admin'::app_role, auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;
$$;