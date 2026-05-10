-- =====================================================================
-- Migration 001 — Customer info, appointments, admin notes
-- Run this ONCE in your Supabase SQL editor (after schema.sql).
-- Idempotent: safe to re-run.
-- =====================================================================

-- 1. New columns on conversations -----------------------------------------

alter table public.conversations
  add column if not exists customer_email text,
  add column if not exists customer_address text,
  add column if not exists appointment_at timestamptz,
  add column if not exists appointment_service text,
  add column if not exists appointment_notes text,
  add column if not exists admin_notes text,
  add column if not exists status text not null default 'new';

-- Status check (added separately so re-runs don't double-add)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'conversations_status_check'
  ) then
    alter table public.conversations
      add constraint conversations_status_check
      check (status in ('new', 'in_progress', 'scheduled', 'completed', 'closed', 'spam'));
  end if;
end $$;

create index if not exists idx_conversations_appointment
  on public.conversations(appointment_at)
  where appointment_at is not null;

-- 2. Update RPC: get_my_conversation ------------------------------------
-- Customer must NOT see admin_notes. Re-define the function so the JSON
-- it returns excludes that field.

create or replace function public.get_my_conversation(p_session_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conv public.conversations;
  v_msgs json;
  v_safe_conv json;
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

  -- Whitelist: explicitly omit admin_notes from customer-facing payload.
  v_safe_conv := json_build_object(
    'id', v_conv.id,
    'session_token', v_conv.session_token,
    'customer_name', v_conv.customer_name,
    'customer_phone', v_conv.customer_phone,
    'customer_email', v_conv.customer_email,
    'customer_address', v_conv.customer_address,
    'customer_zip', v_conv.customer_zip,
    'customer_lang', v_conv.customer_lang,
    'created_at', v_conv.created_at,
    'last_message_at', v_conv.last_message_at,
    'unread_for_customer', v_conv.unread_for_customer,
    'unread_for_agent', v_conv.unread_for_agent,
    'appointment_at', v_conv.appointment_at,
    'appointment_service', v_conv.appointment_service,
    'appointment_notes', v_conv.appointment_notes,
    'status', v_conv.status
  );

  return json_build_object(
    'conversation', v_safe_conv,
    'messages', v_msgs
  );
end;
$$;

-- 3. RPC: merge_extracted_customer_info --------------------------------
-- Used by the translate Edge Function to fill in any blank customer
-- fields after AI extraction. Never overwrites existing data.

create or replace function public.merge_extracted_customer_info(
  p_conversation_id uuid,
  p_name text default null,
  p_phone text default null,
  p_email text default null,
  p_address text default null,
  p_zip text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set
    customer_name    = coalesce(customer_name,    nullif(btrim(p_name),    '')),
    customer_phone   = coalesce(customer_phone,   nullif(btrim(p_phone),   '')),
    customer_email   = coalesce(customer_email,   nullif(btrim(p_email),   '')),
    customer_address = coalesce(customer_address, nullif(btrim(p_address), '')),
    customer_zip     = coalesce(customer_zip,     nullif(btrim(p_zip),     ''))
  where id = p_conversation_id;
end;
$$;

grant execute on function public.merge_extracted_customer_info(uuid, text, text, text, text, text) to service_role;
