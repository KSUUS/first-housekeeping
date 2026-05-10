import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export function NotFound() {
  const { t } = useLanguage();
  return (
    <section className="section">
      <div className="container-tight text-center">
        <p className="text-brand-600 font-semibold">404</p>
        <h1 className="mt-2 text-4xl font-bold">Page not found</h1>
        <p className="mt-3 text-slate-600">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn-primary mt-7">
          {t.nav.home}
        </Link>
      </div>
    </section>
  );
}
