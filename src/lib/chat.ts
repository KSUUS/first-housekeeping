import { supabase, isSupabaseConfigured, TRANSLATE_URL } from './supabase';
import type { Lang } from '../i18n/translations';

// Re-export so the chat widget can import everything from one place
export { isSupabaseConfigured };

const SESSION_KEY = 'fh.chat.session';

export type Sender = 'customer' | 'agent';

export interface Conversation {
  id: string;
  session_token: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_zip: string | null;
  customer_lang: Lang;
  created_at: string;
  last_message_at: string;
  unread_for_agent: number;
  unread_for_customer: number;
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

export async function sendCustomerMessage(input: {
  text: string;
  lang: Lang;
  customerName?: string;
  customerPhone?: string;
  customerZip?: string;
}): Promise<Message | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const token = getSessionToken();
  const { data, error } = await supabase.rpc('send_customer_message', {
    p_session_token: token,
    p_text: input.text,
    p_lang: input.lang,
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

  // Trigger background translation if customer language is not Chinese
  // (mom always reads Chinese)
  if (input.lang !== 'zh') {
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
