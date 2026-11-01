ALTER TABLE public.project_assignments
DROP CONSTRAINT IF EXISTS project_assignments_project_id_fkey;

ALTER TABLE public.project_assignments
ADD CONSTRAINT project_assignments_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
