import type { ReactNode } from 'react';
import { ArrowDown, Check, Mail } from 'lucide-react';
import { Page } from '@/components/site/Page';
import { CapturePhone } from '@/components/demos/CapturePhone';
import { CycleStrip } from '@/components/demos/CycleStrip';
import { DifferencePhone } from '@/components/demos/DifferencePhone';
import { HeroPhone } from '@/components/demos/HeroPhone';
import { RecurringPhone } from '@/components/demos/RecurringPhone';
import { WidgetPair } from '@/components/demos/WidgetPair';
import { faqs } from '@/content/faq';
import { statusColumns } from '@/content/status';
import { launchMailto, product, site } from '@/site/config';

function Feature({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="mv-feature">
      <h3 className="mv-h3">{title}</h3>
      <p className="mv-body">{children}</p>
    </li>
  );
}

function Split({ id, reverse, copy, visual }: { id: string; reverse?: boolean; copy: ReactNode; visual: ReactNode }) {
  return (
    <section id={id} className="mv-section mv-reveal" aria-labelledby={`${id}-title`}>
      <div className={`mv-wrap mv-split${reverse ? ' is-reverse' : ''}`}>
        <div className="mv-split-copy">{copy}</div>
        <div className="mv-split-visual">{visual}</div>
      </div>
    </section>
  );
}

const zeros = [
  { n: '0', what: 'accounts to create' },
  { n: '0', what: 'servers of ours' },
  { n: '0', what: 'third-party SDKs in the app' },
  { n: '0', what: 'ads or analytics' },
];

const sheet = [
  ['Where your data lives', 'In a local database on your iPhone.'],
  [
    'Sync',
    'Optional, through your private iCloud database. Apple operates it. MoneyVision has no server that receives your data.',
  ],
  ['Network', "The app's own code opens no network connections. A test scans the source to keep it that way."],
  ['Permissions', 'Notifications, if you want them. Nothing else is requested.'],
  ['Import and export', 'Through the system file picker. Export is a versioned JSON document.'],
  ['Platform', `${product.platform}, ${product.os}.`],
  ['Languages', `${product.languages}.`],
  ['Price', 'Planned as free. No subscription in the version being built.'],
  ['Built with', 'Swift 6.2, SwiftUI, SwiftData, CloudKit, WidgetKit and App Intents.'],
  ['Money', 'Whole cents throughout. No floating point in any calculation.'],
] as const;

export default function Home() {
  return (
    <Page current="/">
      {/* Hero */}
      <section className="mv-hero" aria-labelledby="hero-title">
        <div className="mv-wrap mv-hero-grid">
          <div className="mv-hero-copy">
            <p className="mv-status-chip mv-rise d0">
              <span className="mv-dot" aria-hidden="true" />
              {product.platform} app · {product.status.toLowerCase()}
            </p>
            <h1 id="hero-title" className="mv-h1 mv-rise d1">
              Know what&rsquo;s <span className="mv-accent">left.</span>
            </h1>
            <p className="mv-lead mv-rise d2">
              {product.name} answers one question: how much can I still spend until the next pay? One calm number, calculated on your
              phone. No account, no bank connection.
            </p>
            <div className="mv-actions mv-rise d3">
              <a className="mv-btn mv-btn--primary" href={launchMailto}>
                <Mail size={18} aria-hidden="true" />
                Email me at launch
              </a>
              <a className="mv-btn mv-btn--ghost" href="#today">
                See how it works
                <ArrowDown size={18} aria-hidden="true" />
              </a>
            </div>
            <ul className="mv-proof mv-rise d4">
              {['No account', 'No bank connection', 'No ads or analytics', 'Works offline'].map((text) => (
                <li key={text}>
                  <Check size={16} strokeWidth={3} aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="mv-hero-visual mv-rise d2">
            <HeroPhone />
          </div>
        </div>
        <div className="mv-band" aria-hidden="true">
          <i className="mv-seg mv-seg--spent" />
          <i className="mv-seg mv-seg--committed" />
          <i className="mv-seg mv-seg--expected" />
          <i className="mv-seg mv-seg--free" />
        </div>
      </section>

      {/* One number */}
      <section id="today" className="mv-section mv-reveal" aria-labelledby="today-title">
        <div className="mv-wrap">
          <div className="mv-section-head">
            <p className="mv-overline">The Today tab</p>
            <h2 id="today-title" className="mv-h2">
              One number, not a dashboard.
            </h2>
            <p className="mv-lead">
              Open the app and the Today tab shows what is left of your cycle: your income, minus what you have spent, minus what you
              have set aside for bills that are not monthly, minus the recurring outflows still to come.
            </p>
          </div>
          <CycleStrip />
          <ul className="mv-features">
            <Feature title="The cycle">
              A calendar month by default. With a recurring income, a pay cycle that runs from one pay day to the next. The formulas
              are the same in both.
            </Feature>
            <Feature title="Set-asides">
              Spread an annual bill, like insurance or a car tax, over the cycles that remain, so it never lands on a single month.
            </Feature>
            <Feature title="Spending pace">
              Past the middle of a cycle, a short note appears only if you are using the margin faster than the cycle is passing.
            </Feature>
          </ul>
        </div>
      </section>

      {/* Analysis */}
      <Split
        id="difference"
        copy={
          <>
            <p className="mv-overline">The Analysis tab</p>
            <h2 id="difference-title" className="mv-h2">
              Where the difference comes from.
            </h2>
            <p className="mv-lead">
              Last cycle against this one, over the same number of days. A cycle that has just begun is never flattered by one that
              is finished, and the gap is split into contributions that add up to the cent.
            </p>
            <ul className="mv-features mv-features--stack">
              <Feature title="Same window">
                Both periods are cut to the same number of days from their start, and the screen says which days.
              </Feature>
              <Feature title="Exact sums">
                Contributions add up to the difference at every level: category, description, single movement.
              </Feature>
              <Feature title="Outflows only">
                The comparison looks at what went out. Transfers between your own accounts are never counted as spending.
              </Feature>
            </ul>
          </>
        }
        visual={<DifferencePhone />}
      />

      {/* Recurring */}
      <Split
        id="recurring"
        reverse
        copy={
          <>
            <p className="mv-overline">Recurring expenses and subscriptions</p>
            <h2 id="recurring-title" className="mv-h2">
              It notices what repeats.
            </h2>
            <p className="mv-lead">
              When the same expense shows up in at least three separate periods, the app proposes it and shows the evidence: how
              many cycles, the median amount, the usual day. Nothing is added until you say so.
            </p>
            <ul className="mv-features mv-features--stack">
              <Feature title="Evidence, not a verdict">
                Every suggestion carries its numbers and a dashed outline, because a suggestion is not yet a fact.
              </Feature>
              <Feature title="Ignoring is reversible">
                Ignored suggestions wait in a list, and each one can be put back among the detected ones.
              </Feature>
              <Feature title="Subscriptions">
                Declare a renewal date and a recurring expense becomes a subscription: listed by renewal, with the yearly total, and a
                reminder three days before it renews.
              </Feature>
            </ul>
          </>
        }
        visual={<RecurringPhone />}
      />

      {/* Capture */}
      <Split
        id="capture"
        copy={
          <>
            <p className="mv-overline">Adding a movement</p>
            <h2 id="capture-title" className="mv-h2">
              Quick to record. Honest about it.
            </h2>
            <p className="mv-lead">
              The form opens on today&rsquo;s date, the account you used last, and the amount. Type a description and it suggests
              earlier ones, filling category, usual amount and account. The confirmation appears only after the save has really
              happened.
            </p>
            <ul className="mv-features mv-features--stack">
              <Feature title="Widget">
                Small and medium Home Screen widgets show the margin and the days left. Tap one to add a movement.
              </Feature>
              <Feature title="Siri and Shortcuts">
                An action records an expense without opening the app. The voice phrases are still being refined.
              </Feature>
              <Feature title="Apple Pay">
                A Shortcuts automation can send each payment to the app, marked to confirm and already counted in your margin. You
                set it up once: iOS does not let an app create it for you.
              </Feature>
            </ul>
            <WidgetPair />
          </>
        }
        visual={<CapturePhone />}
      />

      {/* Private */}
      <section id="private" className="mv-section mv-reveal" aria-labelledby="private-title">
        <div className="mv-wrap">
          <div className="mv-vault">
            <div className="mv-section-head">
              <p className="mv-overline">Private by design</p>
              <h2 id="private-title" className="mv-h2">
                Your data never needs a server.
              </h2>
              <p className="mv-lead">
                There is nothing to sign up for, no bank to connect and nobody on the other end collecting. Here is what that means in
                practice.
              </p>
            </div>
            <ul className="mv-zeros">
              {zeros.map((zero) => (
                <li key={zero.what} className="mv-glass">
                  <span className="mv-zero">{zero.n}</span>
                  <span className="mv-zero-what">{zero.what}</span>
                </li>
              ))}
            </ul>
            <dl className="mv-sheet-list">
              {sheet.map(([term, detail]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
            <p className="mv-fine">
              These statements describe the code as it is today. The privacy manifest and the App Store privacy labels are still to be
              written before release. Read the <a href="/privacy">privacy page</a> for the full text.
            </p>
          </div>
        </div>
      </section>

      {/* Status */}
      <section id="status" className="mv-section mv-reveal" aria-labelledby="status-title">
        <div className="mv-wrap">
          <div className="mv-section-head">
            <p className="mv-overline">Where it stands</p>
            <h2 id="status-title" className="mv-h2">
              A real app, still in progress.
            </h2>
            <p className="mv-lead">
              {site.name} is not on TestFlight or the App Store yet. This is what exists, what still has to be proven, and what has
              not been started. The <a href="/changelog">build log</a> has the dates.
            </p>
          </div>
          <div className="mv-status-grid">
            {statusColumns.map((column) => (
              <section key={column.key} className={`mv-status-col is-${column.key}`} aria-labelledby={`status-${column.key}`}>
                <h3 id={`status-${column.key}`} className="mv-h3">
                  {column.title}
                  <span className="mv-status-count">{column.items.length}</span>
                </h3>
                <p className="mv-fine">{column.note}</p>
                <ul>
                  {column.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mv-section mv-reveal" aria-labelledby="faq-title">
        <div className="mv-wrap mv-faq-wrap">
          <div className="mv-section-head">
            <p className="mv-overline">Questions</p>
            <h2 id="faq-title" className="mv-h2">
              Plain answers.
            </h2>
          </div>
          <div className="mv-faq">
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="mv-section mv-reveal" aria-labelledby="final-title">
        <div className="mv-wrap">
          <div className="mv-glass mv-final">
            <h2 id="final-title" className="mv-h2">
              Be told when it&rsquo;s ready.
            </h2>
            <p className="mv-lead">
              One email when {site.name} reaches TestFlight or the App Store. Nothing else, and the address is deleted after that
              message.
            </p>
            <a className="mv-btn mv-btn--primary" href={launchMailto}>
              <Mail size={18} aria-hidden="true" />
              Email me at launch
            </a>
          </div>
        </div>
      </section>
    </Page>
  );
}
