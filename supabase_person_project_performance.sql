-- 1. Create the project_person_monthly_performance table
-- This table tracks the Target Amount and Actual Amount for a specific Person, on a specific Project, for a specific Month.
CREATE TABLE public.project_person_monthly_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL, -- In a real schema: REFERENCES public.projects(id) ON DELETE CASCADE
    person_id UUID NOT NULL, -- In a real schema: REFERENCES public.persons(id) ON DELETE CASCADE
    month_index INTEGER NOT NULL CHECK (month_index BETWEEN 1 AND 12),
    target_amount NUMERIC(15, 2) DEFAULT 0.00,
    actual_amount NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(project_id, person_id, month_index)
);

-- Enable RLS
ALTER TABLE public.project_person_monthly_performance ENABLE ROW LEVEL SECURITY;

-- Read policy
CREATE POLICY "Enable read access for all users on project_person_monthly_performance" 
    ON public.project_person_monthly_performance FOR SELECT USING (true);

-- Insert Dummy Data
-- (Uses the dummy project and person IDs from previous files)
INSERT INTO public.project_person_monthly_performance (project_id, person_id, month_index, target_amount, actual_amount)
VALUES 
    -- John Doe on Project Alpha for Month 1 (Loss of $500)
    ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 1, 5000.00, 4500.00), 
    
    -- John Doe on Project Alpha for Month 2 (Profit of $1000)
    ('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 2, 5000.00, 6000.00), 
    
    -- Jane Smith on Project Alpha for Month 1 (Break-even / Target Met)
    ('11111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 1, 4000.00, 4000.00),
    
    -- Jane Smith on Project Alpha for Month 2 (Loss of $200)
    ('11111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 2, 4000.00, 3800.00);

-- Optional: Create a SQL View to easily fetch the aggregated Person Performance per month 
-- including the computed Profit/Loss.
CREATE OR REPLACE VIEW public.person_monthly_summary AS 
SELECT 
    p.name AS person_name,
    ppm.person_id, 
    ppm.month_index, 
    SUM(ppm.target_amount) AS total_target, 
    SUM(ppm.actual_amount) AS total_actual, 
    SUM(ppm.actual_amount - ppm.target_amount) AS profit_loss
FROM public.project_person_monthly_performance ppm
JOIN public.persons p ON p.id = ppm.person_id
GROUP BY ppm.person_id, p.name, ppm.month_index;
