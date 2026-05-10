import { useEffect } from 'react';

const SITE_URL = 'https://firsthousekeeping.com';
const SITE_NAME = 'First Housekeeping';
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`; // TODO: replace with proper 1200x630 OG image when available

export interface SEOInput {
  /** Full HTML <title>. Should include brand name. */
  title: string;
  /** Meta description — 140-160 chars optimal. */
  description: string;
  /** Relative path (e.g. '/services/air-duct-cleaning') — converted to absolute canonical. */
  path: string;
  /** Optional absolute URL for Open Graph image (1200x630 ideally). */
  ogImage?: string;
  /** Optional ld+json structured data (will replace the per-page block, not the global one) */
  jsonLd?: object | object[];
  /** Set to true if Google should NOT index this page (e.g. /admin). */
  noindex?: boolean;
}

/**
 * Apply page-level SEO: <title>, meta description, canonical, Open Graph,
 * Twitter card, optional ld+json. Cleans up on unmount.
 *
 * Note: This is client-side rendering — Google's crawler runs JS, so this
 * works for Googlebot. If we ever need pre-rendering (for, say, AI search
 * crawlers that don't run JS), revisit with vite-plugin-ssr or similar.
 */
export function useSEO(seo: SEOInput) {
  useEffect(() => {
    const canonical = SITE_URL + (seo.path.startsWith('/') ? seo.path : '/' + seo.path);
    const ogImage = seo.ogImage ?? DEFAULT_OG_IMAGE;

    document.title = seo.title;
    setMeta('description', seo.description);
    setMeta('robots', seo.noindex ? 'noindex,nofollow' : 'index,follow');

    setMeta('og:title', seo.title, true);
    setMeta('og:description', seo.description, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', canonical, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:image', ogImage, true);

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', seo.title);
    setMeta('twitter:description', seo.description);
    setMeta('twitter:image', ogImage);

    setLink('canonical', canonical);

    let jsonLdNode: HTMLScriptElement | null = null;
    if (seo.jsonLd) {
      jsonLdNode = document.createElement('script');
      jsonLdNode.type = 'application/ld+json';
      jsonLdNode.dataset.seo = 'page';
      jsonLdNode.textContent = JSON.stringify(seo.jsonLd);
      // Remove any previous page-level ld+json before adding new
      document
        .querySelectorAll('script[data-seo="page"]')
        .forEach((n) => n.remove());
      document.head.appendChild(jsonLdNode);
    } else {
      document
        .querySelectorAll('script[data-seo="page"]')
        .forEach((n) => n.remove());
    }

    return () => {
      // Don't blow away on unmount — next page's useSEO will overwrite.
      // We only clean up our per-page ld+json so old structured data
      // doesn't leak across route changes.
      if (jsonLdNode && jsonLdNode.parentNode) {
        jsonLdNode.parentNode.removeChild(jsonLdNode);
      }
    };
  }, [seo.title, seo.description, seo.path, seo.ogImage, seo.noindex, JSON.stringify(seo.jsonLd ?? null)]);
}

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

// =====================================================================
// Schema.org helpers
// =====================================================================

export const BRAND_PHONE = '+1-470-991-8071';
export const BRAND_PHONE_DISPLAY = '(470) 991-8071';

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}#business`,
    name: SITE_NAME,
    alternateName: '第一家政',
    description:
      'Professional air duct cleaning, dryer vent cleaning, and carpet cleaning serving metro Atlanta. Bilingual English/Chinese service. Licensed and insured.',
    url: SITE_URL,
    telephone: BRAND_PHONE,
    image: DEFAULT_OG_IMAGE,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Duluth',
      addressRegion: 'GA',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.9876,
      longitude: -84.1418,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '17:00',
      },
    ],
    areaServed: [
      'Duluth, GA',
      'Johns Creek, GA',
      'Suwanee, GA',
      'Alpharetta, GA',
      'Roswell, GA',
      'Norcross, GA',
      'Lawrenceville, GA',
      'Marietta, GA',
      'Atlanta, GA',
    ],
    knowsLanguage: ['en', 'zh'],
    sameAs: [], // add Facebook / Google Business / Yelp URLs once available
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: input.url,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}#business`,
      name: SITE_NAME,
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 33.9876,
        longitude: -84.1418,
      },
      geoRadius: 50000, // 50 km
    },
  };
}
