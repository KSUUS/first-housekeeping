import { Link } from 'react-router-dom';
import { Wind, Flame, Sparkles, CheckCircle2, ArrowRight, Phone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

type ServiceKey = 'airDuct' | 'dryerVent' | 'carpet';

const ICON_MAP = {
  airDuct: { Icon: Wind, color: 'bg-brand-100 text-brand-700' },
  dryerVent: { Icon: Flame, color: 'bg-orange-100 text-orange-700' },
  carpet: { Icon: Sparkles, color: 'bg-emerald-100 text-emerald-700' },
};

export function ServicePage({ service }: { service: ServiceKey }) {
  const { t } = useLanguage();
  const data = t.services[service];
  const { Icon, color } = ICON_MAP[service];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-emerald-50">
        <div className="container-tight py-16 sm:py-20">
          <div className={`inline-flex w-14 h-14 rounded-xl items-center justify-center ${color}`}>
            <Icon className="w-7 h-7" />
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold leading-tight">
            {data.title}
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl leading-relaxed">
            {data.short}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/quote" className="btn-accent">
              {t.services.ctaQuote} <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`tel:${t.brand.phone.replace(/[^\d+]/g, '')}`}
              className="btn-ghost"
            >
              <Phone className="w-4 h-4" />
              {t.brand.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section">
        <div className="container-tight grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">{t.services.benefitsLabel}</h2>
            <ul className="mt-6 space-y-4">
              {data.benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-500 mt-1 shrink-0" />
                  <span className="text-slate-700 leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">{t.services.processLabel}</h2>
            <ol className="mt-6 space-y-4">
              {data.process.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-slate-700 leading-relaxed pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section bg-slate-50">
        <div className="container-tight">
          <div className="rounded-2xl bg-white border border-slate-200 p-8 sm:p-10 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold">{t.services.pricingLabel}</h2>
            <p className="mt-3 text-2xl sm:text-3xl text-brand-700 font-semibold">
              {data.priceFrom}
            </p>
            <Link to="/quote" className="btn-accent mt-7">
              {t.services.ctaQuote}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
