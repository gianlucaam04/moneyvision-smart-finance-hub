import { Mail } from 'lucide-react';
import { contactMailto, site } from '@/site/config';

export function SiteFooter() {
  return (
    <footer className="mv-footer">
      <div className="mv-wrap">
        <div className="mv-footer-grid">
          <div className="mv-footer-about">
            <a className="mv-brand" href="/" aria-label="MoneyVision home">
              <img src="/brand/mark-96.webp" width={40} height={40} alt="" />
              <span>MoneyVision</span>
            </a>
            <p>
              An independent project from {site.country}. The web version started in {site.startedLabel}; the iPhone app is in
              development.
            </p>
            {site.founder && (
              <p>
                Built by{' '}
                {site.founder.url ? (
                  <a href={site.founder.url} rel="me noopener">
                    {site.founder.name}
                  </a>
                ) : (
                  site.founder.name
                )}
                .
              </p>
            )}
            <a className="mv-footer-mail" href={contactMailto}>
              <Mail size={16} aria-hidden="true" />
              {site.email}
            </a>
          </div>

          <nav aria-label="Product">
            <h2 className="mv-footer-title">Product</h2>
            <ul>
              <li>
                <a href="/#today">How it works</a>
              </li>
              <li>
                <a href="/#status">Where it stands</a>
              </li>
              <li>
                <a href="/changelog">Build log</a>
              </li>
              <li>
                <a href="/#faq">Questions</a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <h2 className="mv-footer-title">Project</h2>
            <ul>
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/support">Support</a>
              </li>
              <li>
                <a href={contactMailto}>Contact</a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <h2 className="mv-footer-title">Legal</h2>
            <ul>
              <li>
                <a href="/privacy">Privacy</a>
              </li>
              <li>
                <a href="/terms">Terms</a>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mv-footer-legal">
          © 2025 to {site.year} MoneyVision. Apple, iPhone, iCloud, Siri, Apple Pay, Shortcuts, Home Screen and App Store are
          trademarks of Apple Inc. MoneyVision is not affiliated with or endorsed by Apple. Every figure shown in the demos on this
          site is invented.
        </p>
      </div>
    </footer>
  );
}
