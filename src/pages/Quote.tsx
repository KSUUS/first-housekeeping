import { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function Quote() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');

    // TODO: wire to a real backend (Cloudflare Worker, Formspree, Web3Forms, etc).
    // For MVP we simulate success after a short delay so the UX is correct end-to-end.
    try {
      const data = new FormData(e.currentTarget);
      // Log so you can see captured fields during dev:
      // eslint-disable-next-line no-console
      console.log('Quote request:', Object.fromEntries(data.entries()));
      await new Promise((r) => setTimeout(r, 700));
      setStatus('success');
      e.currentTarget.reset();
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <section className="section">
        <div className="container-tight max-w-xl">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h1 className="mt-4 text-2xl font-bold text-emerald-900">
              {t.quote.form.successTitle}
            </h1>
            <p className="mt-3 text-slate-700">{t.quote.form.successBody}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-gradient-to-br from-brand-50 via-white to-emerald-50">
        <div className="container-tight py-14">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">{t.quote.title}</h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl">{t.quote.subtitle}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-tight max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label" htmlFor="name">{t.quote.form.name} *</label>
                <input id="name" name="name" type="text" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="phone">{t.quote.form.phone} *</label>
                <input id="phone" name="phone" type="tel" required className="input" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label" htmlFor="email">{t.quote.form.email}</label>
                <input id="email" name="email" type="email" className="input" />
              </div>
              <div>
                <label className="label" htmlFor="zip">{t.quote.form.zip} *</label>
                <input id="zip" name="zip" type="text" inputMode="numeric" maxLength={5} required className="input" />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="service">{t.quote.form.service} *</label>
              <select id="service" name="service" required defaultValue="" className="input">
                <option value="" disabled>
                  {t.quote.form.servicePlaceholder}
                </option>
                <option value="airDuct">{t.quote.form.services.airDuct}</option>
                <option value="dryerVent">{t.quote.form.services.dryerVent}</option>
                <option value="carpet">{t.quote.form.services.carpet}</option>
                <option value="multiple">{t.quote.form.services.multiple}</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="homeSize">{t.quote.form.homeSize}</label>
              <input
                id="homeSize"
                name="homeSize"
                type="text"
                placeholder={t.quote.form.homeSizePlaceholder}
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="details">{t.quote.form.details}</label>
              <textarea
                id="details"
                name="details"
                rows={4}
                placeholder={t.quote.form.detailsPlaceholder}
                className="input"
              />
            </div>

            {status === 'error' && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{t.quote.form.errorBody}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-accent w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? t.quote.form.submitting : t.quote.form.submit}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
