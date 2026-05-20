-- Migration: 001_create_tables.sql
-- Run this in Supabase SQL Editor (or via your migration tooling)

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Public audit records (shareable)
create table if not exists audits (
  id uuid default gen_random_uuid() primary key,
  slug varchar(12) unique not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  stack_data jsonb not null,
  total_monthly_spend numeric(10,2) not null,
  potential_monthly_savings numeric(10,2) not null,
  potential_annual_savings numeric(10,2) not null,
  audit_recommendations jsonb not null,
  team_size int not null,
  primary_use_case varchar(50) not null
);

-- Private leads (PII) — only accessible via service role
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  audit_id uuid references audits(id) on delete set null,
  email varchar(255) not null,
  company_name varchar(255),
  role varchar(100),
  newsletter_opt_in boolean default false,
  status varchar(50) default 'new',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) guidance
-- audits: make public for SELECT so anonymous/read-only clients can fetch share pages
alter table audits enable row level security;

-- Allow public SELECT on audits (but keep INSERT/UPDATE/DELETE restricted)
create policy public_select on audits
  for select
  using (true);

-- leads: enable RLS and do NOT add public policies — only the service_role key should insert/read
alter table leads enable row level security;

-- Notes:
-- 1) Service role keys bypass RLS; do NOT expose the service_role key to the browser.
-- 2) To allow server-side inserts/queries, use the `SUPABASE_SERVICE_ROLE_KEY` in your server env.
-- 3) If you want authenticated users to create audits, create additional policies scoped to Supabase Auth.

-- Optional: index for quick lookups
create index if not exists idx_audits_slug on audits(slug);
create index if not exists idx_leads_audit_id on leads(audit_id);
