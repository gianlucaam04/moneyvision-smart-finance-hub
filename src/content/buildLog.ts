// Dated from the real commit history of the iPhone app and of the web version.
// Written for readers, not as a copy of commit messages.

export interface BuildLogEntry {
  iso: string;
  label: string;
  title: string;
  points: readonly string[];
}

export const buildLog: readonly BuildLogEntry[] = [
  {
    iso: '2026-08-04',
    label: 'August 4, 2026',
    title: 'First-run setup, notifications, messages',
    points: [
      'First-run setup rebuilt as four steps. Each can be skipped and none needs typing: currency, how to count the month, accounts, data.',
      'Notification settings regrouped by kind of rule. The system permission comes first, with a link to Settings when it is denied.',
      'Outcome messages now go away on their own, and a new one replaces the previous instead of stacking.',
    ],
  },
  {
    iso: '2026-08-03',
    label: 'August 3, 2026',
    title: 'Expected outflows on screen, import and currency fixes',
    points: [
      'Recurring outflows still expected are part of the margin, and the next one is shown with its date.',
      'The spending-pace note appears after saving a movement, but only past the middle of the cycle and only above the threshold.',
      'Currency is chosen from a list instead of typed as a code.',
      'Fixed the import of a document that carries no currency, which is how the first web version exported. Still to be checked on a real iPhone.',
      'Fixed complete data deletion, which failed on any configured archive.',
      'Fixed a database context being used off the thread that created it.',
    ],
  },
  {
    iso: '2026-08-02',
    label: 'August 2, 2026',
    title: 'Widget, shortcuts, localisation, verification',
    points: [
      'Home Screen widget, and two App Intents: record an expense, and import a payment from a Shortcuts automation.',
      'English and Italian string catalog, with checks for Dynamic Type, VoiceOver labels and contrast.',
      'All fifteen correctness properties of the calculation engine run in the test suite. Performance budgets measured on the simulator.',
      'Manual form for recurring expenses, set-asides in Settings, onboarding wired into the app root.',
    ],
  },
  {
    iso: '2026-08-01',
    label: 'August 1, 2026',
    title: 'Storage, sync and the main tabs',
    points: [
      'Local archive and a versioned JSON document for import and export.',
      'Sync service for the private iCloud database, with conflicts resolved by the latest update and logged.',
      'Recurring-expense detector, description index and a single search box.',
      'Movements, Analysis and Goals tabs, and the notification service.',
    ],
  },
  {
    iso: '2026-07-27',
    label: 'July 27, 2026',
    title: 'The calculation engine',
    points: [
      'Margin, comparable window, differences, set-asides, goals and spending pace, written as pure functions that every screen, the widget and the shortcuts share.',
    ],
  },
  {
    iso: '2026-07-26',
    label: 'July 26, 2026',
    title: 'Rewrite for iPhone begins',
    points: [
      'Requirements, design and design system written first.',
      'Project skeleton with architectural rules enforced by the build and by a test that scans the source, including the rule that no module opens a network connection.',
      'First domain types and the pay-cycle calculation.',
    ],
  },
  {
    iso: '2025-06',
    label: 'June 2025 to July 2026',
    title: 'The web version',
    points: [
      'The first MoneyVision, a web app, started in June 2025 and was used for a year. Its failures became the requirements for the rewrite. It has been retired.',
    ],
  },
];
