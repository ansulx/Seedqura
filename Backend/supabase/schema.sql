-- Seedqura student platform schema
-- Run in Supabase SQL Editor or via: npm run db:migrate (Backend)

create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'student' check (role in ('student', 'admin')),
  institution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Courses (seeded from Frontend/data/courses.json)
create table if not exists public.courses (
  id text primary key,
  name text not null,
  tagline text,
  description text,
  category text,
  level text,
  duration text,
  format text,
  price_inr integer,
  currency text not null default 'INR',
  price_display text,
  status text not null default 'Open',
  featured boolean not null default false,
  features jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Applications
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses (id),
  name text not null,
  email text not null,
  phone text not null,
  institution text not null,
  year text not null,
  interest text not null,
  statement text not null,
  portfolio text,
  status text not null default 'payment_pending'
    check (status in ('payment_pending', 'paid', 'active', 'rejected', 'refunded')),
  user_id uuid references auth.users (id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_email_idx on public.applications (email);
create index if not exists applications_course_id_idx on public.applications (course_id);
create index if not exists applications_status_idx on public.applications (status);
create index if not exists applications_created_at_idx on public.applications (created_at desc);

-- Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  razorpay_signature text,
  amount integer not null,
  currency text not null default 'INR',
  status text not null default 'created'
    check (status in ('created', 'paid', 'failed', 'refunded')),
  raw_webhook jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_application_id_idx on public.payments (application_id);
create index if not exists payments_order_id_idx on public.payments (razorpay_order_id);

-- Enrollments
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null references public.courses (id),
  application_id uuid references public.applications (id) on delete set null,
  status text not null default 'active'
    check (status in ('active', 'revoked', 'completed')),
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists enrollments_user_id_idx on public.enrollments (user_id);

-- Seed payable + catalog courses
insert into public.courses (
  id, name, tagline, description, category, level, duration, format,
  price_inr, currency, price_display, status, featured, features
) values
  (
    'academy',
    'Seedqura Academy',
    'Research mentorship program',
    'A structured mentorship for students — guided projects in AI for agriculture and medicine.',
    'Program', 'Intermediate', '12 weeks', 'Live sessions + 1:1 mentorship',
    24999, 'INR', '₹24,999', 'Now Enrolling', true,
    '["Mentor-led research projects","Live foundational sessions","Publication-oriented outcomes","Certificate on completion"]'::jsonb
  ),
  (
    'crop-vision',
    'Crop Vision with PyTorch',
    'Computer vision for field intelligence',
    'Build and deploy disease-detection models for agricultural imagery.',
    'Course', 'Intermediate', '6 weeks', 'Self-paced + live labs',
    4999, 'INR', '₹4,999', 'Open', true,
    '["Multispectral & RGB pipelines","Hands-on PyTorch projects","Model evaluation frameworks","Deployment walkthrough"]'::jsonb
  ),
  (
    'clinical-ai',
    'Clinical AI Fundamentals',
    'Medical imaging & decision support',
    'Introduction to hospital-grade AI workflows for healthcare settings.',
    'Course', 'Advanced', '8 weeks', 'Live cohort',
    6999, 'INR', '₹6,999', 'Open', false,
    '["X-ray & MRI triage basics","Clinical pathway NLP","Regulatory awareness module","Case studies from pilots"]'::jsonb
  ),
  (
    'remote-sensing',
    'Remote Sensing for Agriculture',
    'Satellite analytics at scale',
    'Process aerial and satellite data for crop monitoring and yield estimation.',
    'Course', 'Intermediate', '5 weeks', 'Self-paced',
    null, 'INR', 'Coming soon', 'Coming Soon', false,
    '["Sentinel & drone data workflows","Time-series crop analytics","GIS + ML integration","Field deployment patterns"]'::jsonb
  ),
  (
    'research-pilots',
    'Research Pilots',
    'Enterprise & hospital partnerships',
    'Hospital and field deployment tools under active development.',
    'Partnership', 'Enterprise', 'Custom', 'Dedicated engagement',
    null, 'INR', 'Custom', 'By inquiry', false,
    '["Custom synthetic populations","Validation studies","On-site integration support","Dedicated success manager"]'::jsonb
  )
on conflict (id) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  category = excluded.category,
  level = excluded.level,
  duration = excluded.duration,
  format = excluded.format,
  price_inr = excluded.price_inr,
  currency = excluded.currency,
  price_display = excluded.price_display,
  status = excluded.status,
  featured = excluded.featured,
  features = excluded.features;

-- Auto-create profile on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.applications enable row level security;
alter table public.payments enable row level security;
alter table public.enrollments enable row level security;

-- Courses: public read
drop policy if exists "Courses are publicly readable" on public.courses;
create policy "Courses are publicly readable"
  on public.courses for select
  using (true);

-- Profiles: users read/update own
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Applications: students read own by user_id or email match via auth
drop policy if exists "Users can read own applications" on public.applications;
create policy "Users can read own applications"
  on public.applications for select
  using (
    auth.uid() = user_id
    or lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  );

-- Enrollments: students read own
drop policy if exists "Users can read own enrollments" on public.enrollments;
create policy "Users can read own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id);

-- Payments: students read via their applications
drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.applications a
      where a.id = payments.application_id
        and (a.user_id = auth.uid() or lower(a.email) = lower(coalesce(auth.jwt()->>'email', '')))
    )
  );
