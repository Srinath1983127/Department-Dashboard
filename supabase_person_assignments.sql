-- 1. Create the persons table (Resource Pool)
CREATE TABLE public.persons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    daily_cost NUMERIC(15, 2) DEFAULT 0.00,
    target_billable_days_per_month INTEGER DEFAULT 20, -- Used for Person Performance Tracking
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create the project_assignments table (Who works on which project, in which month, for how many days)
CREATE TABLE public.project_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL, -- In a full schema, this should be: REFERENCES public.projects(id) ON DELETE CASCADE
    person_id UUID REFERENCES public.persons(id) ON DELETE CASCADE,
    month_index INTEGER NOT NULL CHECK (month_index BETWEEN 1 AND 12),
    days_allocated INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(project_id, person_id, month_index)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (Adjust based on your Auth requirements)
CREATE POLICY "Enable read access for all users on persons" ON public.persons FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on project_assignments" ON public.project_assignments FOR SELECT USING (true);

-- Insert Dummy Data for Persons
INSERT INTO public.persons (id, name, role, daily_cost, target_billable_days_per_month)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', 'John Doe', 'Senior Developer', 450.00, 20),
    ('b2222222-2222-2222-2222-222222222222', 'Jane Smith', 'Project Manager', 550.00, 18),
    ('c3333333-3333-3333-3333-333333333333', 'Mike Johnson', 'UI/UX Designer', 400.00, 20);

-- Insert Dummy Data for Project Assignments
-- Note: Replace '11111111-1111-1111-1111-111111111111' with a valid project_id from your projects table
INSERT INTO public.project_assignments (project_id, person_id, month_index, days_allocated)
VALUES 
    -- John Doe's assignments for Month 1 (Apr) and Month 2 (May)
    ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 1, 15),
    ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 2, 10),
    
    -- Jane Smith's assignments
    ('11111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 1, 5),
    ('11111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 2, 8),
    
    -- Mike Johnson's assignments
    ('11111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 3, 12);
