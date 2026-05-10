-- =====================================================================
-- First Housekeeping — Chat schema
-- Run this ONCE in your Supabase project's SQL editor (Database → SQL).
-- =====================================================================

-- ----------------------------------------------------------------------
-- 1. Tables
-- ----------------------------------------------------------------------

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  session_token uuid unique not null default gen_random_uuid(),
  customer_name text,
  customer_phone text,
  customer_zip text,
  customer_lang text not null default 'en' check (customer_lang in ('en', 'zh')),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unread_for_agent integer not null default 0,
  unread_for_customer integer not null default 0
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender text not null check (sender in ('customer', 'agent')),
  text_original text not null,
  text_translated text,
  lang_original text not null,
  lang_target text,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation_created
  on public.messages(conversation_id, created_at);
create index if not exists idx_conversations_last_message
  on public.conversations(last_message_at desc);

-- ----------------------------------------------------------------------
-- 2. Trigger: keep conversation.last_message_at + unread counts in sync
-- ----------------------------------------------------------------------

create or replace function public.update_conversation_on_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set
    last_message_at = now(),
    unread_for_agent = case
      when new.sender = 'customer' then unread_for_agent + 1
      else unread_for_agent
    end,
    unread_for_customer = case
      when new.sender = 'agent' then unread_for_customer + 1
      else unread_for_customer
    end
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_messages_update_conversation on public.messages;
create trigger trg_messages_update_conversation
after insert on public.messages
for each row execute function public.update_conversation_on_message();

-- ----------------------------------------------------------------------
-- 3. RPC functions (anonymous customer access goes through these,
--    direct table access is blocked by RLS)
-- ----------------------------------------------------------------------

-- Customer sends a message (creates conversation if first time)
create or replace function public.send_customer_message(
  p_session_token uuid,
  p_text text,
  p_lang text default 'en',
  p_customer_name text default null,
  p_customer_phone text default null,
  p_customer_zip text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conv_id uuid;
  v_msg public.messages;
begin
  if p_text is null or btrim(p_text) = '' then
    raise exception 'Message text required';
  end if;
  if p_lang not in ('en', 'zh') then
    p_lang := 'en';
  end if;

  select id into v_conv_id
  from public.conversations
  where session_token = p_session_token;

  if v_conv_id is null then
    insert into public.conversations (
      session_token, customer_lang, customer_name, customer_phone, customer_zip
    )
    values (
      p_session_token, p_lang, p_customer_name, p_customer_phone, p_customer_zip
    )
    returning id into v_conv_id;
  else
    update public.conversations
    set
      customer_name  = coalesce(p_customer_name,  customer_name),
      customer_phone = coalesce(p_customer_phone, customer_phone),
      customer_zip   = coalesce(p_customer_zip,   customer_zip),
      customer_lang  = p_lang,
      unread_for_customer = 0  -- they're actively chatting; clear their unread
    where id = v_conv_id;
  end if;

  insert into public.messages (
    conversation_id, sender, text_original, lang_original
  )
  values (
    v_conv_id, 'customer', p_text, p_lang
  )
  returning * into v_msg;

  return row_to_json(v_msg);
end;
$$;

-- Customer fetches their conversation + all messages
create or replace function public.get_my_conversation(p_session_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conv public.conversations;
  v_msgs json;
begin
  select * into v_conv
  from public.conversations
  where session_token = p_session_token;

  if v_conv.id is null then
    return null;
  end if;

  select coalesce(json_agg(m order by m.created_at), '[]'::json) into v_msgs
  from public.messages m
  where m.conversation_id = v_conv.id;

  return json_build_object(
    'conversation', row_to_json(v_conv),
    'messages', v_msgs
  );
end;
$$;

-- Customer marks agent's messages as read (clears their unread badge)
create or replace function public.mark_customer_read(p_session_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set unread_for_customer = 0
  where session_token = p_session_token;
end;
$$;

-- Allow anon to call these RPCs
grant execute on function public.send_customer_message(uuid, text, text, text, text, text) to anon, authenticated;
grant execute on function public.get_my_conversation(uuid) to anon, authenticated;
grant execute on function public.mark_customer_read(uuid) to anon, authenticated;

-- ----------------------------------------------------------------------
-- 4. Row Level Security (RLS)
-- ----------------------------------------------------------------------

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Authenticated users (admin/mom) can do anything.
drop policy if exists "auth_all_conversations" on public.conversations;
create policy "auth_all_conversations" on public.conversations
  for all to authenticated using (true) with check (true);

drop policy if exists "auth_all_messages" on public.messages;
create policy "auth_all_messages" on public.messages
  for all to authenticated using (true) with check (true);

-- Anon has NO direct table access; they must go through RPC functions above.
-- (No anon policies = denied by default once RLS is on.)

-- ----------------------------------------------------------------------
-- 5. Realtime — enable for messages table so admin sees updates live
-- ----------------------------------------------------------------------
-- (Run only if not already in publication; safe to ignore if it errors.)
do $$
begin
  begin
    alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.conversations;
  exception when duplicate_object then null;
  end;
end $$;
