-- Enable RLS on all tables
alter table clients enable row level security;
alter table calls enable row level security;
alter table bookings enable row level security;
alter table admins enable row level security;

-- Clients: read own rows only (matched by Google sub ID)
create policy "clients_read_own" on clients
  for select using (google_id = auth.jwt()->>'sub');

create policy "calls_read_own" on calls
  for select using (
    client_id in (
      select id from clients where google_id = auth.jwt()->>'sub'
    )
  );

create policy "bookings_read_own" on bookings
  for select using (
    client_id in (
      select id from clients where google_id = auth.jwt()->>'sub'
    )
  );
