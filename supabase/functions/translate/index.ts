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
    .select('id, text_original, lang_original')
    .eq('id', messageId)
    .single();

  if (fetchErr || !msg) {
    return json({ error: 'Message not found', detail: fetchErr?.message }, 404);
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
  let translated: string;
  try {
    translated = await translate(msg.text_original, msg.lang_original, targetLang, anthropicKey);
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
  apiKey: string,
): Promise<string> {
  const langName = (l: string) => (l === 'zh' ? 'Simplified Chinese (简体中文)' : 'English');

  const systemPrompt =
    `You are translating live chat messages between a residential cleaning service ` +
    `(air duct, dryer vent, carpet cleaning) and its customers in metro Atlanta. ` +
    `Translate the user's message from ${langName(fromLang)} to ${langName(toLang)}. ` +
    `Keep the tone friendly and conversational. Preserve numbers, addresses, ZIP codes, ` +
    `phone numbers, dates, and times exactly. ` +
    `Return ONLY the translation — no quotes, no commentary, no prefix like "Translation:".`;

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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}
