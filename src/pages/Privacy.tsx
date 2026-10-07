import { LegalPage } from '@/components/site/Page';
import { contactMailto, product, site } from '@/site/config';

export default function Privacy() {
  const controller = site.founder ? `${site.founder.name} (${site.name})` : `${site.name}, an independent project based in ${site.country}`;
  return (
    <LegalPage current="/privacy" title="Privacy" updatedLabel={site.legalUpdatedLabel} updatedISO={site.legalUpdatedISO}>
      <p className="mv-lede">
        The short version: this website sets no cookies, runs no analytics and loads nothing from third parties. The {product.platform} app
        keeps your data on your phone, and there is no account to create.
      </p>

      <h2>Who is responsible</h2>
      <p>
        {controller}. You can write to <a href={contactMailto}>{site.email}</a> about anything on this page.
      </p>

      <h2>This website</h2>
      <ul>
        <li>No cookies, no local storage, no analytics, no advertising and no tracking pixels.</li>
        <li>
          Fonts, images and scripts are served from this site. Nothing is requested from other companies&rsquo; servers while you
          browse.
        </li>
        <li>
          The site is hosted by Netlify. Like any web host, it processes technical data such as your IP address, browser type and the
          page requested in order to deliver pages and keep the service secure. We do not use it to identify you.
        </li>
        <li>There are no forms. When you send an email, a link on the site opens your own mail app.</li>
        <li>
          A small script removes any service worker that an older version of this site may have installed in your browser, and then
          removes itself.
        </li>
      </ul>

      <h2>If you email us</h2>
      <p>
        We use your address and message only to answer you. If you ask to be told when the app launches, we keep your address for
        that one message and delete it afterwards. We do not add you to any other list and we do not share your address with anyone.
        The legal basis is our legitimate interest in answering a message you sent us, or your request to be told about the launch.
      </p>

      <h2>The {product.platform} app</h2>
      <p>The app is not released yet. This section describes how it is built, so that you can judge it before you install it.</p>
      <ul>
        <li>Your movements, accounts, categories, goals and settings are stored in a local database on your {product.platform}.</li>
        <li>
          There is no account, no sign-up and no email address to give. MoneyVision does not run a server that receives your data.
        </li>
        <li>
          If you are signed in to iCloud, the app can replicate your data through your private iCloud database. That service is
          operated by Apple under your Apple Account and subject to Apple&rsquo;s terms. We cannot read it.
        </li>
        <li>
          The app contains no analytics, no advertising and no third-party SDKs. Its own code opens no network connections, and a
          test scans the source to keep it that way.
        </li>
        <li>The only permission it asks for is to send notifications, and only if you choose to receive them.</li>
        <li>
          Import and export go through the system file picker. An export is a file you own. If you ever send us one for support, it
          is because you chose to.
        </li>
        <li>The app has a command that deletes all your data on the device, after a double confirmation.</li>
      </ul>
      <p>
        Before release, a privacy manifest and the App Store privacy details will be added, and this page will be updated to match
        them.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the GDPR you can ask to access, correct, delete, restrict or export the personal data we hold about you, and you can
        object to its use. Since we hold almost none, the practical request is usually to delete an email. Write to{' '}
        <a href={contactMailto}>{site.email}</a> and we will answer within one month. You can also complain to the Italian data
        protection authority, the{' '}
        <a href="https://www.garanteprivacy.it" lang="it">
          Garante per la protezione dei dati personali
        </a>
        .
      </p>

      <h2>Changes</h2>
      <p>If this page changes in a way that matters, the date at the top changes with it.</p>
    </LegalPage>
  );
}
