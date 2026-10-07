import { Menu } from 'lucide-react';
import { launchMailto, nav } from '@/site/config';

interface SiteHeaderProps {
  /** Path of the page being shown, to mark the matching link. */
  current: string;
}

export function SiteHeader({ current }: SiteHeaderProps) {
  return (
    <header className="mv-header">
      <div className="mv-header-bar mv-glass">
        <a className="mv-brand" href="/" aria-label="MoneyVision home">
          <img src="/brand/mark-96.webp" width={40} height={40} alt="" />
          <span>MoneyVision</span>
        </a>

        <nav className="mv-nav" aria-label="Primary">
          {nav.map((item) => (
            <a key={item.href} href={item.href} aria-current={item.href === current ? 'page' : undefined}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="mv-btn mv-btn--primary mv-btn--sm mv-header-cta" href={launchMailto}>
          Get notified
        </a>

        <details className="mv-menu">
          <summary aria-label="Menu">
            <Menu size={22} aria-hidden="true" />
          </summary>
          <div className="mv-menu-panel mv-glass">
            {nav.map((item) => (
              <a key={item.href} href={item.href} aria-current={item.href === current ? 'page' : undefined}>
                {item.label}
              </a>
            ))}
            <a className="mv-btn mv-btn--primary mv-btn--sm" href={launchMailto}>
              Get notified
            </a>
          </div>
        </details>
      </div>
    </header>
  );
}
