import { Component } from '@angular/core';
import { CONTACT_EMAIL } from '../shared/ads.config';

// Required by Google AdSense: sites showing ads must disclose cookie use by Google and its partners
@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `
    <article class="p-8 bg-white rounded-xl shadow-sm border border-slate-100 text-sm text-slate-600 leading-relaxed space-y-4">
      <h1 class="text-2xl font-bold text-slate-800">Privacy Policy</h1>
      <p class="text-xs text-slate-400">Last updated: {{ lastUpdated }}</p>

      <h2 class="text-base font-bold text-slate-800 pt-2">Your calculator inputs</h2>
      <p>
        Every calculation runs in your browser. The amounts, rates and other values you enter are not sent to
        or stored on our servers.
      </p>

      <h2 class="text-base font-bold text-slate-800 pt-2">Advertising and cookies</h2>
      <p>
        We use Google AdSense to show ads. Google and its partners use cookies to serve ads based on your
        previous visits to this site and other sites. Google's use of advertising cookies lets it and its partners
        serve ads to you based on those visits.
      </p>
      <p>
        You can opt out of personalised advertising in
        <a href="https://myadcenter.google.com/" target="_blank" rel="noopener" class="text-blue-700 underline">Google My Ad Center</a>,
        or opt out of some third-party vendors' cookies at
        <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener" class="text-blue-700 underline">aboutads.info</a>.
        Learn more in
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener" class="text-blue-700 underline">how Google uses information from sites that use its services</a>.
      </p>
      <p>
        Visitors in the European Economic Area, the UK and Switzerland are asked for consent before personalised
        ads are shown, and can change their choice at any time.
      </p>

      <h2 class="text-base font-bold text-slate-800 pt-2">Visitor statistics</h2>
      <p>
        We use Vercel Web Analytics to count visits. It records the pages you view, the site that referred you,
        and your browser, operating system, device type and country. It uses no cookies and does not identify you
        personally.
      </p>

      <h2 class="text-base font-bold text-slate-800 pt-2">Contact</h2>
      <p>
        Questions about this policy? Email
        <a [href]="'mailto:' + contactEmail" class="text-blue-700 underline">{{ contactEmail }}</a>.
      </p>
    </article>
  `
})
export class PrivacyComponent {
  readonly contactEmail = CONTACT_EMAIL;
  readonly lastUpdated = '22 October 2026';
}
