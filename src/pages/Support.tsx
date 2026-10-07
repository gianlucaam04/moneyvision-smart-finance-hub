import { Mail } from 'lucide-react';
import { LegalPage } from '@/components/site/Page';
import { contactMailto, product, site } from '@/site/config';

export default function Support() {
  return (
    <LegalPage current="/support" title="Support" updatedLabel={site.legalUpdatedLabel} updatedISO={site.legalUpdatedISO}>
      <p className="mv-lede">
        The {product.platform} app is {product.status.toLowerCase()} and not yet available, so there is nothing to install and nothing to
        troubleshoot. Questions about the project are welcome all the same.
      </p>

      <h2>Write to us</h2>
      <p>
        <a className="mv-btn mv-btn--primary mv-btn--sm" href={contactMailto}>
          <Mail size={16} aria-hidden="true" />
          {site.email}
        </a>
      </p>
      <p>
        You will get a reply from a person. If you are reporting a problem once the app is out, tell us which iPhone and which version
        of iOS you use, and what you expected to happen. Please do not send screenshots that show your real financial data unless you
        are comfortable doing so.
      </p>

      <h2>Common questions</h2>
      <ul>
        <li>
          <strong>Is the app available?</strong> Not yet. The <a href="/changelog">build log</a> and the{' '}
          <a href="/#status">status section</a> show where it stands.
        </li>
        <li>
          <strong>Where is my data?</strong> On your {product.platform}. See the <a href="/privacy">privacy page</a>.
        </li>
        <li>
          <strong>Can I be told when it launches?</strong> Yes. Email us and we will send one message when it reaches TestFlight or
          the App Store.
        </li>
      </ul>
    </LegalPage>
  );
}
