import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, LogOut, Send, MapPin, Phone, RefreshCw } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  adminListConversations,
  adminListMessages,
  adminSendMessage,
  adminMarkRead,
  type Conversation,
  type Message,
} from '../lib/chat';
import { cn } from '../lib/utils';

export function Admin() {
  const { t } = useLanguage();
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="container-tight py-16 max-w-xl">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h1 className="text-2xl font-bold">{t.admin.pageTitle}</h1>
          <p className="mt-3 text-sm leading-relaxed">{t.admin.configMissing}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-tight py-16 text-center text-slate-500">
        {t.admin.loading}
      </div>
    );
  }

  if (!session) return <LoginForm />;

  return <Dashboard />;
}

// ---------------------------------------------------------------------
// Login form
// ---------------------------------------------------------------------

function LoginForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) setError(t.admin.loginError);
  };

  return (
    <div className="container-tight py-16 max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">{t.admin.loginTitle}</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="adm-email">{t.admin.emailLabel}</label>
            <input
              id="adm-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="adm-pw">{t.admin.passwordLabel}</label>
            <input
              id="adm-pw"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? t.admin.loading : t.admin.loginBtn}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Dashboard (after login)
// ---------------------------------------------------------------------

function Dashboard() {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    const list = await adminListConversations();
    setConversations(list);
    setRefreshing(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  // Realtime: refresh conversation list whenever a new message lands
  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel('admin-conv-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => void refresh(),
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
  }, []);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="container-tight py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">{t.admin.pageTitle}</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              className="btn-ghost text-sm py-1.5"
              disabled={refreshing}
            >
              <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="btn-ghost text-sm py-1.5"
            >
              <LogOut className="w-4 h-4" />
              {t.admin.logoutBtn}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[20rem_1fr] gap-4 h-[calc(100vh-12rem)] min-h-[30rem]">
          {/* Conversation list — hide on mobile when one is selected */}
          <div
            className={cn(
              'rounded-2xl border border-slate-200 bg-white overflow-y-auto',
              selectedId && 'hidden lg:block',
            )}
          >
            <div className="px-4 py-3 border-b border-slate-200 sticky top-0 bg-white">
              <div className="font-semibold text-sm">{t.admin.conversationsTitle}</div>
            </div>
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">{t.admin.empty}</div>
            ) : (
              <ul>
                {conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        'w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50',
                        selectedId === c.id && 'bg-brand-50',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm text-slate-900 truncate">
                          {c.customer_name || t.admin.anonymousCustomer}
                        </div>
                        {c.unread_for_agent > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
                            {c.unread_for_agent}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500 flex items-center gap-2">
                        <span>{formatTime(c.last_message_at)}</span>
                        <span>·</span>
                        <span>{c.customer_lang.toUpperCase()}</span>
                        {c.customer_zip && (
                          <>
                            <span>·</span>
                            <span>{c.customer_zip}</span>
                          </>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Message pane */}
          <div
            className={cn(
              'rounded-2xl border border-slate-200 bg-white flex flex-col overflow-hidden',
              !selectedId && 'hidden lg:flex',
            )}
          >
            {selected ? (
              <ConversationPane
                conversation={selected}
                onBack={() => setSelectedId(null)}
                onAfterSend={() => void refresh()}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
                {t.admin.noSelection}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationPane({
  conversation,
  onBack,
  onAfterSend,
}: {
  conversation: Conversation;
  onBack: () => void;
  onAfterSend: () => void;
}) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refresh = async () => {
    const list = await adminListMessages(conversation.id);
    setMessages(list);
  };

  useEffect(() => {
    void refresh();
    void adminMarkRead(conversation.id);
  }, [conversation.id]);

  // Realtime updates for this conversation
  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel(`admin-conv-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        () => void refresh(),
      )
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const msg = await adminSendMessage(conversation, text);
    setSending(false);
    if (msg) {
      setInput('');
      void refresh();
      onAfterSend();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="lg:hidden p-1 rounded hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">
            {conversation.customer_name || t.admin.anonymousCustomer}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {conversation.customer_phone || t.admin.noPhone}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {conversation.customer_zip || t.admin.noZip}
            </span>
            <span>·</span>
            <span>{t.admin.customerLangLabel}: {conversation.customer_lang.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Messages — mom always sees Chinese */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
        {messages.map((m) => (
          <AdminMessageBubble key={m.id} message={m} />
        ))}
      </div>

      {/* Reply input */}
      <div className="border-t border-slate-200 bg-white p-3">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder={t.admin.replyPlaceholder}
            className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            disabled={sending}
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || sending}
            className="inline-flex items-center justify-center gap-1 h-12 px-4 rounded-lg bg-accent-500 text-white hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Send className="w-4 h-4" />
            {sending ? t.admin.sending : t.admin.sendBtn}
          </button>
        </div>
      </div>
    </>
  );
}

function AdminMessageBubble({ message }: { message: Message }) {
  // Mom always reads Chinese:
  // - Customer messages: text_translated (zh) if available, else text_original
  // - Mom's own messages: text_original (already zh)
  const isCustomer = message.sender === 'customer';
  let display = message.text_original;
  if (isCustomer && message.lang_original !== 'zh') {
    display = message.text_translated ?? message.text_original;
  }
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  return (
    <div className={cn('flex', isCustomer ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
          isCustomer
            ? 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
            : 'bg-brand-600 text-white rounded-br-sm',
        )}
      >
        <div className="whitespace-pre-wrap break-words">{display}</div>
        {isCustomer && message.text_original !== display && (
          <div className="mt-1 text-[11px] text-slate-400 italic">
            原文: {message.text_original}
          </div>
        )}
        <div
          className={cn(
            'mt-1 text-[10px] text-right',
            isCustomer ? 'text-slate-400' : 'text-brand-100',
          )}
        >
          {time}
        </div>
      </div>
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} 小时前`;
  return d.toLocaleDateString();
}
