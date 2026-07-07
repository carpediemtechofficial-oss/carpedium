-- ============================================================
-- CARPEDIEM TECH — STUDENT ATTENDANCE MODULE SCHEMA
-- Run in Supabase SQL Editor. Safe to run repeatedly.
-- ============================================================

-- 1. ATTENDANCE RECORDS
CREATE TABLE IF NOT EXISTS public.student_attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT,
    course TEXT,
    batch TEXT,
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('Present', 'Absent', 'Late', 'Leave')) NOT NULL,
    check_in TIME,
    check_out TIME,
    mentor TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_date UNIQUE (student_id, date)
);

-- 2. SYNC LOGS
CREATE TABLE IF NOT EXISTS public.attendance_sync_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('Success', 'Failed')) NOT NULL,
    rows_synced INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.student_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.student_attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.student_attendance(status);

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_attendance, public.attendance_sync_logs TO authenticated, service_role;
GRANT SELECT ON public.student_attendance, public.attendance_sync_logs TO anon;

-- Enable RLS
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sync_logs ENABLE ROW LEVEL SECURITY;

-- Policies (authenticated users have full privileges, public can read)
DO $$
BEGIN
  BEGIN CREATE POLICY "Public select attendance" ON public.student_attendance FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN CREATE POLICY "Admins full attendance" ON public.student_attendance FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated'); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN CREATE POLICY "Public select sync logs" ON public.attendance_sync_logs FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN CREATE POLICY "Admins full sync logs" ON public.attendance_sync_logs FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated'); EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Enable Realtime
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.student_attendance; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_sync_logs; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
