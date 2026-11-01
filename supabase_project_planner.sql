-- 1. Create the projects table
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pipeline', 'Won')),
    contract_value NUMERIC(15, 2) DEFAULT 0.00,
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    next_year_rollover NUMERIC(15, 2) DEFAULT 0.00,
    -- Project Delivery Schedule & Tracking columns
    methodology TEXT DEFAULT 'scrum' CHECK (methodology IN ('scrum', 'kanban')),
    final_delivery_date DATE,
    is_delivery_achieved BOOLEAN DEFAULT false,
    achieved_date DATE,
    sprints JSONB DEFAULT '[]'::jsonb,
    delivery_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create the project_monthly_data table (Forecast & Invoiced Status per month)
CREATE TABLE public.project_monthly_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    month_index INTEGER NOT NULL CHECK (month_index BETWEEN 1 AND 12),
    forecast_value NUMERIC(15, 2) DEFAULT 0.00,
    is_invoiced BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(project_id, month_index)
);

-- 3. Create a persons table (Resource pool)
CREATE TABLE public.persons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    daily_rate NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Create project_monthly_assignments table (Who works on what, when, and for how many days)
CREATE TABLE public.project_monthly_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    person_id UUID REFERENCES public.persons(id) ON DELETE CASCADE,
    month_index INTEGER NOT NULL CHECK (month_index BETWEEN 1 AND 12),
    days_per_month INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(project_id, person_id, month_index)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_monthly_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_monthly_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (Modify for your actual Auth setup)
CREATE POLICY "Enable read access for all users on projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on project_monthly_data" ON public.project_monthly_data FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on persons" ON public.persons FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on project_monthly_assignments" ON public.project_monthly_assignments FOR SELECT USING (true);

-- Insert Dummy Data

-- Insert Projects
INSERT INTO public.projects (id, name, category, status, contract_value, probability, next_year_rollover)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Project Alpha', 'Development', 'Won', 120000.00, 100, 20000.00),
    ('22222222-2222-2222-2222-222222222222', 'Project Beta', 'Consulting', 'Pipeline', 80000.00, 75, 0.00);

-- Insert Project Monthly Data (Forecast & Invoice plan) for Project Alpha
INSERT INTO public.project_monthly_data (project_id, month_index, forecast_value, is_invoiced)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 1, 10000.00, true),
    ('11111111-1111-1111-1111-111111111111', 2, 10000.00, true),
    ('11111111-1111-1111-1111-111111111111', 3, 10000.00, false),
    ('11111111-1111-1111-1111-111111111111', 4, 15000.00, false),
    ('11111111-1111-1111-1111-111111111111', 5, 15000.00, false),
    ('11111111-1111-1111-1111-111111111111', 6, 15000.00, false),
    ('11111111-1111-1111-1111-111111111111', 7, 5000.00, false),
    ('11111111-1111-1111-1111-111111111111', 8, 5000.00, false),
    ('11111111-1111-1111-1111-111111111111', 9, 5000.00, false),
    ('11111111-1111-1111-1111-111111111111', 10, 5000.00, false),
    ('11111111-1111-1111-1111-111111111111', 11, 2500.00, false),
    ('11111111-1111-1111-1111-111111111111', 12, 2500.00, false);

-- Insert Project Monthly Data for Project Beta (Pipeline)
INSERT INTO public.project_monthly_data (project_id, month_index, forecast_value, is_invoiced)
VALUES 
    ('22222222-2222-2222-2222-222222222222', 1, 0.00, false),
    ('22222222-2222-2222-2222-222222222222', 2, 10000.00, false),
    ('22222222-2222-2222-2222-222222222222', 3, 20000.00, false),
    ('22222222-2222-2222-2222-222222222222', 4, 20000.00, false),
    ('22222222-2222-2222-2222-222222222222', 5, 20000.00, false),
    ('22222222-2222-2222-2222-222222222222', 6, 10000.00, false);

-- Insert Persons
INSERT INTO public.persons (id, name, role, daily_rate)
VALUES 
    ('33333333-3333-3333-3333-333333333333', 'Alice Smith', 'Senior Developer', 600.00),
    ('44444444-4444-4444-4444-444444444444', 'Bob Jones', 'Project Manager', 800.00);

-- Insert Project Monthly Assignments
-- Assign Alice and Bob to Project Alpha for Month 1
INSERT INTO public.project_monthly_assignments (project_id, person_id, month_index, days_per_month)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 1, 10),
    ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 1, 5),
    ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 2, 12);

-- 5. Create project_milestones table (payment milestones without month values)
CREATE TABLE public.project_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS for milestones
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access on milestones
CREATE POLICY "Enable read access for all users on project_milestones" ON public.project_milestones FOR SELECT USING (true);


-- ============================================================================
-- MIGRATION SCRIPT FOR EXISTING DATABASE (Run in Supabase SQL Editor):
-- Adds delivery schedule, methodology, sprints JSON, and delivery status to existing projects table.
-- ============================================================================

ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS methodology TEXT DEFAULT 'scrum' CHECK (methodology IN ('scrum', 'kanban')),
  ADD COLUMN IF NOT EXISTS final_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS is_delivery_achieved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS achieved_date DATE,
  ADD COLUMN IF NOT EXISTS sprints JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

