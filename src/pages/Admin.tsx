import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  LogOut,
  Send,
  MapPin,
  Phone,
  RefreshCw,
  X,
  Calendar,
  MessageSquare,
  User,
  Save,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useSEO } from '../lib/seo';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  adminListConversations,
  adminListMessages,
  adminSendMessage,
  adminMarkRead,
  adminUpdateConversation,
  adminFindDuplicates,
  adminMergeConversations,
  type Conversation,
  type ConversationStatus,
  type Message,
} from '../lib/chat';
import { cn } from '../lib/utils';

// =====================================================================
// Top-level
// =====================================================================

export function Admin() {
  return <AdminGuard><Dashboard /></AdminGuard>;
}

// Re-usable auth guard. Renders LoginForm if not authenticated; otherwise children.
export function AdminGuard({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  // Tell search engines to skip admin pages
  useSEO({
    title: 'Admin · 管理后台 | First Housekeeping',
    description: 'First Housekeeping admin dashboard.',
    path: '/admin',
    noindex: true,
  });

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

  return <AdminShell>{children}</AdminShell>;
}

function AdminShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="container-tight py-4">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-lg sm:text-xl font-bold whitespace-nowrap">
              {t.admin.pageTitle}
            </h1>
            <nav className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm">
              <AdminTab to="/admin" end Icon={MessageSquare}>
                {t.admin.tabs.conversations}
              </AdminTab>
              <AdminTab to="/admin/appointments" Icon={Calendar}>
                {t.admin.tabs.appointments}
              </AdminTab>
            </nav>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="btn-ghost text-sm py-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t.admin.logoutBtn}</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AdminTab({
  to,
  end,
  Icon,
  children,
}: {
  to: string;
  end?: boolean;
  Icon: typeof MessageSquare;
  children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors',
          isActive ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:text-slate-900',
        )
      }
    >
      <Icon className="w-4 h-4" />
      {children}
    </NavLink>
  );
}

// =====================================================================
// Login form
// =====================================================================

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

// =====================================================================
// Conversations dashboard
// =====================================================================

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

  // Realtime
  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
    const channel = sb
      .channel('admin-conv-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => void refresh())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => void refresh())
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
  }, []);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;
  const updateLocal = (next: Conversation) =>
    setConversations((prev) => prev.map((c) => (c.id === next.id ? next : c)));

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => void refresh()}
          className="btn-ghost text-xs py-1 px-2"
          disabled={refreshing}
        >
          <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
        </button>
      </div>
      <DashboardGrid
        conversations={conversations}
        selected={selected}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAfterUpdate={updateLocal}
        t={t}
      />
    </div>
  );
}

// Split out so the refresh button stays at the top
function DashboardGrid({
  conversations,
  selected,
  selectedId,
  onSelect,
  onAfterUpdate,
  t,
}: {
  conversations: Conversation[];
  selected: Conversation | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAfterUpdate: (c: Conversation) => void;
  t: ReturnType<typeof useLanguage>['t'];
}) {
  return (
    <div className="w-full grid lg:grid-cols-[20rem_1fr] gap-4 h-[calc(100vh-13rem)] min-h-[30rem]">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        t={t}
      />
      <div
        className={cn(
          'rounded-2xl border border-slate-200 bg-white flex flex-col overflow-hidden relative',
          !selectedId && 'hidden lg:flex',
        )}
      >
        {selected ? (
          <ConversationPane
            conversation={selected}
            onBack={() => onSelect(null)}
            onAfterUpdate={onAfterUpdate}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
            {t.admin.noSelection}
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationList({
  conversations,
  selectedId,
  onSelect,
  t,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  t: ReturnType<typeof useLanguage>['t'];
}) {
  return (
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
                onClick={() => onSelect(c.id)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50',
                  selectedId === c.id && 'bg-brand-50',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm text-slate-900 truncate">
                    {c.customer_name || t.admin.anonymousCustomer}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={c.status} t={t} compact />
                    {c.unread_for_agent > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
                        {c.unread_for_agent}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-0.5 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                  <span>{formatTime(c.last_message_at)}</span>
                  {c.appointment_at && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <Calendar className="w-3 h-3" />
                        {formatAppointment(c.appointment_at)}
                      </span>
                    </>
                  )}
                  {c.customer_phone && (
                    <>
                      <span>·</span>
                      <span className="font-mono">{c.customer_phone}</span>
                    </>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// =====================================================================
// Conversation pane (header + messages + input + details drawer)
// =====================================================================

function ConversationPane({
  conversation,
  onBack,
  onAfterUpdate,
}: {
  conversation: Conversation;
  onBack: () => void;
  onAfterUpdate: (c: Conversation) => void;
}) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshMessages = async () => {
    const list = await adminListMessages(conversation.id);
    setMessages(list);
  };

  useEffect(() => {
    void refreshMessages();
    void adminMarkRead(conversation.id);
    setDrawerOpen(false);
  }, [conversation.id]);

  // Realtime updates for this conversation's messages
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
        () => void refreshMessages(),
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
      void refreshMessages();
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
          <div className="flex items-center gap-2">
            <div className="font-semibold text-sm truncate">
              {conversation.customer_name || t.admin.anonymousCustomer}
            </div>
            <StatusBadge status={conversation.status} t={t} />
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap mt-0.5">
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {conversation.customer_phone || t.admin.noPhone}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {conversation.customer_zip || t.admin.noZip}
            </span>
            {conversation.appointment_at && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                  <Calendar className="w-3 h-3" />
                  {formatAppointment(conversation.appointment_at)}
                </span>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="btn-ghost text-xs py-1.5 px-2.5 whitespace-nowrap"
          title={t.admin.details.openBtn}
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">{t.admin.details.openBtn}</span>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
        {messages.map((m) => (
          <AdminMessageBubble key={m.id} message={m} />
        ))}
      </div>

      {/* Duplicate customer banner */}
      <DuplicatesBanner
        conversation={conversation}
        onMerged={onAfterUpdate}
      />

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

      {/* Details drawer */}
      {drawerOpen && (
        <CustomerDetailsDrawer
          conversation={conversation}
          onClose={() => setDrawerOpen(false)}
          onSaved={(c) => {
            onAfterUpdate(c);
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}

// =====================================================================
// Customer details drawer (slide-over)
// =====================================================================

const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: 'airDuct', label: '空调管道清洁' },
  { value: 'dryerVent', label: '烘干机管道清洁' },
  { value: 'carpet', label: '地毯清洗' },
  { value: 'multiple', label: '多项服务' },
];

const STATUS_OPTIONS: ConversationStatus[] = [
  'new',
  'in_progress',
  'scheduled',
  'completed',
  'closed',
  'spam',
];

function CustomerDetailsDrawer({
  conversation,
  onClose,
  onSaved,
}: {
  conversation: Conversation;
  onClose: () => void;
  onSaved: (c: Conversation) => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    customer_name: conversation.customer_name ?? '',
    customer_phone: conversation.customer_phone ?? '',
    customer_email: conversation.customer_email ?? '',
    customer_address: conversation.customer_address ?? '',
    customer_zip: conversation.customer_zip ?? '',
    appointment_at: toLocalInput(conversation.appointment_at),
    appointment_service: (conversation.appointment_service as string) ?? '',
    appointment_notes: conversation.appointment_notes ?? '',
    admin_notes: conversation.admin_notes ?? '',
    status: conversation.status,
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const updated = await adminUpdateConversation(conversation.id, {
      customer_name: form.customer_name || null,
      customer_phone: form.customer_phone || null,
      customer_email: form.customer_email || null,
      customer_address: form.customer_address || null,
      customer_zip: form.customer_zip || null,
      appointment_at: form.appointment_at ? new Date(form.appointment_at).toISOString() : null,
      appointment_service: form.appointment_service || null,
      appointment_notes: form.appointment_notes || null,
      admin_notes: form.admin_notes || null,
      status: form.status,
    });
    setSaving(false);
    if (updated) {
      setSavedAt(Date.now());
      setTimeout(() => onSaved(updated), 600);
    }
  };

  const clearAppointment = () => {
    set('appointment_at', '');
    set('appointment_service', '');
    set('appointment_notes', '');
  };

  return (
    <div className="absolute inset-0 z-30 flex">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="hidden lg:block flex-1 bg-slate-900/30"
      />

      {/* Panel */}
      <div className="flex-1 lg:flex-none lg:w-[28rem] bg-white border-l border-slate-200 shadow-2xl flex flex-col">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="font-semibold">{t.admin.details.title}</div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Contact */}
          <Section title={t.admin.details.sectionInfo}>
            <Field label={t.admin.details.nameLabel}>
              <input className="input" value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} />
            </Field>
            <Field label={t.admin.details.phoneLabel}>
              <input className="input" type="tel" value={form.customer_phone} onChange={(e) => set('customer_phone', e.target.value)} />
            </Field>
            <Field label={t.admin.details.emailLabel}>
              <input className="input" type="email" value={form.customer_email} onChange={(e) => set('customer_email', e.target.value)} />
            </Field>
            <Field label={t.admin.details.addressLabel}>
              <input className="input" value={form.customer_address} onChange={(e) => set('customer_address', e.target.value)} />
            </Field>
            <Field label={t.admin.details.zipLabel}>
              <input className="input" inputMode="numeric" maxLength={5} value={form.customer_zip} onChange={(e) => set('customer_zip', e.target.value.replace(/\D/g, ''))} />
            </Field>
          </Section>

          {/* Appointment */}
          <Section title={t.admin.details.sectionAppointment}>
            <Field label={t.admin.details.appointmentDateLabel}>
              <input
                className="input"
                type="datetime-local"
                value={form.appointment_at}
                onChange={(e) => set('appointment_at', e.target.value)}
              />
            </Field>
            <Field label={t.admin.details.appointmentServiceLabel}>
              <select
                className="input"
                value={form.appointment_service}
                onChange={(e) => set('appointment_service', e.target.value)}
              >
                <option value="">{t.admin.details.appointmentServicePlaceholder}</option>
                {SERVICE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label={t.admin.details.appointmentNotesLabel}>
              <textarea
                className="input"
                rows={2}
                placeholder={t.admin.details.appointmentNotesPlaceholder}
                value={form.appointment_notes}
                onChange={(e) => set('appointment_notes', e.target.value)}
              />
            </Field>
            {(form.appointment_at || form.appointment_service || form.appointment_notes) && (
              <button
                type="button"
                onClick={clearAppointment}
                className="text-xs text-red-600 hover:text-red-700"
              >
                {t.admin.details.clearAppointment}
              </button>
            )}
          </Section>

          {/* Status */}
          <Section title={t.admin.details.sectionStatus}>
            <select
              className="input"
              value={form.status}
              onChange={(e) => set('status', e.target.value as ConversationStatus)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{t.admin.status[s]}</option>
              ))}
            </select>
          </Section>

          {/* Admin notes */}
          <Section title={t.admin.details.sectionNotes}>
            <textarea
              className="input"
              rows={5}
              placeholder={t.admin.details.adminNotesPlaceholder}
              value={form.admin_notes}
              onChange={(e) => set('admin_notes', e.target.value)}
            />
          </Section>
        </div>

        {/* Save button */}
        <div className="border-t border-slate-200 bg-white px-5 py-3 flex items-center justify-between gap-3">
          {savedAt && Date.now() - savedAt < 1500 ? (
            <span className="text-sm text-emerald-600 font-medium">{t.admin.details.saved}</span>
          ) : (
            <span className="text-xs text-slate-400">
              {t.admin.details.sectionNotes}
            </span>
          )}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="btn-accent text-sm py-2"
          >
            <Save className="w-4 h-4" />
            {saving ? t.admin.details.saving : t.admin.details.save}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Duplicate customer banner
// =====================================================================

function DuplicatesBanner({
  conversation,
  onMerged,
}: {
  conversation: Conversation;
  onMerged: (updated: Conversation) => void;
}) {
  const [dupes, setDupes] = useState<Conversation[]>([]);
  const [merging, setMerging] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    setDupes([]);
    setDismissed([]);
    if (conversation.customer_phone || conversation.customer_address) {
      void adminFindDuplicates(conversation).then(setDupes);
    }
  }, [conversation.id, conversation.customer_phone, conversation.customer_address]);

  const visible = dupes.filter((d) => !dismissed.includes(d.id));
  if (visible.length === 0) return null;

  const handleMerge = async (duplicateId: string) => {
    setMerging(duplicateId);
    const ok = await adminMergeConversations(conversation.id, duplicateId);
    setMerging(null);
    if (ok) {
      setDupes((prev) => prev.filter((d) => d.id !== duplicateId));
      // Reload current conversation to reflect backfilled fields
      const { data } = await import('../lib/supabase').then(({ supabase: sb }) =>
        sb!.from('conversations').select('*').eq('id', conversation.id).single()
      );
      if (data) onMerged(data as Conversation);
    }
  };

  return (
    <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 space-y-1.5">
      {visible.map((d) => {
        const matchOn = d.customer_phone === conversation.customer_phone
          ? `电话 ${d.customer_phone}`
          : `地址 ${d.customer_address}`;
        return (
          <div key={d.id} className="flex items-center justify-between gap-3 text-xs">
            <span className="text-amber-800">
              ⚠️ 发现重复客人（{matchOn}）：
              <span className="font-medium ml-1">{d.customer_name || '匿名'}</span>
              <span className="ml-1 text-amber-600">{formatTime(d.last_message_at)}</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={merging === d.id}
                onClick={() => void handleMerge(d.id)}
                className="inline-flex items-center gap-1 rounded px-2 py-1 bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {merging === d.id ? '合并中…' : '合并到这里'}
              </button>
              <button
                type="button"
                onClick={() => setDismissed((p) => [...p, d.id])}
                className="text-amber-500 hover:text-amber-700"
                aria-label="忽略"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

// =====================================================================
// Status badge
// =====================================================================

const STATUS_STYLES: Record<ConversationStatus, string> = {
  new: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-amber-100 text-amber-800',
  scheduled: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-blue-100 text-blue-800',
  closed: 'bg-slate-200 text-slate-600',
  spam: 'bg-red-100 text-red-700',
};

function StatusBadge({
  status,
  t,
  compact = false,
}: {
  status: ConversationStatus;
  t: ReturnType<typeof useLanguage>['t'];
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap',
        STATUS_STYLES[status],
      )}
    >
      {compact ? compactLabel(status, t) : t.admin.status[status]}
    </span>
  );
}

function compactLabel(status: ConversationStatus, t: ReturnType<typeof useLanguage>['t']): string {
  // Same labels — keep one source of truth
  return t.admin.status[status];
}

// =====================================================================
// Message bubble (mom's view — always Chinese)
// =====================================================================

function AdminMessageBubble({ message }: { message: Message }) {
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

// =====================================================================
// Helpers (exported so Appointments page can reuse)
// =====================================================================

export function formatTime(iso: string) {
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

export function formatAppointment(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Convert ISO string → datetime-local input value (yyyy-MM-ddTHH:mm in local TZ) */
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Re-export for cross-page link styling consistency
export { Link };
