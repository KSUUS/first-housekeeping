import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Phone, MapPin, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { adminListAppointments, type Conversation } from '../lib/chat';
import { AdminGuard, formatAppointment } from './Admin';
import { cn } from '../lib/utils';

const SERVICE_LABEL: Record<string, string> = {
  airDuct: '空调管道清洁',
  dryerVent: '烘干机管道清洁',
  carpet: '地毯清洗',
  multiple: '多项服务',
};

export function Appointments() {
  return <AdminGuard><AppointmentsList /></AdminGuard>;
}

function AppointmentsList() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const list = await adminListAppointments();
      setItems(list);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">{t.admin.loading}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="mt-3">{t.admin.appointments.empty}</p>
      </div>
    );
  }

  const now = Date.now();
  const upcoming = items.filter((c) => c.appointment_at && new Date(c.appointment_at).getTime() >= now);
  const past = items.filter((c) => c.appointment_at && new Date(c.appointment_at).getTime() < now);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
          {t.admin.appointments.upcoming} ({upcoming.length})
        </h2>
        <div className="space-y-2">
          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
              {t.admin.appointments.empty}
            </div>
          ) : (
            upcoming.map((c) => <AppointmentRow key={c.id} c={c} t={t} />)
          )}
        </div>
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
            {t.admin.appointments.past} ({past.length})
          </h2>
          <div className="space-y-2 opacity-70">
            {past.map((c) => <AppointmentRow key={c.id} c={c} t={t} past />)}
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentRow({
  c,
  t,
  past = false,
}: {
  c: Conversation;
  t: ReturnType<typeof useLanguage>['t'];
  past?: boolean;
}) {
  const service = c.appointment_service ? SERVICE_LABEL[c.appointment_service as string] ?? c.appointment_service : t.admin.appointments.noService;
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row gap-3 sm:items-center')}>
      <div className="shrink-0 w-20 sm:w-28 text-center sm:text-left">
        <div className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-emerald-700 font-semibold">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{c.appointment_at && formatAppointment(c.appointment_at)}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900">
          {c.customer_name || t.admin.anonymousCustomer}
          <span className={cn('ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium', past ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-800')}>
            {service as string}
          </span>
        </div>
        <div className="mt-1 text-xs text-slate-500 flex items-center gap-3 flex-wrap">
          {c.customer_phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {c.customer_phone}
            </span>
          )}
          {c.customer_address && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {c.customer_address}
              {c.customer_zip && ` (${c.customer_zip})`}
            </span>
          )}
          {!c.customer_address && c.customer_zip && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {c.customer_zip}
            </span>
          )}
        </div>
        {c.appointment_notes && (
          <p className="mt-1.5 text-sm text-slate-700 leading-snug">{c.appointment_notes}</p>
        )}
      </div>

      <Link to="/admin" className="btn-ghost text-xs py-1.5 px-3 shrink-0">
        <ExternalLink className="w-3.5 h-3.5" />
        {t.admin.appointments.backToChat}
      </Link>
    </div>
  );
}
