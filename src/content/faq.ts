// Plain strings only: the same text feeds the visible FAQ and the FAQPage
// structured data, so nothing here may contain markup.

export interface Faq {
  q: string;
  a: string;
}

export const faqs: readonly Faq[] = [
  {
    q: 'Is MoneyVision available?',
    a: 'Not yet. It is in development for iPhone and is not on TestFlight or the App Store. The build log shows what exists today, and you can email to be told once when it launches.',
  },
  {
    q: 'How much will it cost?',
    a: 'The plan is a free app, with no subscription and no paid tier in the version being built. Nothing beyond that is promised until it is released.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. First-run setup asks for a currency, how to count the month and, if you like, your accounts. Every step can be skipped. There is no sign-up, no email address and no password.',
  },
  {
    q: 'Does it connect to my bank?',
    a: 'No. There is no bank link and no request for credentials. You record movements yourself, from the app, from the Home Screen widget or through Shortcuts.',
  },
  {
    q: 'Where is my data?',
    a: 'On your iPhone, in a local database. If you are signed in to iCloud, the app can replicate it through your private iCloud database, which Apple operates under your Apple Account. MoneyVision has no server that receives it. Without iCloud the app works on this device only.',
  },
  {
    q: 'What is the margin, exactly?',
    a: 'The income of the cycle, minus the outflows recorded, minus the set-asides still to cover, minus the recurring outflows still expected. Tap the number in the app and the four terms are listed. They always add up to the figure shown.',
  },
  {
    q: 'Why a pay cycle and not a calendar month?',
    a: 'If your pay arrives on the 13th, a calendar month ends on the wrong day for you. The default is the calendar month. If you have a recurring income you can switch to a pay cycle, which runs from one pay day to the next. Everything else is calculated the same way.',
  },
  {
    q: 'Does it have budgets per category?',
    a: 'Not in version 1. In a year of using the web version, no category budget was ever set, so the first release relies on the margin and on set-asides for annual bills. Budgets may come later, proposed from your own history.',
  },
  {
    q: 'Which devices and languages?',
    a: 'iPhone with iOS 26 or later, in English and Italian. Each archive uses a single currency, picked from the list the system knows.',
  },
  {
    q: 'Who makes it?',
    a: 'MoneyVision is an independent project from Italy, built by one developer. It started in June 2025 as a web app and is being rebuilt as a native iPhone app.',
  },
];
