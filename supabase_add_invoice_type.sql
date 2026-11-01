-- Run this in your Supabase SQL Editor to add the invoice_type column:
ALTER TABLE public.project_assignments 
ADD COLUMN IF NOT EXISTS invoice_type TEXT;
