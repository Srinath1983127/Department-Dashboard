-- Migration: Add Project Delivery & Methodology Tracking (Scrum Agile & Kanban)
-- Adds columns to public.projects to track delivery dates, methodology, achieved status, and sprints.

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS methodology TEXT DEFAULT 'scrum' CHECK (methodology IN ('scrum', 'kanban'));

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS final_delivery_date DATE;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS is_delivery_achieved BOOLEAN DEFAULT false;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS achieved_date DATE;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS sprints JSONB DEFAULT '[]'::jsonb;

-- Optional: index on methodology and delivery status
CREATE INDEX IF NOT EXISTS idx_projects_methodology ON public.projects(methodology);
CREATE INDEX IF NOT EXISTS idx_projects_final_delivery_date ON public.projects(final_delivery_date);
