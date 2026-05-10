import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Phone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  isSupabaseConfigured,
  loadConversation,
  sendCustomerMessage,
  startCustomerPolling,
  markCustomerRead,
  type Conversation,
  type Message,
} from '../lib/chat';
import { cn } from '../lib/utils';

export function ChatWidget() {
  if (!isSupabaseConfigured) return <ChatFallback />;
  return <RealChat />;
}

// ---------------------------------------------------------------------
// Real chat (Supabase configured)
// ---------------------------------------------------------------------

function RealChat() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    void loadConversation().then((data) => {
      if (data) {
        setConversation(data.conversation);
        setMessages(data.messages);
      }
    });
  }, []);

  // Poll while panel is open
  useEffect(() => {
    if (!open) return;
    const stop = startCustomerPolling((data) => {
      if (data) {
        setConversation(data.conversation);
        setMessages(data.messages);
      }
    }, 3000);
    return stop;
  }, [open]);

  // Mark read when there are unread messages and panel is open
  useEffect(() => {
    if (open && conversation && conversation.unread_for_customer > 0) {
      void markCustomerRead();
    }
  }, [open, conversation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const optimisticId = `tmp-${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      conversation_id: conversation?.id ?? '',
      sender: 'customer',
      text_original: text,
      text_translated: null,
      lang_original: lang,
      lang_target: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');

    const real = await sendCustomerMessage({ text, lang });
    setSending(false);
    if (real) {
      setMessages((prev) => prev.map((m) => (m.id === optimisticId ? real : m)));
      // Reload conversation for any newly-created record
      const data = await loadConversation();
      if (data) setConversation(data.conversation);
    } else {
      // Mark optimistic as failed (visual)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId ? { ...m, text_original: m.text_original + ' ⚠️' } : m,
        ),
      );
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const unread = conversation?.unread_for_customer ?? 0;

  return (
    <>
      <Bubble open={open} unread={open ? 0 : unread} onClick={() => setOpen((o) => !o)} label={t.chat.bubbleLabel} />
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-96 max-w-[calc(100vw-2.5rem)] h-[34rem] max-h-[calc(100vh-7rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white px-5 py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold leading-tight">{t.chat.title}</div>
              <div className="text-xs text-brand-100 mt-0.5">{t.chat.subtitle}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
            {/* Welcome bubble (always shown if no messages yet) */}
            {messages.length === 0 && <WelcomeBubble text={t.chat.welcomeBubble} />}

            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} customerLang={lang} t={t} />
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 bg-white p-3">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder={t.chat.placeholder}
                className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 max-h-32"
                disabled={sending}
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!input.trim() || sending}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-500 text-white hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={t.chat.send}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function WelcomeBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-sm text-slate-700 shadow-sm">
        {text}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  customerLang,
  t,
}: {
  message: Message;
  customerLang: 'en' | 'zh';
  t: ReturnType<typeof useLanguage>['t'];
}) {
  const isCustomer = message.sender === 'customer';

  // What text do we display?
  // - Customer's own messages: their original text
  // - Agent's (mom's) messages: translated into customer's lang if available
  let display = message.text_original;
  let isTranslated = false;
  if (!isCustomer) {
    if (message.text_translated && customerLang !== message.lang_original) {
      display = message.text_translated;
      isTranslated = true;
    }
  }

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className={cn('flex', isCustomer ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
          isCustomer
            ? 'bg-accent-500 text-white rounded-br-sm'
            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm',
        )}
      >
        <div className="whitespace-pre-wrap break-words">{display}</div>
        <div
          className={cn(
            'mt-1 text-[10px] flex items-center gap-1',
            isCustomer ? 'text-accent-100' : 'text-slate-400',
          )}
        >
          {isTranslated && <span className="italic">· {t.chat.translatedNote}</span>}
          <span className="ml-auto">{time}</span>
        </div>
      </div>
    </div>
  );
}

function Bubble({
  open,
  unread,
  onClick,
  label,
}: {
  open: boolean;
  unread: number;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-5 right-5 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-500 text-white shadow-xl hover:bg-accent-600 transition-all hover:scale-105"
      aria-label={label}
    >
      {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      {!open && unread > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold border-2 border-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------
// Fallback shown when Supabase isn't configured yet
// ---------------------------------------------------------------------

function ChatFallback() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const tel = t.brand.phone.replace(/[^\d+]/g, '');

  return (
    <>
      <Bubble open={open} unread={0} onClick={() => setOpen((o) => !o)} label={t.chat.bubbleLabel} />
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 text-white px-5 py-4">
            <div className="font-semibold">{t.chat.title}</div>
            <p className="mt-1 text-sm text-brand-100">{t.chat.offline}</p>
          </div>
          <div className="p-4 space-y-2">
            <a href={`tel:${tel}`} className="btn-accent w-full text-sm py-2.5">
              <Phone className="w-4 h-4" />
              {t.chat.callBtn}
              {t.brand.phone}
            </a>
            <a href={`sms:${tel}`} className="btn-ghost w-full text-sm py-2.5">
              {t.chat.smsBtn}
            </a>
            <a href={`mailto:${t.brand.email}`} className="btn-ghost w-full text-sm py-2.5">
              {t.chat.emailBtn}
            </a>
            {import.meta.env.DEV && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900 leading-relaxed">
                <strong>Dev note ({lang}):</strong> Live chat needs Supabase env vars.
                See <code className="bg-amber-100 px-1 rounded">README.md</code> → "Chat setup".
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
