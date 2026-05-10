import { Link } from 'react-router-dom';
import { Wind, Flame, Sparkles, ShieldCheck, Users, Languages, Clock, ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { openChat } from '../lib/chat';
import { useSEO } from '../lib/seo';

const SERVICE_META = [
  {
    key: 'airDuct' as const,
    to: '/services/air-duct-cleaning',
    Icon: Wind,
    color: 'bg-brand-100 text-brand-700',
  },
  {
    key: 'dryerVent' as const,
    to: '/services/dryer-vent-cleaning',
    Icon: Flame,
    color: 'bg-orange-100 text-orange-700',
  },
  {
    key: 'carpet' as const,
    to: '/services/carpet-cleaning',
    Icon: Sparkles,
    color: 'bg-emerald-100 text-emerald-700',
  },
];

const TRUST_ICONS = [ShieldCheck, Users, Languages, Clock];

export function Home() {
  const { t, lang } = useLanguage();

  useSEO({
    title:
      lang === 'zh'
        ? 'First Housekeeping 第一家政 | 亚特兰大空调管道、烘干机、地毯清洁'
        : 'First Housekeeping | Air Duct, Dryer Vent & Carpet Cleaning — Atlanta GA',
    description:
      lang === 'zh'
        ? '专业空调管道、烘干机管道、地毯清洁服务。覆盖 Duluth, Johns Creek, Alpharetta 及大亚特兰大地区。中英文服务，持证经营。电话 (470) 991-8071。'
        : 'Professional air duct, dryer vent, and carpet cleaning serving Duluth, Johns Creek, Alpharetta, and metro Atlanta. Bilingual English/Chinese service. Call (470) 991-8071.',
    path: '/',
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-emerald-50">
        <div className="container-tight pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-brand-200 text-brand-700 text-xs font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-accent-500" />
              {t.home.heroEyebrow}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              {t.home.heroTitle}
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-2xl leading-relaxed">
              {t.home.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={openChat} className="btn-accent">
                {t.home.ctaQuote} <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={`tel:${t.brand.phone.replace(/[^\d+]/g, '')}`}
                className="btn-ghost"
              >
                <Phone className="w-4 h-4" />
                {t.home.ctaCall}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-slate-200 bg-white">
        <div className="container-tight py-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.values(t.home.trustBar).map((label, i) => {
            const Icon = TRUST_ICONS[i];
            return (
              <div key={label} className="flex items-center gap-2 text-sm text-slate-700">
                <Icon className="w-5 h-5 text-brand-600 shrink-0" />
                <span className="font-medium">{label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container-tight">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold">{t.home.servicesTitle}</h2>
            <p className="mt-3 text-slate-600">{t.home.servicesSubtitle}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {SERVICE_META.map(({ key, to, Icon, color }) => {
              const svc = t.services[key];
              return (
                <Link
                  key={key}
                  to={to}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-brand-300 hover:shadow-lg transition-all"
                >
                  <div className={`inline-flex w-12 h-12 rounded-xl items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{svc.title}</h3>
                  <p className="mt-2 text-slate-600 leading-relaxed">{svc.short}</p>
                  <div className="mt-5 inline-flex items-center text-sm font-medium text-brand-600 group-hover:gap-2 gap-1 transition-all">
                    {t.services.ctaQuote}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section bg-slate-50">
        <div className="container-tight">
          <h2 className="text-3xl sm:text-4xl font-bold text-center">{t.home.whyTitle}</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {t.home.why.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-xl bg-white p-6 border border-slate-200">
                <CheckCircle2 className="w-6 h-6 text-accent-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="mt-1.5 text-slate-600 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA block */}
      <section className="section">
        <div className="container-tight">
          <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-14 sm:px-14 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              {t.home.ctaBlockTitle}
            </h2>
            <p className="mt-3 text-brand-100 max-w-2xl mx-auto">{t.home.ctaBlockBody}</p>
            <div className="mt-7 flex flex-wrap gap-3 justify-center">
              <button type="button" onClick={openChat} className="btn-accent">
                {t.home.ctaQuote}
              </button>
              <a
                href={`tel:${t.brand.phone.replace(/[^\d+]/g, '')}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 border border-white/30 px-5 py-3 text-white font-medium hover:bg-white/20 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {t.brand.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
