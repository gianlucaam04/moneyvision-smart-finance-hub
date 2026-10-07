import type { ReactNode } from 'react';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

interface PageProps {
  current: string;
  children: ReactNode;
}

/** The frame every page shares: skip link, header, main landmark, footer. */
export function Page({ current, children }: PageProps) {
  return (
    <>
      <a className="mv-skip" href="#content">
        Skip to content
      </a>
      <SiteHeader current={current} />
      <main id="content">{children}</main>
      <SiteFooter />
    </>
  );
}

interface LegalProps {
  current: string;
  title: string;
  updatedLabel: string;
  updatedISO: string;
  children: ReactNode;
}

/** Layout for text-heavy pages: privacy, terms, support. */
export function LegalPage({ current, title, updatedLabel, updatedISO, children }: LegalProps) {
  return (
    <Page current={current}>
      <div className="mv-wrap mv-legal">
        <header className="mv-legal-head">
          <p className="mv-overline">{title === 'Support' ? 'Help' : 'Legal'}</p>
          <h1 className="mv-h2">{title}</h1>
          <p className="mv-fine">
            Last updated <time dateTime={updatedISO}>{updatedLabel}</time>
          </p>
        </header>
        <article className="mv-prose">{children}</article>
      </div>
    </Page>
  );
}
