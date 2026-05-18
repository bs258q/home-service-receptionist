create extension if not exists "uuid-ossp";

create table admins (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  google_id text unique not null,
  created_at timestamptz default now()
);

create table clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  business_name text not null,
  email text unique not null,
  google_id text unique,
  twilio_number text,
  vapi_assistant_id text,
  cal_link text,
  owner_cell text not null,
  urgent_keywords text[] default array['emergency','flooding','no heat','gas leak','burst pipe'],
  after_hours_escalate bool default true,
  plan text default 'standard',
  active bool default true,
  created_at timestamptz default now()
);

create table calls (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  caller_number text,
  duration_sec int default 0,
  transcript text,
  intent text check (intent in ('booking','inquiry','escalated','other')),
  booked bool default false,
  escalation_trigger text check (escalation_trigger in ('keyword','ai_failed','user_requested')),
  created_at timestamptz default now()
);

create table bookings (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  call_id uuid references calls(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  service_type text,
  scheduled_at timestamptz,
  cal_event_id text,
  status text default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at timestamptz default now()
);
