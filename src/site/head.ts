import { faqs } from '@/content/faq';
import { product, site } from './config';
import type { RouteDef } from './routes';

const OG_IMAGE = `${site.url}/og.png`;
const OG_ALT = "MoneyVision: a margin of 412.60 euros left until the next pay, shown as one large figure on a phone screen.";

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeText = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** JSON-LD must not be able to close its own script tag. */
const jsonLd = (graph: unknown[]) =>
  `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;

const organization = {
  '@type': 'Organization',
  '@id': `${site.url}/#organization`,
  name: site.name,
  url: site.url,
  email: site.email,
  logo: `${site.url}/brand/mark.png`,
  foundingDate: site.startedISO,
  address: { '@type': 'PostalAddress', addressCountry: site.countryCode },
  ...(site.founder
    ? { founder: { '@type': 'Person', name: site.founder.name, ...(site.founder.url ? { url: site.founder.url } : {}) } }
    : {}),
  ...(site.profiles.length > 0 ? { sameAs: [...site.profiles] } : {}),
};

const website = {
  '@type': 'WebSite',
  '@id': `${site.url}/#website`,
  url: site.url,
  name: site.name,
  // The domain people type when they look for the site. Search engines use the
  // name and this alternate name to label the result.
  alternateName: new URL(site.url).hostname,
  inLanguage: 'en',
  publisher: { '@id': organization['@id'] },
};

const application = {
  '@type': 'SoftwareApplication',
  '@id': `${site.url}/#app`,
  name: product.name,
  url: site.url,
  image: OG_IMAGE,
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'iOS 26',
  inLanguage: ['en', 'it'],
  // Honest by construction: it says what stage the app is at, and states no
  // price or download link because there is nothing to download yet.
  creativeWorkStatus: 'In development',
  description:
    'An iPhone app that answers one question: how much can I still spend until the next pay? Data stays on the device, with no account and no bank connection.',
  featureList: [
    'One figure: the margin left in the cycle',
    'Breakdown into four terms that add up to the cent',
    'Comparison of two periods over the same number of days, down to the single movement',
    'Recurring expense and subscription detection',
    'Set-asides for annual bills',
    'Home Screen widget',
  ],
  publisher: { '@id': organization['@id'] },
};

const faqPage = {
  '@type': 'FAQPage',
  '@id': `${site.url}/#faq`,
  mainEntity: faqs.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

function graphFor(route: RouteDef, url: string): unknown[] {
  switch (route.kind) {
    case 'home':
      return [organization, website, application, faqPage];
    case 'about':
      return [organization, { '@type': 'AboutPage', '@id': `${url}#page`, url, name: route.title, isPartOf: { '@id': website['@id'] } }];
    default:
      return [organization, { '@type': 'WebPage', '@id': `${url}#page`, url, name: route.title, isPartOf: { '@id': website['@id'] } }];
  }
}

/** Everything that belongs in <head> for one page, as a string. */
export function buildHead(route: RouteDef): string {
  const url = route.path === '/' ? `${site.url}/` : `${site.url}${route.path}`;
  const title = escapeAttr(route.title);
  const description = escapeAttr(route.description);

  const lines = [
    `<title>${escapeText(route.title)}</title>`,
    `<meta name="description" content="${description}" />`,
    route.noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${url}" />`,
    `<meta name="author" content="${escapeAttr(site.name)}" />`,
    `<meta name="color-scheme" content="light dark" />`,
    `<meta name="theme-color" content="#f2f5f5" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="#0a0f10" media="(prefers-color-scheme: dark)" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeAttr(site.name)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeAttr(OG_ALT)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
  ];
  if (!route.noindex) lines.push(jsonLd(graphFor(route, url)));
  return lines.join('\n    ');
}
