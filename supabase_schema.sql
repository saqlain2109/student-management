-- ==========================================
-- EDUMANAGE COMPLETE DATABASE SCHEMA SETUP
-- ==========================================
-- Copy and paste this ENTIRE file into the Supabase SQL Editor and click RUN.

-- 1. Create Courses (Master) Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    standard_or_degree TEXT NOT NULL,
    fee_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed comprehensive Indian Education data
INSERT INTO public.courses (name, standard_or_degree, fee_amount) 
SELECT '1st Standard', 'Primary School', 15000 WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE name = '1st Standard');

INSERT INTO public.courses (name, standard_or_degree, fee_amount) 
SELECT '10th Standard', 'High School', 30000 WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE name = '10th Standard');

INSERT INTO public.courses (name, standard_or_degree, fee_amount) 
SELECT '11th Standard (Science)', 'Higher Secondary', 35000 WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE name = '11th Standard (Science)');

INSERT INTO public.courses (name, standard_or_degree, fee_amount) 
SELECT '11th Standard (Commerce)', 'Higher Secondary', 30000 WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE name = '11th Standard (Commerce)');

INSERT INTO public.courses (name, standard_or_degree, fee_amount) 
SELECT '12th Standard (Science)', 'Higher Secondary', 40000 WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE name = '12th Standard (Science)');

INSERT INTO public.courses (name, standard_or_degree, fee_amount) 
SELECT '12th Standard (Commerce)', 'Higher Secondary', 35000 WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE name = '12th Standard (Commerce)');

INSERT INTO public.courses (name, standard_or_degree, fee_amount) 
SELECT 'B.Tech (Computer Science)', 'Graduation', 100000 WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE name = 'B.Tech (Computer Science)');

INSERT INTO public.courses (name, standard_or_degree, fee_amount) 
SELECT 'B.Com (Accounting & Finance)', 'Graduation', 60000 WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE name = 'B.Com (Accounting & Finance)');


-- 2. Create Students Table
CREATE TABLE public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    roll_number TEXT NOT NULL UNIQUE,
    admission_number TEXT NOT NULL UNIQUE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    course TEXT, 
    semester TEXT, 
    phone TEXT,
    email TEXT,
    address TEXT,
    parent_details TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: If you already have the tables created, run this in Supabase SQL editor:
-- ALTER TABLE public.students ADD COLUMN image_url TEXT;


-- 3. Create Fees Table
CREATE TABLE public.fees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) DEFAULT 0,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 4. Create Payments Table
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    fee_id UUID REFERENCES public.fees(id) ON DELETE CASCADE,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_mode TEXT DEFAULT 'Online',
    receipt_number TEXT NOT NULL UNIQUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 5. Disable RLS (Row Level Security) for ease of development
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;


-- 6. Grant Access Permissions
GRANT ALL ON public.courses TO anon, authenticated;
GRANT ALL ON public.students TO anon, authenticated;
GRANT ALL ON public.fees TO anon, authenticated;
GRANT ALL ON public.payments TO anon, authenticated;


-- 7. Force Supabase API (PostgREST) to refresh its cache
NOTIFY pgrst, 'reload schema';
