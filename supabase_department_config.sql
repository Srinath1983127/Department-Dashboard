-- SQL Migration to add last_year_loss_profit to existing table:
ALTER TABLE public.department_configs 
ADD COLUMN IF NOT EXISTS last_year_loss_profit NUMERIC(15, 2) DEFAULT 0.00;

-- Complete Create Table script for department_configs:
CREATE TABLE IF NOT EXISTS public.department_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department_name TEXT NOT NULL,
    yearly_budget NUMERIC(15, 2) NOT NULL,
    fiscal_year TEXT NOT NULL,
    currency_symbol TEXT NOT NULL,
    target_margin_percentage NUMERIC(5, 2) NOT NULL,
    last_year_loss_profit NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.department_configs ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read/write/update
DROP POLICY IF EXISTS "Enable all access for all users" ON public.department_configs;
CREATE POLICY "Enable all access for all users" ON public.department_configs
    FOR ALL
    USING (true)
    WITH CHECK (true);

