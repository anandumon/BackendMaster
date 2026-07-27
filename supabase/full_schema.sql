-- ==============================================================================
-- BackendMaster AI - Complete Supabase Database Setup Script
-- Project: cupmcnyxfbqkoexspqif
-- Copy and paste this whole script into the Supabase SQL Editor and click "Run":
-- https://supabase.com/dashboard/project/cupmcnyxfbqkoexspqif/sql/new
-- ==============================================================================

-- 1. Create Enum Role Type if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END $$;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 3. User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 4. Helper Function: has_role (SECURITY DEFINER to avoid policy recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

DROP POLICY IF EXISTS "user_roles_select_admin" ON public.user_roles;
CREATE POLICY "user_roles_select_admin" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "user_roles_insert_admin" ON public.user_roles;
CREATE POLICY "user_roles_insert_admin" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "user_roles_delete_admin" ON public.user_roles;
CREATE POLICY "user_roles_delete_admin" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. Shared Lessons Table
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

DROP POLICY IF EXISTS "lessons_select_all" ON public.lessons;
CREATE POLICY "lessons_select_all" ON public.lessons FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "lessons_insert_auth" ON public.lessons;
CREATE POLICY "lessons_insert_auth" ON public.lessons FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "lessons_update_admin" ON public.lessons;
CREATE POLICY "lessons_update_admin" ON public.lessons FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Per-User Lesson Overrides Table
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

DROP POLICY IF EXISTS "overrides_own" ON public.user_lesson_overrides;
CREATE POLICY "overrides_own" ON public.user_lesson_overrides FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. User Completions Table
CREATE TABLE IF NOT EXISTS public.user_completions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, slug)
);

ALTER TABLE public.user_completions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.user_completions TO authenticated;
GRANT ALL ON public.user_completions TO service_role;

DROP POLICY IF EXISTS "completions_own" ON public.user_completions;
CREATE POLICY "completions_own" ON public.user_completions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "completions_admin" ON public.user_completions;
CREATE POLICY "completions_admin" ON public.user_completions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. User Bookmarks Table
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  bookmarked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, slug)
);

ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.user_bookmarks TO authenticated;
GRANT ALL ON public.user_bookmarks TO service_role;

DROP POLICY IF EXISTS "bookmarks_own" ON public.user_bookmarks;
CREATE POLICY "bookmarks_own" ON public.user_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_admin" ON public.user_bookmarks;
CREATE POLICY "bookmarks_admin" ON public.user_bookmarks FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9. User Activity Log Table
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

DROP POLICY IF EXISTS "activity_own" ON public.user_activity;
CREATE POLICY "activity_own" ON public.user_activity FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_insert_own" ON public.user_activity;
CREATE POLICY "activity_insert_own" ON public.user_activity FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_select_admin" ON public.user_activity;
CREATE POLICY "activity_select_admin" ON public.user_activity FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_activity_user ON public.user_activity(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_slug ON public.user_activity(slug, created_at DESC);

-- 10. Auto-create Profile & Assign Role (Admin for anandu2109@gmail% or First User)
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Promote any existing user matching anandu2109@gmail...
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
