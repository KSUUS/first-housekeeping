import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Phone, X, Wind } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '../lib/utils';

export function Header() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: t.nav.home },
    { to: '/services/air-duct-cleaning', label: t.nav.airDuct },
    { to: '/services/dryer-vent-cleaning', label: t.nav.dryerVent },
    { to: '/services/carpet-cleaning', label: t.nav.carpet },
    { to: '/service-area', label: t.nav.serviceArea },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="container-tight flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand-600 text-white">
            <Wind className="w-5 h-5" />
          </span>
          <span className="font-bold text-slate-900 text-lg leading-tight">
            {t.brand.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition-colors',
                  isActive
                    ? 'text-brand-600'
                    : 'text-slate-600 hover:text-brand-600',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <LanguageToggle lang={lang} setLang={setLang} />
          <a href={`tel:${t.brand.phone.replace(/[^\d+]/g, '')}`} className="btn-ghost text-sm py-2">
            <Phone className="w-4 h-4" />
            {t.brand.phone}
          </a>
          <Link to="/quote" className="btn-accent text-sm py-2">
            {t.nav.quote}
          </Link>
        </div>

        {/* Mobile actions */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageToggle lang={lang} setLang={setLang} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-md text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <nav className="container-tight py-3 flex flex-col">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'py-2.5 text-sm font-medium border-b border-slate-100 last:border-0',
                    isActive ? 'text-brand-600' : 'text-slate-700',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="flex gap-2 mt-3">
              <a
                href={`tel:${t.brand.phone.replace(/[^\d+]/g, '')}`}
                className="btn-ghost text-sm py-2 flex-1"
              >
                <Phone className="w-4 h-4" />
                {t.nav.callNow}
              </a>
              <Link to="/quote" onClick={() => setOpen(false)} className="btn-accent text-sm py-2 flex-1">
                {t.nav.quote}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function LanguageToggle({ lang, setLang }: { lang: 'en' | 'zh'; setLang: (l: 'en' | 'zh') => void }) {
  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => setLang('en')}
        className={cn(
          'px-2.5 py-1 rounded',
          lang === 'en' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700',
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('zh')}
        className={cn(
          'px-2.5 py-1 rounded',
          lang === 'zh' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700',
        )}
      >
        中文
      </button>
    </div>
  );
}
