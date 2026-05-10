import { Wind, Flame, Sparkles, CheckCircle2, ArrowRight, Phone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { openChat } from '../lib/chat';
import { useSEO, serviceSchema } from '../lib/seo';

type ServiceKeyLocal = 'airDuct' | 'dryerVent' | 'carpet';

const SEO_BY_SERVICE: Record<ServiceKeyLocal, {
  slug: string;
  enTitle: string;
  zhTitle: string;
  enDescription: string;
  zhDescription: string;
  enName: string;
}> = {
  airDuct: {
    slug: 'air-duct-cleaning',
    enTitle: 'Air Duct Cleaning Atlanta | Duluth, Johns Creek, Alpharetta | First Housekeeping',
    zhTitle: '亚特兰大空调管道清洁 — Duluth / Johns Creek / Alpharetta | 第一家政',
    enDescription:
      'Professional air duct cleaning in metro Atlanta. Remove dust, pollen, mold, and allergens. Improve HVAC efficiency and indoor air quality. Free quote: (470) 991-8071.',
    zhDescription:
      '专业空调管道清洁服务，覆盖大亚特兰大地区。清除灰尘、花粉、霉菌、过敏原，提升空调效率和室内空气质量。中英文服务，免费报价 (470) 991-8071。',
    enName: 'Air Duct Cleaning',
  },
  dryerVent: {
    slug: 'dryer-vent-cleaning',
    enTitle: 'Dryer Vent Cleaning Atlanta | First Housekeeping — Duluth GA',
    zhTitle: '亚特兰大烘干机管道清洁 | 第一家政',
    enDescription:
      'Prevent dryer fires and cut energy bills with professional dryer vent cleaning in metro Atlanta. Same-week appointments. Bilingual EN/中文. Call (470) 991-8071.',
    zhDescription:
      '专业烘干机管道清洁，防止家电火灾，节省电费。覆盖大亚特兰大地区，本周可上门。中英文服务，电话 (470) 991-8071。',
    enName: 'Dryer Vent Cleaning',
  },
  carpet: {
    slug: 'carpet-cleaning',
    enTitle: 'Carpet Cleaning Atlanta | Eco-Friendly & Pet-Safe | First Housekeeping',
    zhTitle: '亚特兰大地毯清洗 — 环保儿童宠物安全 | 第一家政',
    enDescription:
      'Deep hot-water carpet cleaning across metro Atlanta. Removes dirt, stains, allergens, and pet odors. Eco-friendly, pet- and child-safe. Free quote: (470) 991-8071.',
    zhDescription:
      '专业热水萃取地毯清洗，覆盖大亚特兰大地区。深度清除污垢、污渍、过敏原和宠物气味。环保配方，儿童宠物安心。电话 (470) 991-8071。',
    enName: 'Carpet Cleaning',
  },
};

type ServiceKey = 'airDuct' | 'dryerVent' | 'carpet';

const ICON_MAP = {
  airDuct: { Icon: Wind, color: 'bg-brand-100 text-brand-700' },
  dryerVent: { Icon: Flame, color: 'bg-orange-100 text-orange-700' },
  carpet: { Icon: Sparkles, color: 'bg-emerald-100 text-emerald-700' },
};

export function ServicePage({ service }: { service: ServiceKey }) {
  const { t, lang } = useLanguage();
  const data = t.services[service];
  const { Icon, color } = ICON_MAP[service];
  const seoMeta = SEO_BY_SERVICE[service];

  useSEO({
    title: lang === 'zh' ? seoMeta.zhTitle : seoMeta.enTitle,
    description: lang === 'zh' ? seoMeta.zhDescription : seoMeta.enDescription,
    path: `/services/${seoMeta.slug}`,
    jsonLd: serviceSchema({
      name: seoMeta.enName,
      description: seoMeta.enDescription,
      url: `https://firsthousekeeping.com/services/${seoMeta.slug}`,
    }),
  });

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
            <button type="button" onClick={openChat} className="btn-accent">
              {t.services.ctaQuote} <ArrowRight className="w-4 h-4" />
            </button>
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
            <button type="button" onClick={openChat} className="btn-accent mt-7">
              {t.services.ctaQuote}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
