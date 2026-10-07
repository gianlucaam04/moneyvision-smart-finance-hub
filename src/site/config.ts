// One place for every fact the site states about itself. Pages, the footer,
// the legal texts and the structured data all read from here, so a change of
// name, address or status is a one-file edit.

export const site = {
  name: 'MoneyVision',
  url: 'https://moneyvision.it',
  email: 'amministrazione@moneyvision.it',
  country: 'Italy',
  countryCode: 'IT',

  /** The web version started in June 2025; the iPhone app is its rewrite. */
  startedLabel: 'June 2025',
  startedISO: '2025-06',
  nativeStartedLabel: 'July 2026',

  /** Bump these two together whenever the privacy or terms text changes. */
  legalUpdatedLabel: 'October 7, 2026',
  legalUpdatedISO: '2026-10-07',

  year: 2026,

  /**
   * Optional. Set it and the About page, the privacy policy and the
   * structured data will name the person behind the project. Left empty, the
   * site says "independent project" and gives no name.
   */
  founder: null as null | { name: string; url?: string },

  /**
   * Official profiles of the project: GitHub, LinkedIn, the App Store page once
   * it exists. Listed here they become `sameAs` in the structured data, which is
   * how search engines tie this site to the accounts that belong to it. Leave it
   * empty until the accounts exist and link back to this site: a profile that
   * does not point here proves nothing, and an invented one is worse.
   */
  profiles: [] as readonly string[],
} as const;

export const product = {
  name: 'MoneyVision',
  platform: 'iPhone',
  os: 'iOS 26 or later',
  status: 'In development',
  languages: 'English and Italian',
  question: 'How much can I still spend until the next pay?',
} as const;

export const nav = [
  { label: 'How it works', href: '/#today' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Build log', href: '/changelog' },
  { label: 'About', href: '/about' },
] as const;

export const launchMailto = `mailto:${site.email}?subject=${encodeURIComponent(
  'Tell me when MoneyVision launches',
)}&body=${encodeURIComponent('Please send me one email when MoneyVision reaches TestFlight or the App Store.')}`;

export const contactMailto = `mailto:${site.email}`;
