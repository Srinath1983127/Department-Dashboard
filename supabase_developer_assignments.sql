-- SQL Script for Developer & Project Assignments

-- 1. Create Developers Table
CREATE TABLE IF NOT EXISTS public.developers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT,                                      -- e.g., 'Frontend', 'Backend', 'Fullstack'
    skills TEXT[],                                  -- Array of skills, e.g., ARRAY['React', 'NodeJS']
    max_weekly_hours NUMERIC(5,2) DEFAULT 40.00,    -- Availability capacity
    cost_per_hour NUMERIC(10,2) DEFAULT 0.00,       -- Advanced: Track cost rate
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create Projects Table (if you plan to move projects fully to the DB)
-- If your projects are already in another table, you can reference that instead.
CREATE TABLE IF NOT EXISTS public.db_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    client_name TEXT,
    status TEXT DEFAULT 'planning',                 -- 'planning', 'active', 'completed', 'on_hold'
    start_date DATE,
    end_date DATE,
    total_budget NUMERIC(15,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Create Project Assignments Table
CREATE TABLE IF NOT EXISTS public.project_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    developer_id UUID REFERENCES public.developers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,                       -- When the developer starts on this project
    end_date DATE NOT NULL,                         -- When the developer finishes
    allocation_percentage NUMERIC(5,2) DEFAULT 100.00, -- e.g., 50% means half-day allocated to this project
    role_in_project TEXT,                           -- e.g., 'Tech Lead', 'UI Developer'
    task_description TEXT,                          -- Task description / notes for this assignment
    invoice_type TEXT,                              -- e.g., 'Time & Material', 'Monthly Retainer', 'Fixed Price'
    status TEXT DEFAULT 'active',                   -- 'active', 'completed', 'paused'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Migration statement if table already exists:
ALTER TABLE public.project_assignments ADD COLUMN IF NOT EXISTS task_description TEXT;
ALTER TABLE public.project_assignments ADD COLUMN IF NOT EXISTS invoice_type TEXT;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Allows read/write for all users - adjust based on auth requirements)
DROP POLICY IF EXISTS "Enable all access for all users" ON public.developers;
CREATE POLICY "Enable all access for all users" ON public.developers FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON public.db_projects;
CREATE POLICY "Enable all access for all users" ON public.db_projects FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for all users" ON public.project_assignments;
CREATE POLICY "Enable all access for all users" ON public.project_assignments FOR ALL USING (true);

-- 6. Insert Some Dummy Data to Test
INSERT INTO public.developers (name, email, role, skills, max_weekly_hours)
VALUES 
    ('Kasun Perera', 'kasun@example.com', 'Fullstack Developer', ARRAY['React', 'NodeJS', 'PostgreSQL'], 40),
    ('Nimali Fernando', 'nimali@example.com', 'Frontend Engineer', ARRAY['React', 'Tailwind', 'Figma'], 40),
    ('Ruwan Silva', 'ruwan@example.com', 'Backend Lead', ARRAY['Go', 'AWS', 'PostgreSQL'], 30);

INSERT INTO public.db_projects (name, client_name, status, start_date, end_date)
VALUES 
    ('Fintech Dashboard', 'ABC Bank', 'active', '2024-01-01', '2024-06-30'),
    ('E-commerce App', 'Retail XYZ', 'planning', '2024-03-01', '2024-08-31');
    
-- Add sample assignments
-- (You would normally use the UUIDs returned by the previous inserts, these are illustrative)
-- INSERT INTO public.project_assignments (project_id, developer_id, start_date, end_date, allocation_percentage, role_in_project)
-- SELECT p.id, d.id, '2024-01-01', '2024-06-30', 100, 'Frontend Lead' 
-- FROM public.db_projects p, public.developers d 
-- WHERE p.name = 'Fintech Dashboard' AND d.name = 'Nimali Fernando';
