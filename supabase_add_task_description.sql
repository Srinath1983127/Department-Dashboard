-- Run this in your Supabase SQL Editor if you already created the project_assignments table:
ALTER TABLE public.project_assignments 
ADD COLUMN IF NOT EXISTS task_description TEXT;
