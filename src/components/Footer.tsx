import { Link } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { openChat } from '../lib/chat';

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-slate-900 text-slate-300">
      <div className="container-tight py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-white font-bold text-lg">{t.brand.name}</div>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {t.footer.tagline}
          </p>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wide">
            {t.footer.services}
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/services/air-duct-cleaning" className="hover:text-white transition-colors">
                {t.nav.airDuct}
              </Link>
            </li>
            <li>
              <Link to="/services/dryer-vent-cleaning" className="hover:text-white transition-colors">
                {t.nav.dryerVent}
              </Link>
            </li>
            <li>
              <Link to="/services/carpet-cleaning" className="hover:text-white transition-colors">
                {t.nav.carpet}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wide">
            {t.footer.company}
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/service-area" className="hover:text-white transition-colors">
                {t.nav.serviceArea}
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={openChat}
                className="hover:text-white transition-colors"
              >
                {t.nav.quote}
              </button>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">
                {t.nav.contact}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wide">
            {t.contact.title}
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 mt-0.5 text-brand-400" />
              <a href={`tel:${t.brand.phone.replace(/[^\d+]/g, '')}`} className="hover:text-white">
                {t.brand.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-brand-400" />
              <span>{t.brand.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="container-tight py-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-slate-500">
          <span>{t.footer.legal.replace('{year}', String(year))}</span>
          <span>{t.footer.builtWith}</span>
        </div>
      </div>
    </footer>
  );
}
