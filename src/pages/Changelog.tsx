import { Page } from '@/components/site/Page';
import { buildLog } from '@/content/buildLog';
import { product } from '@/site/config';

export default function Changelog() {
  return (
    <Page current="/changelog">
      <div className="mv-wrap mv-about">
        <header className="mv-about-head">
          <p className="mv-overline">Build log</p>
          <h1 className="mv-h1 mv-h1--page">What changed, and when.</h1>
          <p className="mv-lead">
            {product.name} for {product.platform} is {product.status.toLowerCase()} and has no public release yet, so there are no
            version numbers. These are the dated milestones, newest first, written from the project&rsquo;s real history.
          </p>
        </header>

        <ol className="mv-log">
          {buildLog.map((entry) => (
            <li key={entry.iso} className="mv-log-entry">
              <time className="mv-log-date" dateTime={entry.iso}>
                {entry.label}
              </time>
              <div>
                <h2 className="mv-h3">{entry.title}</h2>
                <ul>
                  {entry.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Page>
  );
}
