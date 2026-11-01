-- ==============================================================================
-- Supabase Schema: Project Planning Matrix & Related Tables Integration
-- Synchronizes: developers, projects, project_monthly_data, project_assignments, project_planning_data
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Ensure developers table has monthly_target column
ALTER TABLE public.developers 
    ADD COLUMN IF NOT EXISTS monthly_target NUMERIC(15, 2) DEFAULT 900000.00;

-- 2. Create dedicated project_planning_data table
CREATE TABLE IF NOT EXISTS public.project_planning_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    developer_id TEXT,
    developer_name TEXT NOT NULL,
    developer_monthly_target NUMERIC(15, 2) DEFAULT 900000.00,
    project_id TEXT,
    project_name TEXT NOT NULL,
    project_value NUMERIC(15, 2) DEFAULT 0.00,
    monthly_values JSONB DEFAULT '[0,0,0,0,0,0,0,0,0,0,0,0]'::jsonb,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.project_planning_data ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policy for application read/write operations
DROP POLICY IF EXISTS "Enable all operations for project_planning_data" ON public.project_planning_data;
CREATE POLICY "Enable all operations for project_planning_data" 
ON public.project_planning_data
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_planning_dev_name ON public.project_planning_data(developer_name);
CREATE INDEX IF NOT EXISTS idx_planning_proj_name ON public.project_planning_data(project_name);
CREATE INDEX IF NOT EXISTS idx_planning_dev_id ON public.project_planning_data(developer_id);
