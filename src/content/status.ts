// What exists and what does not. Kept honest on purpose: the site never says
// "available" for something that is not on a device yet.

export interface StatusColumn {
  key: 'built' | 'proof' | 'refining' | 'next';
  title: string;
  note: string;
  items: readonly string[];
}

export const statusColumns: readonly StatusColumn[] = [
  {
    key: 'built',
    title: 'Built',
    note: 'Code complete, tests passing, seen on the simulator.',
    items: [
      'Today tab with the four-term breakdown',
      'Period comparison over the same number of days, down to the single movement',
      'Recurring expense and subscription detection',
      'Goals and set-asides for annual bills',
      'Local notifications from fixed rules',
      'Home Screen widget, small and medium',
      'Four-step first-run setup, every step skippable',
      'English and Italian',
    ],
  },
  {
    key: 'proof',
    title: 'Awaiting proof',
    note: 'Built, but not yet shown to work on real hardware.',
    items: [
      'iCloud sync between two devices',
      'Delivery of notifications',
      'Apple Pay capture through a Shortcuts automation, with a real payment',
    ],
  },
  {
    key: 'refining',
    title: 'Being refined',
    note: 'Found while using the app on an iPhone.',
    items: [
      'Importing a document exported by an older version',
      'Pickers instead of text fields wherever the choices are known',
      'Voice phrases for Siri that can be discovered in Settings',
      'A one-tap start for the Apple Pay automation',
    ],
  },
  {
    key: 'next',
    title: 'Not started',
    note: 'Needed before anyone else can use it.',
    items: ['TestFlight and App Store release', 'Privacy manifest and App Store privacy labels', 'Store listing and screenshots'],
  },
];
