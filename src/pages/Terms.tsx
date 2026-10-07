import { LegalPage } from '@/components/site/Page';
import { contactMailto, product, site } from '@/site/config';

export default function Terms() {
  return (
    <LegalPage current="/terms" title="Terms" updatedLabel={site.legalUpdatedLabel} updatedISO={site.legalUpdatedISO}>
      <p className="mv-lede">
        The short version: this site describes an app that is not released yet. Use it freely, do not rely on it for financial decisions,
        and remember that every figure in the demos is invented.
      </p>

      <h2>What this site is</h2>
      <p>
        {site.name} is an independent project based in {site.country}. This website presents the {product.platform} app in development
        and records how it is progressing. Nothing here is an offer to sell anything.
      </p>

      <h2>Not financial advice</h2>
      <p>
        {site.name} is a tool for recording and understanding your own spending. It is not financial, investment, tax or legal advice,
        and the figures it shows depend entirely on what you record. Decide with your own judgement and, where it matters, with a
        qualified professional.
      </p>

      <h2>Demos and figures</h2>
      <p>
        The interactive demos on this site use invented numbers. They illustrate how the app calculates and presents information, not
        anyone&rsquo;s real money. Descriptions of features describe the app as designed; the status section and the build log say
        what exists today.
      </p>

      <h2>The app, when it is released</h2>
      <p>
        The app will be distributed through the App Store and will be licensed to you under Apple&rsquo;s standard licensed application
        end user licence agreement, unless a separate licence is stated in the store listing. It is provided as is, without
        warranties beyond those the law gives you.
      </p>

      <h2>Ownership</h2>
      <p>
        The name {site.name}, the logo, the design, the text and the code of this site belong to the project. Apple, iPhone, iCloud,
        Siri, Apple Pay, Shortcuts and App Store are trademarks of Apple Inc., which is not affiliated with this project.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent the law allows, we are not liable for indirect or consequential loss arising from using this site. Nothing in
        these terms limits any right you have as a consumer that cannot be excluded.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by Italian law. This does not take away the consumer protection you have under the law of the country
        where you live.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={contactMailto}>{site.email}</a>
      </p>
    </LegalPage>
  );
}
