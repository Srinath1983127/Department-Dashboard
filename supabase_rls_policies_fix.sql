-- ==============================================================================
-- COMPREHENSIVE RLS (ROW LEVEL SECURITY) FIX FOR ALL TABLES
-- This script explicitly defines separate SELECT, INSERT, UPDATE, and DELETE 
-- policies for all tables in the database to prevent Row Level Security violations.
-- Run this complete SQL script in your Supabase SQL Editor.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. DEPARTMENT CONFIGS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.department_configs ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.department_configs;
DROP POLICY IF EXISTS "Enable all access for all users on department_configs" ON public.department_configs;
DROP POLICY IF EXISTS "Allow select for all users on department_configs" ON public.department_configs;
DROP POLICY IF EXISTS "Allow insert for all users on department_configs" ON public.department_configs;
DROP POLICY IF EXISTS "Allow update for all users on department_configs" ON public.department_configs;
DROP POLICY IF EXISTS "Allow delete for all users on department_configs" ON public.department_configs;

-- Define explicit policies
CREATE POLICY "Allow select for all users on department_configs" 
    ON public.department_configs FOR SELECT USING (true);

CREATE POLICY "Allow insert for all users on department_configs" 
    ON public.department_configs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all users on department_configs" 
    ON public.department_configs FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for all users on department_configs" 
    ON public.department_configs FOR DELETE USING (true);


-- ------------------------------------------------------------------------------
-- 2. MONTHLY FINANCIALS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.monthly_financials ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Enable read access for all users on monthly_financials" ON public.monthly_financials;
DROP POLICY IF EXISTS "Enable all access for all users on monthly_financials" ON public.monthly_financials;
DROP POLICY IF EXISTS "Allow select for all users on monthly_financials" ON public.monthly_financials;
DROP POLICY IF EXISTS "Allow insert for all users on monthly_financials" ON public.monthly_financials;
DROP POLICY IF EXISTS "Allow update for all users on monthly_financials" ON public.monthly_financials;
DROP POLICY IF EXISTS "Allow delete for all users on monthly_financials" ON public.monthly_financials;

-- Define explicit policies
CREATE POLICY "Allow select for all users on monthly_financials" 
    ON public.monthly_financials FOR SELECT USING (true);

CREATE POLICY "Allow insert for all users on monthly_financials" 
    ON public.monthly_financials FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all users on monthly_financials" 
    ON public.monthly_financials FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for all users on monthly_financials" 
    ON public.monthly_financials FOR DELETE USING (true);


-- ------------------------------------------------------------------------------
-- 3. PROJECTS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Enable read access for all users on projects" ON public.projects;
DROP POLICY IF EXISTS "Enable all access for all users on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow select for all users on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow insert for all users on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow update for all users on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow delete for all users on projects" ON public.projects;

-- Define explicit policies
CREATE POLICY "Allow select for all users on projects" 
    ON public.projects FOR SELECT USING (true);

CREATE POLICY "Allow insert for all users on projects" 
    ON public.projects FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all users on projects" 
    ON public.projects FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for all users on projects" 
    ON public.projects FOR DELETE USING (true);


-- ------------------------------------------------------------------------------
-- 4. PROJECT MONTHLY DATA
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.project_monthly_data ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Enable read access for all users on project_monthly_data" ON public.project_monthly_data;
DROP POLICY IF EXISTS "Enable all access for all users on project_monthly_data" ON public.project_monthly_data;
DROP POLICY IF EXISTS "Allow select for all users on project_monthly_data" ON public.project_monthly_data;
DROP POLICY IF EXISTS "Allow insert for all users on project_monthly_data" ON public.project_monthly_data;
DROP POLICY IF EXISTS "Allow update for all users on project_monthly_data" ON public.project_monthly_data;
DROP POLICY IF EXISTS "Allow delete for all users on project_monthly_data" ON public.project_monthly_data;

-- Define explicit policies
CREATE POLICY "Allow select for all users on project_monthly_data" 
    ON public.project_monthly_data FOR SELECT USING (true);

CREATE POLICY "Allow insert for all users on project_monthly_data" 
    ON public.project_monthly_data FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all users on project_monthly_data" 
    ON public.project_monthly_data FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for all users on project_monthly_data" 
    ON public.project_monthly_data FOR DELETE USING (true);


-- ------------------------------------------------------------------------------
-- 5. PERSONS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.persons ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Enable read access for all users on persons" ON public.persons;
DROP POLICY IF EXISTS "Enable all access for all users on persons" ON public.persons;
DROP POLICY IF EXISTS "Allow select for all users on persons" ON public.persons;
DROP POLICY IF EXISTS "Allow insert for all users on persons" ON public.persons;
DROP POLICY IF EXISTS "Allow update for all users on persons" ON public.persons;
DROP POLICY IF EXISTS "Allow delete for all users on persons" ON public.persons;

-- Define explicit policies
CREATE POLICY "Allow select for all users on persons" 
    ON public.persons FOR SELECT USING (true);

CREATE POLICY "Allow insert for all users on persons" 
    ON public.persons FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all users on persons" 
    ON public.persons FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for all users on persons" 
    ON public.persons FOR DELETE USING (true);


-- ------------------------------------------------------------------------------
-- 6. PROJECT MONTHLY ASSIGNMENTS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.project_monthly_assignments ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Enable read access for all users on project_monthly_assignments" ON public.project_monthly_assignments;
DROP POLICY IF EXISTS "Enable all access for all users on project_monthly_assignments" ON public.project_monthly_assignments;
DROP POLICY IF EXISTS "Allow select for all users on project_monthly_assignments" ON public.project_monthly_assignments;
DROP POLICY IF EXISTS "Allow insert for all users on project_monthly_assignments" ON public.project_monthly_assignments;
DROP POLICY IF EXISTS "Allow update for all users on project_monthly_assignments" ON public.project_monthly_assignments;
DROP POLICY IF EXISTS "Allow delete for all users on project_monthly_assignments" ON public.project_monthly_assignments;

-- Define explicit policies
CREATE POLICY "Allow select for all users on project_monthly_assignments" 
    ON public.project_monthly_assignments FOR SELECT USING (true);

CREATE POLICY "Allow insert for all users on project_monthly_assignments" 
    ON public.project_monthly_assignments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all users on project_monthly_assignments" 
    ON public.project_monthly_assignments FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for all users on project_monthly_assignments" 
    ON public.project_monthly_assignments FOR DELETE USING (true);


-- ------------------------------------------------------------------------------
-- 7. PROJECT ASSIGNMENTS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.project_assignments ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Enable read access for all users on project_assignments" ON public.project_assignments;
DROP POLICY IF EXISTS "Enable all access for all users on project_assignments" ON public.project_assignments;
DROP POLICY IF EXISTS "Allow select for all users on project_assignments" ON public.project_assignments;
DROP POLICY IF EXISTS "Allow insert for all users on project_assignments" ON public.project_assignments;
DROP POLICY IF EXISTS "Allow update for all users on project_assignments" ON public.project_assignments;
DROP POLICY IF EXISTS "Allow delete for all users on project_assignments" ON public.project_assignments;

-- Define explicit policies
CREATE POLICY "Allow select for all users on project_assignments" 
    ON public.project_assignments FOR SELECT USING (true);

CREATE POLICY "Allow insert for all users on project_assignments" 
    ON public.project_assignments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all users on project_assignments" 
    ON public.project_assignments FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for all users on project_assignments" 
    ON public.project_assignments FOR DELETE USING (true);


-- ------------------------------------------------------------------------------
-- 8. PROJECT PERSON MONTHLY PERFORMANCE
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.project_person_monthly_performance ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Enable read access for all users on project_person_monthly_performance" ON public.project_person_monthly_performance;
DROP POLICY IF EXISTS "Enable all access for all users on project_person_monthly_performance" ON public.project_person_monthly_performance;
DROP POLICY IF EXISTS "Allow select for all users on project_person_monthly_performance" ON public.project_person_monthly_performance;
DROP POLICY IF EXISTS "Allow insert for all users on project_person_monthly_performance" ON public.project_person_monthly_performance;
DROP POLICY IF EXISTS "Allow update for all users on project_person_monthly_performance" ON public.project_person_monthly_performance;
DROP POLICY IF EXISTS "Allow delete for all users on project_person_monthly_performance" ON public.project_person_monthly_performance;

-- Define explicit policies
CREATE POLICY "Allow select for all users on project_person_monthly_performance" 
    ON public.project_person_monthly_performance FOR SELECT USING (true);

CREATE POLICY "Allow insert for all users on project_person_monthly_performance" 
    ON public.project_person_monthly_performance FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for all users on project_person_monthly_performance" 
    ON public.project_person_monthly_performance FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for all users on project_person_monthly_performance" 
    ON public.project_person_monthly_performance FOR DELETE USING (true);
