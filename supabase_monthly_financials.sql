-- Create the monthly_financials table for the 12-Month Financial Matrix Grid
CREATE TABLE public.monthly_financials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department_id UUID REFERENCES public.department_configs(id) ON DELETE CASCADE,
    month_index INTEGER NOT NULL CHECK (month_index BETWEEN 1 AND 12),
    month_name TEXT NOT NULL,
    direct_cost NUMERIC(15, 2) DEFAULT 0.00,
    overhead_cost NUMERIC(15, 2) DEFAULT 0.00,
    actual_revenue NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(department_id, month_index) -- Ensure only one entry per month per department
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.monthly_financials ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read (adjust as needed for your auth setup)
CREATE POLICY "Enable read access for all users on monthly_financials" 
    ON public.monthly_financials
    FOR SELECT
    USING (true);

-- Insert dummy data for "Engineering & Technology" department
-- Note: Make sure the department_configs table has a record with this name, 
-- or replace the subquery with a valid UUID.
INSERT INTO public.monthly_financials 
    (department_id, month_index, month_name, direct_cost, overhead_cost, actual_revenue)
SELECT 
    id AS department_id,
    month_data.month_index,
    month_data.month_name,
    month_data.direct_cost,
    month_data.overhead_cost,
    month_data.actual_revenue
FROM public.department_configs,
LATERAL (
    VALUES 
        (1, 'Month 1 (Apr)', 45000.00, 15000.00, 75000.00),
        (2, 'Month 2 (May)', 48000.00, 15000.00, 82000.00),
        (3, 'Month 3 (Jun)', 52000.00, 16000.00, 95000.00),
        (4, 'Month 4 (Jul)', 50000.00, 16000.00, 88000.00),
        (5, 'Month 5 (Aug)', 55000.00, 17000.00, 105000.00),
        (6, 'Month 6 (Sep)', 58000.00, 17000.00, 110000.00),
        (7, 'Month 7 (Oct)', 60000.00, 18000.00, 115000.00),
        (8, 'Month 8 (Nov)', 62000.00, 18000.00, 120000.00),
        (9, 'Month 9 (Dec)', 65000.00, 19000.00, 130000.00),
        (10, 'Month 10 (Jan)', 64000.00, 19000.00, 125000.00),
        (11, 'Month 11 (Feb)', 68000.00, 20000.00, 140000.00),
        (12, 'Month 12 (Mar)', 70000.00, 20000.00, 150000.00)
) AS month_data(month_index, month_name, direct_cost, overhead_cost, actual_revenue)
WHERE department_name = 'Engineering & Technology';
