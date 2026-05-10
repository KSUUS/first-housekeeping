// =====================================================================
// First Housekeeping — Translation Edge Function
//
// Deploy with the Supabase CLI:
//   supabase functions deploy translate --no-verify-jwt
//
// Required secrets (set in Supabase dashboard → Edge Functions → Secrets):
//   ANTHROPIC_API_KEY  — get one at https://console.anthropic.com
//
// Built-in secrets (provided by Supabase automatically):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Called from the frontend right after a message is sent. Translates the
// message to the target language and updates the row.
// =====================================================================

// @ts-nocheck — Deno runtime, types provided by Deno deploy not local.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestBody {
  messageId: string;
  targetLang: 'en' | 'zh';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { messageId, targetLang } = body || ({} as RequestBody);
  if (!messageId || (targetLang !== 'en' && targetLang !== 'zh')) {
    return json({ error: 'messageId and targetLang ("en"|"zh") are required' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!supabaseUrl || !serviceKey) {
    return json({ error: 'Supabase env not configured' }, 500);
  }
  if (!anthropicKey) {
    return json({ error: 'ANTHROPIC_API_KEY not set' }, 500);
  }

  const sb = createClient(supabaseUrl, serviceKey);

  // 1. Fetch the message
  const { data: msg, error: fetchErr } = await sb
    .from('messages')
    .select('id, conversation_id, text_original, lang_original, sender')
    .eq('id', messageId)
    .single();

  if (fetchErr || !msg) {
    return json({ error: 'Message not found', detail: fetchErr?.message }, 404);
  }

  // For customer messages, kick off info extraction in the background
  // (don't block translation on it, don't fail if it errors).
  if (msg.sender === 'customer') {
    extractAndStoreInfo(msg.text_original, msg.conversation_id, anthropicKey, sb).catch(
      (e) => console.error('extractAndStoreInfo failed', e),
    );
  }

  // No-op if source language already matches target
  if (msg.lang_original === targetLang) {
    await sb
      .from('messages')
      .update({ text_translated: msg.text_original, lang_target: targetLang })
      .eq('id', messageId);
    return json({ translated: msg.text_original, skipped: true });
  }

  // 2. Translate via Anthropic Claude
  // Direction matters:
  //  - customer → agent: faithful translation (agent needs to know exactly what customer said)
  //  - agent → customer: polish into warm, professional customer-service tone
  let translated: string;
  try {
    translated = await translate(
      msg.text_original,
      msg.lang_original,
      targetLang,
      msg.sender as 'customer' | 'agent',
      anthropicKey,
    );
  } catch (e) {
    return json({ error: 'Translation failed', detail: String(e) }, 502);
  }

  // 3. Save it back
  const { error: updErr } = await sb
    .from('messages')
    .update({ text_translated: translated, lang_target: targetLang })
    .eq('id', messageId);

  if (updErr) {
    return json({ error: 'Failed to save translation', detail: updErr.message }, 500);
  }

  return json({ translated });
});

async function translate(
  text: string,
  fromLang: string,
  toLang: 'en' | 'zh',
  sender: 'customer' | 'agent',
  apiKey: string,
): Promise<string> {
  const systemPrompt = sender === 'agent'
    ? agentReplyPrompt(fromLang, toLang)
    : customerMessagePrompt(fromLang, toLang);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const block = data?.content?.[0];
  if (!block || block.type !== 'text' || !block.text) {
    throw new Error('Unexpected Anthropic response shape');
  }
  return block.text.trim();
}

/**
 * Customer → Agent: faithful, conversational translation.
 * The agent (mom) needs to understand the customer accurately, including
 * their wording, tone, and any small details (urgency, politeness, etc.).
 */
function customerMessagePrompt(fromLang: string, toLang: 'en' | 'zh'): string {
  const langName = (l: string) => (l === 'zh' ? 'Simplified Chinese (简体中文)' : 'English');
  return [
    `You are translating an incoming chat message from a CUSTOMER to a residential cleaning service`,
    `(air duct, dryer vent, carpet cleaning) operating in metro Atlanta, Georgia.`,
    `Translate the customer's message from ${langName(fromLang)} to ${langName(toLang)}.`,
    ``,
    `Goals:`,
    `- Faithful, accurate translation — do not add information, do not omit information`,
    `- Natural conversational tone (match the customer's register: casual stays casual, formal stays formal)`,
    `- Preserve numbers, addresses, ZIP codes, phone numbers, dates, and times EXACTLY`,
    `- Keep place names (e.g. Duluth, Johns Creek, Sandy Springs) in their original English form`,
    `- Keep brand names and proper nouns in their original form`,
    ``,
    `Return ONLY the translation. No quotes, no commentary, no prefix like "Translation:".`,
  ].join('\n');
}

/**
 * Agent → Customer: polish the owner's reply into professional, warm
 * customer-service English. The owner often types brief, casual Chinese
 * (sometimes with typos or sentence fragments). Our job is to convey her
 * meaning in polished English that builds trust without inventing details.
 */
function agentReplyPrompt(fromLang: string, toLang: 'en' | 'zh'): string {
  const langName = (l: string) => (l === 'zh' ? 'Simplified Chinese (简体中文)' : 'English');
  return [
    `You are helping the Chinese-speaking owner of "First Housekeeping" — a small,`,
    `family-operated residential cleaning service in metro Atlanta (air duct, dryer vent,`,
    `and carpet cleaning) — reply to her English-speaking customer in real-time chat.`,
    ``,
    `Take her ${langName(fromLang)} message and produce a polished ${langName(toLang)} version`,
    `suitable for a professional cleaning company speaking with a homeowner.`,
    ``,
    `Style and tone:`,
    `- Warm, friendly, professional — like a small-business owner who genuinely cares`,
    `- Natural American English (think: a polite small-business reply, not a corporate script)`,
    `- Concise — match the length and intent of her message; never add fluff or marketing`,
    `- If she's asking a question, keep it as a question`,
    `- If she made a commitment (price, time, availability), keep that commitment exactly`,
    ``,
    `Faithfulness rules (very important):`,
    `- Do NOT invent prices, times, addresses, services, or guarantees she did not state`,
    `- Do NOT add details that weren't in her message ("we have 20 years of experience", etc.)`,
    `- Preserve all numbers, addresses, ZIP codes, phone numbers, dates, and times EXACTLY`,
    `- If her Chinese has a typo or odd phrasing, infer the meaning charitably and produce clear English`,
    `- If she uses casual particles (好的, 没问题, 哈), translate the warmth without literal translation`,
    ``,
    `Light polish allowed:`,
    `- Add a polite opening like "Hi!" or "Sure," if her message starts abruptly`,
    `- Smooth out grammar and produce complete sentences`,
    `- Use contractions naturally ("you're", "we'll") for warmth`,
    ``,
    `Return ONLY the polished English message. No quotes, no commentary, no prefix.`,
  ].join('\n');
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

// =====================================================================
// Customer info extraction
// Runs in parallel with translation. Pulls structured contact details
// out of customer messages (names, phones, emails, addresses, ZIPs) and
// merges them into the conversation row — only filling blank fields.
// =====================================================================

interface ExtractedInfo {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  zip?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function extractAndStoreInfo(text: string, conversationId: string, apiKey: string, sb: any) {
  const info = await extractInfo(text, apiKey);
  if (!info) return;
  const hasAny = info.name || info.phone || info.email || info.address || info.zip;
  if (!hasAny) return;

  await sb.rpc('merge_extracted_customer_info', {
    p_conversation_id: conversationId,
    p_name: info.name ?? null,
    p_phone: info.phone ?? null,
    p_email: info.email ?? null,
    p_address: info.address ?? null,
    p_zip: info.zip ?? null,
  });
}

async function extractInfo(text: string, apiKey: string): Promise<ExtractedInfo | null> {
  const systemPrompt = [
    `You extract structured contact info from customer chat messages sent to`,
    `a residential cleaning service in metro Atlanta.`,
    ``,
    `Read the message and pull out any of: name, phone, email, address, ZIP code.`,
    `Return a single JSON object — no other text, no markdown, no commentary.`,
    ``,
    `Schema (omit any field that is not present in the message):`,
    `{`,
    `  "name":    "person's full name as they wrote it",`,
    `  "phone":   "10-digit US phone reformatted as (xxx) xxx-xxxx if recognizable",`,
    `  "email":   "lowercase email",`,
    `  "address": "street address only — number and street, no city/state/zip",`,
    `  "zip":     "5-digit US ZIP code"`,
    `}`,
    ``,
    `Strict rules:`,
    `- ONLY include a field if the customer literally provided that info in this message`,
    `- Do NOT guess, infer, or fabricate any field`,
    `- Do NOT extract from context like "I live in Duluth" — that's a city, not an address`,
    `- "30097" is a ZIP, "770-555-1234" is a phone, etc.`,
    `- If nothing is present, return: {}`,
    ``,
    `Return ONLY the JSON object.`,
  ].join('\n');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 256,
        system: systemPrompt,
        messages: [{ role: 'user', content: text }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const block = data?.content?.[0];
    if (!block || block.type !== 'text') return null;
    const raw = block.text.trim();
    // Tolerate accidental code fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned);
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed as ExtractedInfo;
  } catch (e) {
    console.error('extractInfo error', e);
    return null;
  }
}
