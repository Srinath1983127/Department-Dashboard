-- ==============================================================================
-- Supabase Schema Update: Project Forecasts with Milestone Dates
-- Adds: cbsd_date, dev_handover_date, uat_date, go_live_date
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.project_forecasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    estimated_value NUMERIC(15, 2) DEFAULT 0.00,
    priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
    status TEXT DEFAULT 'unplanned' CHECK (status IN ('planned', 'unplanned')),
    cbsd_date DATE,
    dev_handover_date DATE,
    uat_date DATE,
    go_live_date DATE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. If table already exists, safely add the new milestone date columns
ALTER TABLE public.project_forecasts 
    ADD COLUMN IF NOT EXISTS cbsd_date DATE,
    ADD COLUMN IF NOT EXISTS dev_handover_date DATE,
    ADD COLUMN IF NOT EXISTS uat_date DATE,
    ADD COLUMN IF NOT EXISTS go_live_date DATE;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.project_forecasts ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policy for application read/write operations
DROP POLICY IF EXISTS "Enable all operations for project_forecasts" ON public.project_forecasts;
CREATE POLICY "Enable all operations for project_forecasts" 
ON public.project_forecasts
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Create performance indexes for date and status queries
CREATE INDEX IF NOT EXISTS idx_project_forecasts_go_live ON public.project_forecasts(go_live_date);
CREATE INDEX IF NOT EXISTS idx_project_forecasts_cbsd ON public.project_forecasts(cbsd_date);
CREATE INDEX IF NOT EXISTS idx_project_forecasts_dev_handover ON public.project_forecasts(dev_handover_date);
CREATE INDEX IF NOT EXISTS idx_project_forecasts_uat ON public.project_forecasts(uat_date);
CREATE INDEX IF NOT EXISTS idx_project_forecasts_priority ON public.project_forecasts(priority);
CREATE INDEX IF NOT EXISTS idx_project_forecasts_status ON public.project_forecasts(status);

-- 6. Column comments for documentation
COMMENT ON COLUMN public.project_forecasts.cbsd_date IS 'Concept Brief / Business Solution Design Date';
COMMENT ON COLUMN public.project_forecasts.dev_handover_date IS 'Development Handover Date';
COMMENT ON COLUMN public.project_forecasts.uat_date IS 'User Acceptance Testing (UAT) Target Date';
COMMENT ON COLUMN public.project_forecasts.go_live_date IS 'Target Production Go Live Date';
