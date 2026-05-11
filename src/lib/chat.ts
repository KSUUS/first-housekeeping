import { supabase, isSupabaseConfigured, TRANSLATE_URL } from './supabase';
import type { Lang } from '../i18n/translations';

// Re-export so the chat widget can import everything from one place
export { isSupabaseConfigured };

/**
 * Fire a global event the ChatWidget listens for. Lets any CTA on any
 * page open the chat panel without React Router or prop-drilling.
 *
 *   import { openChat } from '../lib/chat';
 *   <button onClick={openChat}>Get a quote</button>
 */
export const OPEN_CHAT_EVENT = 'fh:open-chat';
export function openChat() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
}

const SESSION_KEY = 'fh.chat.session';

export type Sender = 'customer' | 'agent';

export type ConversationStatus =
  | 'new'
  | 'in_progress'
  | 'scheduled'
  | 'completed'
  | 'closed'
  | 'spam';

export type ServiceKey = 'airDuct' | 'dryerVent' | 'carpet';

export interface Conversation {
  id: string;
  session_token: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_address: string | null;
  customer_zip: string | null;
  customer_lang: Lang;
  created_at: string;
  last_message_at: string;
  unread_for_agent: number;
  unread_for_customer: number;
  appointment_at: string | null;       // ISO timestamp
  appointment_service: ServiceKey | string | null;
  appointment_notes: string | null;
  status: ConversationStatus;
  // admin_notes is admin-only; absent on customer-side payload
  admin_notes?: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: Sender;
  text_original: string;
  text_translated: string | null;
  lang_original: string;
  lang_target: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------
// Session token (anonymous identifier for the customer's browser)
// ---------------------------------------------------------------------

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (shouldn't be needed in modern browsers)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getSessionToken(): string {
  if (typeof window === 'undefined') return uuid();
  let token = window.localStorage.getItem(SESSION_KEY);
  if (!token) {
    token = uuid();
    window.localStorage.setItem(SESSION_KEY, token);
  }
  return token;
}

export function resetSessionToken() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
}

// ---------------------------------------------------------------------
// Customer-facing API (anon)
// ---------------------------------------------------------------------

export async function loadConversation(): Promise<{
  conversation: Conversation;
  messages: Message[];
} | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const token = getSessionToken();
  const { data, error } = await supabase.rpc('get_my_conversation', {
    p_session_token: token,
  });
  if (error) {
    // eslint-disable-next-line no-console
    console.error('loadConversation error', error);
    return null;
  }
  if (!data) return null;
  return data as { conversation: Conversation; messages: Message[] };
}

/**
 * Detect the language of an actual chat message from its content.
 * The UI lang toggle is just a display preference — what the customer
 * actually typed is what matters for routing translation.
 *
 * Heuristic: count CJK characters vs Latin letters.
 * - More Chinese than Latin → 'zh'
 * - Otherwise → 'en'
 * - Ties bias to 'en' (safer: translate when in doubt so mom always gets Chinese)
 */
function detectLang(text: string): Lang {
  const cjk = (text.match(/[㐀-鿿　-〿]/g) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  return cjk > latin ? 'zh' : 'en';
}

export async function sendCustomerMessage(input: {
  text: string;
  lang: Lang; // UI lang — kept for legacy reasons but ignored for routing
  customerName?: string;
  customerPhone?: string;
  customerZip?: string;
}): Promise<Message | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const token = getSessionToken();

  // Detect language from the actual text content, not from UI toggle state.
  // (A customer can have the UI in 中文 mode but still type English.)
  const detectedLang = detectLang(input.text);

  const { data, error } = await supabase.rpc('send_customer_message', {
    p_session_token: token,
    p_text: input.text,
    p_lang: detectedLang,
    p_customer_name: input.customerName ?? null,
    p_customer_phone: input.customerPhone ?? null,
    p_customer_zip: input.customerZip ?? null,
  });
  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error('sendCustomerMessage error', error);
    return null;
  }
  const msg = data as Message;

  // Translate if the message isn't already in mom's language
  if (detectedLang !== 'zh') {
    void requestTranslation(msg.id, 'zh');
  }
  return msg;
}

export async function markCustomerRead() {
  if (!isSupabaseConfigured || !supabase) return;
  const token = getSessionToken();
  await supabase.rpc('mark_customer_read', { p_session_token: token });
}

// ---------------------------------------------------------------------
// Translation trigger — fire-and-forget, runs in background
// ---------------------------------------------------------------------

export async function requestTranslation(
  messageId: string,
  targetLang: Lang,
): Promise<void> {
  if (!TRANSLATE_URL) return;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  try {
    await fetch(TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(anonKey ? { authorization: `Bearer ${anonKey}` } : {}),
      },
      body: JSON.stringify({ messageId, targetLang }),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('requestTranslation failed', e);
  }
}

// ---------------------------------------------------------------------
// Polling helper for the customer-side chat (avoids dealing with realtime
// permissions for anon users — simple and reliable for low traffic)
// ---------------------------------------------------------------------

export function startCustomerPolling(
  onUpdate: (data: { conversation: Conversation; messages: Message[] } | null) => void,
  intervalMs = 3000,
): () => void {
  let cancelled = false;
  const tick = async () => {
    if (cancelled) return;
    const data = await loadConversation();
    if (!cancelled) onUpdate(data);
  };
  void tick();
  const id = window.setInterval(tick, intervalMs);
  return () => {
    cancelled = true;
    window.clearInterval(id);
  };
}

// ---------------------------------------------------------------------
// Admin (mom) — authenticated access via Supabase Auth
// ---------------------------------------------------------------------

export async function adminListConversations(): Promise<Conversation[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(200);
  if (error) {
    // eslint-disable-next-line no-console
    console.error('adminListConversations error', error);
    return [];
  }
  return (data ?? []) as Conversation[];
}

export async function adminListMessages(conversationId: string): Promise<Message[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) {
    // eslint-disable-next-line no-console
    console.error('adminListMessages error', error);
    return [];
  }
  return (data ?? []) as Message[];
}

export async function adminSendMessage(
  conversation: Conversation,
  text: string,
): Promise<Message | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      sender: 'agent',
      text_original: text,
      lang_original: 'zh', // mom always types Chinese
    })
    .select()
    .single();
  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error('adminSendMessage error', error);
    return null;
  }
  const msg = data as Message;

  // Translate to customer's language if it's not Chinese
  if (conversation.customer_lang !== 'zh') {
    void requestTranslation(msg.id, conversation.customer_lang);
  }
  return msg;
}

export async function adminMarkRead(conversationId: string) {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase
    .from('conversations')
    .update({ unread_for_agent: 0 })
    .eq('id', conversationId);
}

// ---------------------------------------------------------------------
// Admin: update customer info, appointment, status, notes
// ---------------------------------------------------------------------

export interface ConversationUpdate {
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  customer_address?: string | null;
  customer_zip?: string | null;
  appointment_at?: string | null;
  appointment_service?: string | null;
  appointment_notes?: string | null;
  admin_notes?: string | null;
  status?: ConversationStatus;
}

export async function adminUpdateConversation(
  conversationId: string,
  patch: ConversationUpdate,
): Promise<Conversation | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  // Empty strings become null for cleanliness
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (typeof v === 'string' && v.trim() === '') {
      cleaned[k] = null;
    } else {
      cleaned[k] = v;
    }
  }
  const { data, error } = await supabase
    .from('conversations')
    .update(cleaned)
    .eq('id', conversationId)
    .select()
    .single();
  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error('adminUpdateConversation error', error);
    return null;
  }
  return data as Conversation;
}

// ---------------------------------------------------------------------
// Admin: duplicate detection & merge
// ---------------------------------------------------------------------

/** Find other conversations sharing the same phone or address. */
export async function adminFindDuplicates(conversation: Conversation): Promise<Conversation[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  if (!conversation.customer_phone && !conversation.customer_address) return [];

  const conditions: string[] = [];
  if (conversation.customer_phone) conditions.push(`customer_phone.eq.${conversation.customer_phone}`);
  if (conversation.customer_address) conditions.push(`customer_address.eq.${conversation.customer_address}`);

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .neq('id', conversation.id)
    .neq('status', 'closed')
    .or(conditions.join(','))
    .order('last_message_at', { ascending: false });

  if (error) {
    // eslint-disable-next-line no-console
    console.error('adminFindDuplicates error', error);
    return [];
  }
  return (data ?? []) as Conversation[];
}

/**
 * Merge duplicateId into primaryId:
 * 1. Move all messages to primary.
 * 2. Fill in any missing customer fields on primary from duplicate.
 * 3. Close the duplicate conversation.
 */
export async function adminMergeConversations(
  primaryId: string,
  duplicateId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  // 1. Move messages
  const { error: msgErr } = await supabase
    .from('messages')
    .update({ conversation_id: primaryId })
    .eq('conversation_id', duplicateId);
  if (msgErr) {
    // eslint-disable-next-line no-console
    console.error('adminMergeConversations messages error', msgErr);
    return false;
  }

  // 2. Backfill missing fields on primary
  const [{ data: primary }, { data: dup }] = await Promise.all([
    supabase.from('conversations').select('*').eq('id', primaryId).single(),
    supabase.from('conversations').select('*').eq('id', duplicateId).single(),
  ]);

  if (primary && dup) {
    const patch: Record<string, unknown> = {};
    if (!primary.customer_name && dup.customer_name) patch.customer_name = dup.customer_name;
    if (!primary.customer_phone && dup.customer_phone) patch.customer_phone = dup.customer_phone;
    if (!primary.customer_email && dup.customer_email) patch.customer_email = dup.customer_email;
    if (!primary.customer_address && dup.customer_address) patch.customer_address = dup.customer_address;
    if (!primary.customer_zip && dup.customer_zip) patch.customer_zip = dup.customer_zip;
    if (Object.keys(patch).length > 0) {
      await supabase.from('conversations').update(patch).eq('id', primaryId);
    }
  }

  // 3. Close the duplicate
  const { error: closeErr } = await supabase
    .from('conversations')
    .update({ status: 'closed' })
    .eq('id', duplicateId);
  if (closeErr) {
    // eslint-disable-next-line no-console
    console.error('adminMergeConversations close error', closeErr);
    return false;
  }

  return true;
}

export async function adminListAppointments(): Promise<Conversation[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .not('appointment_at', 'is', null)
    .order('appointment_at', { ascending: true })
    .limit(500);
  if (error) {
    // eslint-disable-next-line no-console
    console.error('adminListAppointments error', error);
    return [];
  }
  return (data ?? []) as Conversation[];
}
