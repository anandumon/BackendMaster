-- Shared lessons: first generation is stored here for all users
CREATE TABLE IF NOT EXISTS public.lessons (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  domain TEXT,
  section_name TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
CREATE POLICY "lessons_select_all" ON public.lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "lessons_insert_auth" ON public.lessons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lessons_update_admin" ON public.lessons FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Per-user lesson overrides: when a user regenerates, their copy goes here
CREATE TABLE IF NOT EXISTS public.user_lesson_overrides (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, slug)
);
ALTER TABLE public.user_lesson_overrides ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_lesson_overrides TO authenticated;
GRANT ALL ON public.user_lesson_overrides TO service_role;
CREATE POLICY "overrides_own" ON public.user_lesson_overrides FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User completions (moved from localStorage to DB for per-user tracking)
CREATE TABLE IF NOT EXISTS public.user_completions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, slug)
);
ALTER TABLE public.user_completions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.user_completions TO authenticated;
GRANT ALL ON public.user_completions TO service_role;
CREATE POLICY "completions_own" ON public.user_completions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User bookmarks (moved from localStorage to DB)
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  bookmarked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, slug)
);
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.user_bookmarks TO authenticated;
GRANT ALL ON public.user_bookmarks TO service_role;
CREATE POLICY "bookmarks_own" ON public.user_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User activity log (views, generations, etc.)
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  slug TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.user_activity TO authenticated;
GRANT ALL ON public.user_activity TO service_role;
CREATE POLICY "activity_own" ON public.user_activity FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "activity_insert_own" ON public.user_activity FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "activity_select_admin" ON public.user_activity FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin can see all completions and bookmarks
CREATE POLICY "completions_admin" ON public.user_completions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "bookmarks_admin" ON public.user_bookmarks FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Index for activity queries
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.user_activity(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_slug ON public.user_activity(slug, created_at DESC);

-- Hardcode anandu2109@gmail.com as admin
-- Update the handle_new_user function to grant admin to this specific email
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

  -- Admin for specific email OR first user
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO is_first;

  IF NEW.email = 'anandu2109@gmail.com' OR is_first THEN
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

-- If anandu2109@gmail.com already exists, make them admin now
DO $$
DECLARE
  target_uid UUID;
BEGIN
  SELECT id INTO target_uid FROM auth.users WHERE email = 'anandu2109@gmail.com' LIMIT 1;
  IF target_uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (target_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Admins can see all profiles
CREATE POLICY IF NOT EXISTS "profiles_select_admin_v2" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
