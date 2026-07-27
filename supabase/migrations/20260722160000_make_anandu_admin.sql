-- Ensure anandu2109@gmail and anandu2109@gmail.com automatically get admin role on signup and currently existing accounts

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_first BOOLEAN;
  target_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO is_first;

  IF NEW.email ILIKE 'anandu2109@gmail%' OR is_first THEN
    target_role := 'admin';
  ELSE
    target_role := 'user';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, target_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Grant admin role to any existing account with email anandu2109@gmail...
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id FROM auth.users WHERE email ILIKE 'anandu2109@gmail%' LOOP
    INSERT INTO public.user_roles (user_id, role) VALUES (rec.id, 'admin')
    ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
  END LOOP;
END;
$$;
