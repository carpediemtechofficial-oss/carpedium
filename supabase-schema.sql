-- ==========================================
-- CARPEDIEM TECH INNOVATIONS - SUPABASE SCHEMA
-- ==========================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLES
-- ==========================================

-- COURSES
CREATE TABLE public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    long_description TEXT,
    overview TEXT,
    difficulty TEXT,
    duration TEXT,
    language TEXT DEFAULT 'English',
    instructor TEXT,
    price TEXT,
    discount_price TEXT,
    course_image TEXT,
    banner_image TEXT,
    preview_video TEXT,
    rating NUMERIC(2,1) DEFAULT 0.0,
    students_enrolled INTEGER DEFAULT 0,
    certificate_included BOOLEAN DEFAULT true,
    projects_included INTEGER DEFAULT 0,
    placement_support BOOLEAN DEFAULT true,
    tools_covered TEXT[], -- Array of strings
    career_outcomes TEXT[], -- Array of strings
    requirements TEXT[], -- Array of strings
    curriculum JSONB, -- Nested curriculum data (modules -> lessons)
    faqs JSONB,
    status TEXT DEFAULT 'draft',
    seo_title TEXT,
    seo_description TEXT,
    meta_keywords TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MENTORS
CREATE TABLE public.mentors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    designation TEXT,
    company TEXT,
    experience TEXT,
    bio TEXT,
    linkedin TEXT,
    github TEXT,
    twitter TEXT,
    website TEXT,
    skills TEXT[],
    profile_image TEXT,
    display_order INTEGER DEFAULT 0,
    featured_toggle BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TESTIMONIALS
CREATE TABLE public.testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_name TEXT NOT NULL,
    photo TEXT,
    course TEXT,
    company TEXT,
    job_role TEXT,
    rating INTEGER DEFAULT 5,
    review TEXT NOT NULL,
    video_testimonial TEXT,
    linkedin TEXT,
    date DATE DEFAULT CURRENT_DATE,
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SETTINGS
CREATE TABLE public.settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROLE GRANTS (required IN ADDITION to RLS)
-- ==========================================
-- RLS controls WHICH ROWS a role can see, but the role still needs the
-- table-level privilege or every request fails with:
--   42501 "permission denied for table ..."
-- (which surfaces to the frontend as a 401). Without these grants the
-- public site cannot read any data even though the RLS policies exist.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.courses, public.mentors, public.testimonials, public.settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE
    ON public.courses, public.mentors, public.testimonials, public.settings TO authenticated;

-- Keep future tables working out of the box.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC ACCESS (Read-only for published content)
CREATE POLICY "Public can view published courses" 
    ON public.courses FOR SELECT 
    USING (is_published = true AND status = 'published');

CREATE POLICY "Public can view active mentors" 
    ON public.mentors FOR SELECT 
    USING (status = 'active');

CREATE POLICY "Public can view published testimonials" 
    ON public.testimonials FOR SELECT 
    USING (status = 'published');

CREATE POLICY "Public can view settings" 
    ON public.settings FOR SELECT 
    USING (true);

-- 2. ADMIN ACCESS (Full CRUD)
-- Note: Replace 'admin@carpediemtech.com' logic with proper auth roles or JWT claims in a real scenario.
-- Here we allow authenticated users (Admins) to do everything.
CREATE POLICY "Admins have full access to courses" 
    ON public.courses FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to mentors" 
    ON public.mentors FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to testimonials" 
    ON public.testimonials FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to settings" 
    ON public.settings FOR ALL 
    USING (auth.role() = 'authenticated');

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Storage RLS
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('media', 'avatars'));
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');

-- ==========================================
-- REALTIME SETUP
-- ==========================================
-- Enable replication for all core tables so our frontend gets instant updates.
-- Wrapped so re-running the schema does not error if a table is already added.
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.courses; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.mentors; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonials; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.settings; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
