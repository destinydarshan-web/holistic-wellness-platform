-- FIX RLS PROPERLY - Run this EXACTLY in SQL Editor

alter table expert_astrologers enable row level security;

drop policy if exists "Public can view astrologers" on expert_astrologers;
drop policy if exists "Astrologer can update own profile" on expert_astrologers;
drop policy if exists "Astrologer can insert own row" on expert_astrologers;

create policy "Enable select for all"
on expert_astrologers
for select
using (true);

create policy "Enable insert for authenticated"
on expert_astrologers
for insert
with check (auth.uid() = user_id);

create policy "Enable update for owner"
on expert_astrologers
for update
using (auth.uid() = user_id);

-- Verify policies were created
SELECT * FROM pg_policies WHERE tablename = 'expert_astrologers';
