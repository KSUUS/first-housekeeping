import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Phone, X, Wind, ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '../lib/utils';

const SERVICE_LINKS = [
  { to: '/services/air-duct-cleaning', key: 'airDuct' as const },
  { to: '/services/dryer-vent-cleaning', key: 'dryerVent' as const },
  { to: '/services/carpet-cleaning', key: 'carpet' as const },
];

export function Header() {
  const { lang, setLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [location.pathname]);

  // Close services dropdown when clicking outside
  useEffect(() => {
    if (!servicesOpen) return;
    function onClick(e: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [servicesOpen]);

  const isServiceActive = location.pathname.startsWith('/services/');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="container-tight flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand-600 text-white">
            <Wind className="w-5 h-5" />
          </span>
          <span className="font-bold text-slate-900 text-lg leading-tight whitespace-nowrap">
            {t.brand.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <DesktopLink to="/" end>{t.nav.home}</DesktopLink>

          {/* Services dropdown */}
          <div className="relative" ref={servicesRef}>
            <button
              type="button"
              onClick={() => setServicesOpen((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                isServiceActive
                  ? 'text-brand-600'
                  : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50',
              )}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
            >
              {t.nav.services}
              <ChevronDown className={cn('w-4 h-4 transition-transform', servicesOpen && 'rotate-180')} />
            </button>
            {servicesOpen && (
              <div className="absolute left-0 top-full mt-1 w-64 rounded-lg border border-slate-200 bg-white shadow-lg py-1.5 z-50">
                {SERVICE_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        'block px-4 py-2.5 text-sm transition-colors',
                        isActive
                          ? 'text-brand-700 bg-brand-50 font-medium'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-brand-700',
                      )
                    }
                  >
                    {t.nav[link.key]}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <DesktopLink to="/service-area">{t.nav.serviceArea}</DesktopLink>
          <DesktopLink to="/contact">{t.nav.contact}</DesktopLink>
        </nav>

        {/* Right side actions (desktop) */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
          <LanguageToggle lang={lang} setLang={setLang} />
          {/* Phone — icon only on md/lg, full on xl */}
          <a
            href={`tel:${t.brand.phone.replace(/[^\d+]/g, '')}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-500 hover:text-brand-600 transition-colors whitespace-nowrap"
            title={t.brand.phone}
          >
            <Phone className="w-4 h-4" />
            <span className="hidden xl:inline">{t.brand.phone}</span>
          </a>
          <Link to="/quote" className="btn-accent text-sm py-2 whitespace-nowrap">
            {t.nav.quote}
          </Link>
        </div>

        {/* Mobile actions */}
        <div className="lg:hidden flex items-center gap-2 shrink-0">
          <LanguageToggle lang={lang} setLang={setLang} />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-md text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <nav className="container-tight py-3 flex flex-col">
            <MobileLink to="/" end>{t.nav.home}</MobileLink>

            {/* Services group on mobile (always expanded — simpler UX) */}
            <div className="py-2 border-b border-slate-100">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 px-1 mb-1">
                {t.nav.services}
              </div>
              {SERVICE_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'block pl-3 py-2 text-sm rounded',
                      isActive ? 'text-brand-600 font-medium' : 'text-slate-700',
                    )
                  }
                >
                  {t.nav[link.key]}
                </NavLink>
              ))}
            </div>

            <MobileLink to="/service-area">{t.nav.serviceArea}</MobileLink>
            <MobileLink to="/contact">{t.nav.contact}</MobileLink>

            <div className="flex gap-2 mt-3">
              <a
                href={`tel:${t.brand.phone.replace(/[^\d+]/g, '')}`}
                className="btn-ghost text-sm py-2 flex-1"
              >
                <Phone className="w-4 h-4" />
                {t.nav.callNow}
              </a>
              <Link to="/quote" className="btn-accent text-sm py-2 flex-1">
                {t.nav.quote}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function DesktopLink({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
          isActive
            ? 'text-brand-600'
            : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50',
        )
      }
    >
      {children}
    </NavLink>
  );
}

function MobileLink({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'py-2.5 text-sm font-medium border-b border-slate-100 last:border-0',
          isActive ? 'text-brand-600' : 'text-slate-700',
        )
      }
    >
      {children}
    </NavLink>
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
