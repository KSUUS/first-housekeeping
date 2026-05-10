import { Link, useParams, Navigate } from 'react-router-dom';
import { Wind, Flame, Sparkles, MapPin, CheckCircle2, ArrowRight, Phone, Calendar } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { openChat } from '../lib/chat';
import { useSEO } from '../lib/seo';
import { findCity } from '../lib/cities';
import { FREE_RADIUS_MILES, PER_MILE_FEE } from '../lib/zipDistances';

const SERVICES = [
  { key: 'airDuct', Icon: Wind, color: 'bg-brand-100 text-brand-700', href: '/services/air-duct-cleaning' },
  { key: 'dryerVent', Icon: Flame, color: 'bg-orange-100 text-orange-700', href: '/services/dryer-vent-cleaning' },
  { key: 'carpet', Icon: Sparkles, color: 'bg-emerald-100 text-emerald-700', href: '/services/carpet-cleaning' },
] as const;

export function CityPage() {
  const { city: slug } = useParams<{ city: string }>();
  const city = slug ? findCity(slug) : undefined;
  if (!city) return <Navigate to="/service-area" replace />;

  return <CityContent city={city} slug={slug!} />;
}

function CityContent({ city, slug }: { city: ReturnType<typeof findCity> & object; slug: string }) {
  const { t, lang } = useLanguage();

  // City-specific SEO (each page gets unique title/description for ranking)
  const title =
    lang === 'zh'
      ? `${city.name} 空调管道、烘干机、地毯清洁 | First Housekeeping 第一家政`
      : `Air Duct, Dryer Vent &amp; Carpet Cleaning in ${city.name}, GA | First Housekeeping`;

  const description =
    lang === 'zh'
      ? `服务 ${city.name} 的空调管道清洁、烘干机管道清洁、地毯清洗。中英文服务，本地家族经营，持证经营全额保险。免费报价请致电 (470) 991-8071。`
      : `Professional air duct cleaning, dryer vent cleaning, and carpet cleaning in ${city.name}, GA. Bilingual English/Chinese service, locally owned, licensed & insured. Free quote: (470) 991-8071.`;

  const withinFree = city.miles <= FREE_RADIUS_MILES;
  const travelFee = withinFree ? 0 : (city.miles - FREE_RADIUS_MILES) * PER_MILE_FEE;

  useSEO({
    title,
    description,
    path: `/locations/${slug}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `Cleaning Services in ${city.name}, GA`,
      description,
      url: `https://firsthousekeeping.com/locations/${slug}`,
      provider: {
        '@type': 'LocalBusiness',
        '@id': 'https://firsthousekeeping.com#business',
        name: 'First Housekeeping',
      },
      areaServed: {
        '@type': 'City',
        name: `${city.name}, GA`,
      },
    },
  });

  return (
    <>
      <section className="bg-gradient-to-br from-brand-50 via-white to-emerald-50">
        <div className="container-tight py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-brand-200 text-brand-700 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5" />
            {lang === 'zh' ? `服务区域 · ${city.name}` : `Service Area · ${city.name}, GA`}
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            {lang === 'zh'
              ? `${city.name} 的清洁服务`
              : `Cleaning Services in ${city.name}, Georgia`}
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-3xl leading-relaxed">
            {lang === 'zh'
              ? `专业空调管道、烘干机管道、地毯清洁 — 服务 ${city.name} 居民和商业客户。中英文服务，持证经营，全额保险。`
              : `Professional air duct cleaning, dryer vent cleaning, and carpet cleaning for ${city.name} homes and businesses. Bilingual English/Chinese, licensed, and insured.`}
          </p>
          <p className="mt-4 text-slate-700 max-w-3xl leading-relaxed">{city.blurb[lang]}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={openChat} className="btn-accent">
              {t.home.ctaQuote} <ArrowRight className="w-4 h-4" />
            </button>
            <a href={`tel:${t.brand.phone.replace(/[^\d+]/g, '')}`} className="btn-ghost">
              <Phone className="w-4 h-4" />
              {t.brand.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container-tight">
          <h2 className="text-2xl sm:text-3xl font-bold">
            {lang === 'zh' ? `${city.name} 三大专业服务` : `Our Services in ${city.name}`}
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {SERVICES.map(({ key, Icon, color, href }) => {
              const svc = t.services[key];
              return (
                <Link
                  key={key}
                  to={href}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-brand-300 hover:shadow-lg transition-all"
                >
                  <div className={`inline-flex w-12 h-12 rounded-xl items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{svc.title}</h3>
                  <p className="mt-2 text-slate-600 leading-relaxed">{svc.short}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Travel + ZIPs */}
      <section className="section bg-slate-50">
        <div className="container-tight max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 grid sm:grid-cols-2 gap-6">
            <div>
              <div className="inline-flex w-10 h-10 rounded-lg items-center justify-center bg-emerald-100 text-emerald-700">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="mt-3 font-semibold">
                {lang === 'zh' ? '覆盖邮编' : 'ZIP Codes We Serve'}
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {city.zips.map((z) => (
                  <span key={z} className="inline-flex px-2 py-0.5 rounded bg-slate-100 text-xs font-mono">
                    {z}
                  </span>
                ))}
              </div>
              {city.neighborhoods && (
                <>
                  <h4 className="mt-4 text-sm font-medium text-slate-700">
                    {lang === 'zh' ? '熟悉的社区' : 'Neighborhoods we serve'}
                  </h4>
                  <p className="mt-1 text-sm text-slate-600">{city.neighborhoods.join(' · ')}</p>
                </>
              )}
            </div>

            <div>
              <div className="inline-flex w-10 h-10 rounded-lg items-center justify-center bg-brand-100 text-brand-700">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="mt-3 font-semibold">
                {lang === 'zh' ? '距离与路费' : 'Distance & Travel'}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {lang === 'zh' ? '距 Duluth 基地约' : 'Approx. distance from our Duluth base:'}{' '}
                <strong>{city.miles} {lang === 'zh' ? '英里' : 'mi'}</strong>
              </p>
              {withinFree ? (
                <p className="mt-2 text-sm font-medium text-emerald-700">
                  {lang === 'zh' ? '✓ 免路费（在 20 英里免费区内）' : '✓ Free service zone — no travel fee'}
                </p>
              ) : (
                <p className="mt-2 text-sm font-medium text-blue-700">
                  {lang === 'zh'
                    ? `路费约 $${travelFee}（超出 20 英里部分 $2/英里）`
                    : `Travel fee approx $${travelFee} ($2/mi beyond 20 mi)`}
                </p>
              )}
              <button type="button" onClick={openChat} className="btn-accent text-sm mt-4">
                {t.home.ctaQuote}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why us — same trust signals, framed for the city */}
      <section className="section">
        <div className="container-tight">
          <h2 className="text-2xl sm:text-3xl font-bold">
            {lang === 'zh'
              ? `${city.name} 居民为什么选择我们`
              : `Why ${city.name} Homeowners Choose Us`}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {t.home.why.map((item) => (
              <div key={item.title} className="flex gap-3 rounded-xl bg-white border border-slate-200 p-5">
                <CheckCircle2 className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-tight">
          <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-12 sm:px-14 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {lang === 'zh'
                ? `${city.name} 的客户，请直接联系我们`
                : `Ready to schedule in ${city.name}?`}
            </h2>
            <p className="mt-3 text-brand-100 max-w-2xl mx-auto">
              {lang === 'zh'
                ? '聊天发消息或者打电话，我们都能用中文或英文沟通。'
                : 'Chat or call — we respond in your language, English or Chinese.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
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
