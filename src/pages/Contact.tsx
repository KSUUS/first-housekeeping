import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export function Contact() {
  const { t } = useLanguage();

  return (
    <>
      <section className="bg-gradient-to-br from-brand-50 via-white to-emerald-50">
        <div className="container-tight py-14">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">{t.contact.title}</h1>
          <p className="mt-3 text-lg text-slate-600">{t.contact.subtitle}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-tight max-w-3xl">
          <WeChatSection />
        </div>
      </section>

      <section className="pb-16">
        <div className="container-tight max-w-3xl grid sm:grid-cols-2 gap-6">
          <ContactCard Icon={Phone} title={t.contact.callTitle}>
            <a
              href={`tel:${t.brand.phone.replace(/[^\d+]/g, '')}`}
              className="text-brand-700 hover:text-brand-800 font-medium text-lg"
            >
              {t.brand.phone}
            </a>
          </ContactCard>

          <ContactCard Icon={Mail} title={t.contact.emailTitle}>
            <a
              href={`mailto:${t.brand.email}`}
              className="text-brand-700 hover:text-brand-800 font-medium break-all"
            >
              {t.brand.email}
            </a>
          </ContactCard>

          <ContactCard Icon={MapPin} title={t.contact.areaTitle}>
            <p className="text-slate-700">{t.brand.address}</p>
          </ContactCard>

          <ContactCard Icon={Clock} title={t.contact.hours}>
            <p className="text-slate-700">{t.contact.hoursValue}</p>
          </ContactCard>
        </div>
      </section>
    </>
  );
}

function ContactCard({
  Icon,
  title,
  children,
}: {
  Icon: typeof Phone;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 flex gap-4">
      <span className="inline-flex w-11 h-11 rounded-lg bg-brand-100 text-brand-700 items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <div className="mt-1.5">{children}</div>
      </div>
    </div>
  );
}

/**
 * WeChat section. Drop your QR code at /public/wechat-qr.png and it will
 * automatically appear here. If the file is missing we show a graceful fallback.
 */
function WeChatSection() {
  const { t } = useLanguage();
  const [imageOk, setImageOk] = useState(true);
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="inline-flex w-11 h-11 rounded-lg bg-emerald-500 text-white items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5" />
        </span>
        <h2 className="text-xl font-bold text-slate-900">{t.wechat.sectionTitle}</h2>
      </div>
      <p className="mt-3 text-slate-700 leading-relaxed">{t.wechat.sectionBody}</p>

      <div className="mt-5 grid sm:grid-cols-[10rem_1fr] gap-5 items-center">
        <div className="w-40 h-40 rounded-xl bg-white border border-emerald-200 flex items-center justify-center p-2 shadow-sm">
          {imageOk ? (
            <img
              src="/wechat-qr.png"
              alt={t.wechat.qrAlt}
              className="w-full h-full object-contain"
              onError={() => setImageOk(false)}
            />
          ) : (
            <div className="text-xs text-slate-400 text-center px-2 leading-snug">
              {t.wechat.qrFallback}
            </div>
          )}
        </div>
        <div>
          <div className="text-sm text-slate-500">{t.wechat.idLabel}</div>
          <div className="mt-1 text-lg font-mono font-semibold text-slate-900 break-all">
            {t.wechat.idValue}
          </div>
        </div>
      </div>
    </div>
  );
}
