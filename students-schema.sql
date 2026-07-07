-- ============================================================
-- CARPEDIEM TECH — STUDENTS CRM / ERP MODULE
-- Run once in the Supabase SQL Editor (Dashboard → SQL Editor).
-- Adds the students module tables with relationships to courses &
-- mentors, plus RLS, grants, and realtime. Safe to re-run.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── STUDENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- Personal
    full_name TEXT NOT NULL,
    profile_photo TEXT,
    gender TEXT,
    date_of_birth DATE,
    email TEXT,
    mobile TEXT,
    alternate_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',

    -- Course (relationship to courses + mentors)
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    course_name TEXT,
    batch TEXT,
    enrollment_date DATE,
    expected_completion_date DATE,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE SET NULL,
    mentor_name TEXT,
    learning_mode TEXT DEFAULT 'Online',   -- Online / Offline / Hybrid

    -- Attendance
    attendance_percentage NUMERIC(5,2) DEFAULT 0,
    total_classes INTEGER DEFAULT 0,
    classes_attended INTEGER DEFAULT 0,

    -- Project
    project_title TEXT,
    github_link TEXT,
    drive_link TEXT,
    live_demo_link TEXT,
    project_status TEXT DEFAULT 'Not Started', -- Not Started / In Progress / Completed
    mentor_feedback TEXT,

    -- Certification
    certificate_issued BOOLEAN DEFAULT false,
    certificate_number TEXT,
    certificate_verification_url TEXT,
    certificate_issue_date DATE,

    -- Placement
    resume_link TEXT,
    linkedin TEXT,
    portfolio TEXT,
    current_company TEXT,
    job_role TEXT,
    salary_package TEXT,
    placement_status TEXT DEFAULT 'Not Placed', -- Not Placed / In Process / Placed

    -- Documents (public URLs from storage)
    doc_resume TEXT,
    doc_id_proof TEXT,
    doc_offer_letter TEXT,
    doc_internship_certificate TEXT,
    doc_course_certificate TEXT,

    -- ERP (fees summary)
    fees_total NUMERIC(10,2) DEFAULT 0,
    fees_paid NUMERIC(10,2) DEFAULT 0,
    pending_fees NUMERIC(10,2) DEFAULT 0,
    invoice_number TEXT,

    -- CRM
    lead_status TEXT DEFAULT 'Enrolled',
    counsellor_notes TEXT,

    -- Notes
    admin_notes TEXT,
    mentor_notes TEXT,

    status TEXT DEFAULT 'active', -- active / completed / dropped
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── STUDENT INTERACTIONS (CRM history) ──────────────────────
CREATE TABLE IF NOT EXISTS public.student_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'Note',   -- Call / WhatsApp / Email / Follow-up / Note
    notes TEXT,
    follow_up_date DATE,
    lead_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── STUDENT PAYMENTS (ERP history / installments) ───────────
CREATE TABLE IF NOT EXISTS public.student_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) DEFAULT 0,
    installment_no INTEGER,
    invoice_number TEXT,
    receipt_url TEXT,
    method TEXT,
    payment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_course ON public.students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_mentor ON public.students(mentor_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_interactions_student ON public.student_interactions(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.student_payments(student_id);

-- ── ROLE GRANTS ─────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE
    ON public.students, public.student_interactions, public.student_payments
    TO authenticated, service_role;

-- ── RLS (admin-only data; authenticated admins have full access) ──
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  BEGIN CREATE POLICY "Admins full access to students" ON public.students FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated'); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN CREATE POLICY "Admins full access to interactions" ON public.student_interactions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated'); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN CREATE POLICY "Admins full access to payments" ON public.student_payments FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated'); EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ── REALTIME ────────────────────────────────────────────────
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.students; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.student_interactions; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.student_payments; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
