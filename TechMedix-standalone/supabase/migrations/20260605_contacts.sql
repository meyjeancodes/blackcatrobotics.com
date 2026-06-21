-- Contacts table for form submissions
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  interest_type text,
  message text,
  product text,
  source text,
  submitted_at timestamptz default now()
);

create index if not exists contacts_email_idx on contacts(email);
create index if not exists contacts_submitted_idx on contacts(submitted_at desc);

-- Enable RLS (optional - service role bypasses it)
alter table contacts enable row level security;

-- Policy: allow service role full access (for API route)
create policy "Service role full access" on contacts
  for all using (auth.role() = 'service_role');

-- Policy: allow authenticated users to read their own submissions (if you add auth later)
-- create policy "Users read own" on contacts for select using (auth.uid() = user_id);