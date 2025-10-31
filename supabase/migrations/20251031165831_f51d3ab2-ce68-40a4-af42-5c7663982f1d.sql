-- Insert admin role for satvikj570@gmail.com
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES ('fd6d6fc1-8d5e-4f43-95e1-afa94280feed', 'admin'::app_role, 'fd6d6fc1-8d5e-4f43-95e1-afa94280feed')
ON CONFLICT (user_id, role) DO NOTHING;