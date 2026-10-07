import { Mail } from 'lucide-react';
import { Page } from '@/components/site/Page';
import { contactMailto, product, site } from '@/site/config';

const commitments = [
  {
    title: 'Numbers come from one place',
    body: 'Every figure on every screen, in the widget and in the shortcuts is computed by one calculation engine. Money is held as whole cents, and floating point never enters a calculation.',
  },
  {
    title: 'The app tells the truth about each action',
    body: 'A save is confirmed only after it has succeeded. If it fails, the form stays as it was and says so. Signs come from the direction of a movement, never from a stored value.',
  },
  {
    title: 'Your data stays yours',
    body: "No account, no server of ours, no third-party SDKs. The app's own code opens no network connections, and a test scans the source so that it stays that way.",
  },
];

const timeline = [
  { when: site.startedLabel, what: 'The first MoneyVision, a web app, is built.' },
  { when: 'August 2025 to July 2026', what: 'A year of real use. A list of what went wrong grows.' },
  { when: site.nativeStartedLabel, what: 'The rewrite as a native iPhone app begins, starting from requirements and a design system.' },
  { when: 'August 2026', what: 'The app runs on a real iPhone, and the calculation engine passes its full property-based test suite.' },
  { when: 'Today', what: 'Refining the app from use on a real iPhone. A TestFlight build is the next milestone.' },
];

const stack = [
  ['Language', 'Swift 6.2'],
  ['Interface', 'SwiftUI'],
  ['Storage', 'SwiftData, in an App Group shared with the widget'],
  ['Sync', 'CloudKit, private database, optional'],
  ['Extensions', 'WidgetKit and App Intents'],
  ['Tests', 'Unit and property-based tests on the calculation engine'],
  ['Platform', `${product.platform}, ${product.os}`],
];

export default function About() {
  return (
    <Page current="/about">
      <div className="mv-wrap mv-about">
        <header className="mv-about-head">
          <p className="mv-overline">About</p>
          <h1 className="mv-h1 mv-h1--page">Built around numbers you can check.</h1>
          <p className="mv-lead">
            {site.name} is an independent project from {site.country}. It started in {site.startedLabel} as a web app, was used for a
            year, and is now being rebuilt as a native iPhone app.
          </p>
        </header>

        <section className="mv-about-block" aria-labelledby="story">
          <h2 id="story" className="mv-h2">
            Why it exists
          </h2>
          <div className="mv-prose">
            <p>
              The web version did what a finance tracker is supposed to do, and it was used for a year. Along the way it also failed in
              small ways that cost trust: the same amount added up differently on different screens, a save that
              reported success when it had not happened, a date that slipped after midnight, a sign that flipped.
            </p>
            <p>
              Those failures became the requirements for the rewrite. The new app is organised so that they cannot recur: one place
              where numbers are calculated, a confirmation only after a real write, and rules that the build itself checks.
            </p>
            <p>
              The question it answers is narrow on purpose. Not what you spent, not a chart of categories, but how much you can still
              spend before the next pay arrives.
            </p>
          </div>
        </section>

        <section className="mv-about-block" aria-labelledby="commitments">
          <h2 id="commitments" className="mv-h2">
            Three commitments
          </h2>
          <ul className="mv-cards">
            {commitments.map((item) => (
              <li key={item.title} className="mv-glass">
                <h3 className="mv-h3">{item.title}</h3>
                <p className="mv-body">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mv-about-block" aria-labelledby="timeline">
          <h2 id="timeline" className="mv-h2">
            Timeline
          </h2>
          <ol className="mv-timeline">
            {timeline.map((step) => (
              <li key={step.when}>
                <span className="mv-timeline-when">{step.when}</span>
                <span className="mv-timeline-what">{step.what}</span>
              </li>
            ))}
          </ol>
          <p className="mv-fine">
            Dated entries are in the <a href="/changelog">build log</a>.
          </p>
        </section>

        <section className="mv-about-block" aria-labelledby="built">
          <h2 id="built" className="mv-h2">
            How it is built
          </h2>
          <dl className="mv-sheet-list">
            {stack.map(([term, detail]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mv-about-block" aria-labelledby="who">
          <h2 id="who" className="mv-h2">
            Who is behind it
          </h2>
          <div className="mv-prose">
            <p>
              {site.founder ? (
                <>
                  MoneyVision is built by{' '}
                  {site.founder.url ? (
                    <a href={site.founder.url} rel="me noopener">
                      {site.founder.name}
                    </a>
                  ) : (
                    site.founder.name
                  )}
                  , an independent developer in {site.country}.
                </>
              ) : (
                <>MoneyVision is built by one independent developer in {site.country}.</>
              )}{' '}
              Questions, corrections and ideas are welcome.
            </p>
            <p>
              <a className="mv-btn mv-btn--primary mv-btn--sm" href={contactMailto}>
                <Mail size={16} aria-hidden="true" />
                {site.email}
              </a>
            </p>
          </div>
        </section>
      </div>
    </Page>
  );
}
