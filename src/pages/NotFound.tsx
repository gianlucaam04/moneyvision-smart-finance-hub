import { ArrowLeft } from 'lucide-react';
import { Page } from '@/components/site/Page';

export default function NotFound() {
  return (
    <Page current="">
      <div className="mv-wrap mv-notfound">
        <p className="mv-overline">404</p>
        <h1 className="mv-h1 mv-h1--page">Nothing left here.</h1>
        <p className="mv-lead">The page you asked for does not exist, or has moved.</p>
        <p>
          <a className="mv-btn mv-btn--primary" href="/">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to the home page
          </a>
        </p>
      </div>
    </Page>
  );
}
