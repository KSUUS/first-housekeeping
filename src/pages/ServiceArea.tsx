import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calculator, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { openChat } from '../lib/chat';
import { useSEO } from '../lib/seo';
import { CITIES } from '../lib/cities';
import { lookupZip, FREE_RADIUS_MILES, PER_MILE_FEE, type DistanceLookupResult, type NotFoundResult } from '../lib/zipDistances';

type Result = DistanceLookupResult | NotFoundResult | null;

export function ServiceArea() {
  const { t, lang } = useLanguage();
  const [zip, setZip] = useState('');
  const [result, setResult] = useState<Result>(null);

  useSEO({
    title:
      lang === 'zh'
        ? '服务范围 — 亚特兰大及周边地区 | First Housekeeping 第一家政'
        : 'Service Area — Atlanta &amp; Surrounding Cities | First Housekeeping',
    description:
      lang === 'zh'
        ? '服务覆盖 Duluth, Johns Creek, Suwanee, Alpharetta, Roswell, Norcross, Lawrenceville, Marietta 等大亚特兰大地区。Duluth 起 20 英里内免路费。'
        : 'We serve Duluth, Johns Creek, Suwanee, Alpharetta, Roswell, Norcross, Lawrenceville, Marietta, and metro Atlanta. Free service within 20 miles of Duluth.',
    path: '/service-area',
  });

  // Helper: turn each city name into a slug if it matches a known city
  const citySlugByName: Record<string, string> = Object.fromEntries(
    CITIES.map((c) => [c.name, c.slug]),
  );

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zip.trim()) return;
    setResult(lookupZip(zip));
  };

  return (
    <>
      <section className="bg-gradient-to-br from-brand-50 via-white to-emerald-50">
        <div className="container-tight py-16 sm:py-20">
          <div className="inline-flex w-14 h-14 rounded-xl items-center justify-center bg-brand-100 text-brand-700">
            <MapPin className="w-7 h-7" />
          </div>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold leading-tight">
            {t.serviceArea.title}
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl leading-relaxed">
            {t.serviceArea.subtitle}
          </p>
          <div className="mt-6 inline-flex items-start gap-2 px-4 py-3 rounded-lg bg-white border border-brand-200 text-sm text-slate-700 max-w-3xl">
            <HelpCircle className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <span>{t.serviceArea.pricingNote}</span>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="section">
        <div className="container-tight">
          <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-brand-600" />
              <h2 className="text-2xl font-bold">{t.serviceArea.calcTitle}</h2>
            </div>

            <form onSubmit={handleCheck} className="mt-6">
              <label htmlFor="zip" className="label">
                {t.serviceArea.zipLabel}
              </label>
              <div className="flex gap-2">
                <input
                  id="zip"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.serviceArea.zipPlaceholder}
                  className="input flex-1"
                />
                <button type="submit" className="btn-primary whitespace-nowrap">
                  {t.serviceArea.checkBtn}
                </button>
              </div>
            </form>

            {result && <ResultCard result={result} t={t} />}
          </div>
        </div>
      </section>

      {/* Cities list */}
      <section className="section bg-slate-50">
        <div className="container-tight">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            {t.serviceArea.areasTitle}
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {t.serviceArea.areas.map((city) => {
              const slug = citySlugByName[city];
              const baseClass =
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-700';
              if (slug) {
                return (
                  <Link
                    key={city}
                    to={`/locations/${slug}`}
                    className={`${baseClass} hover:border-brand-400 hover:text-brand-700 transition-colors`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                    {city}
                  </Link>
                );
              }
              return (
                <span key={city} className={baseClass}>
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  {city}
                </span>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <button type="button" onClick={openChat} className="btn-accent">
              {t.nav.quote}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function ResultCard({ result, t }: { result: DistanceLookupResult | NotFoundResult; t: ReturnType<typeof useLanguage>['t'] }) {
  if (!result.found) {
    return (
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900 leading-relaxed">{t.serviceArea.result.notFound}</p>
      </div>
    );
  }

  const { city, miles, withinFreeZone, extraMiles, travelFee } = result;

  return (
    <div
      className={`mt-6 rounded-xl p-5 border ${
        withinFreeZone ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex gap-3">
        <CheckCircle2
          className={`w-5 h-5 shrink-0 mt-0.5 ${
            withinFreeZone ? 'text-emerald-600' : 'text-blue-600'
          }`}
        />
        <div className="flex-1">
          <p className="font-semibold text-slate-900">
            {withinFreeZone ? t.serviceArea.result.within : t.serviceArea.result.beyond}
            {!withinFreeZone && (
              <span className="ml-1 text-blue-700">${travelFee}</span>
            )}
          </p>
          <div className="mt-2 text-sm text-slate-600">
            <div>
              <strong>{city}</strong> — {t.serviceArea.result.approxDistance} {miles} {t.serviceArea.result.miles}
            </div>
            {!withinFreeZone && (
              <div className="mt-1 text-slate-500">
                {t.serviceArea.result.feeFormula.replace('{extra}', String(extraMiles))} (free within {FREE_RADIUS_MILES} mi · ${PER_MILE_FEE}/mi after)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
