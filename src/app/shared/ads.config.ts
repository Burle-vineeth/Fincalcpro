// Google AdSense settings. Replace the placeholders with the values from your
// AdSense account (Ads > By ad unit), and update public/ads.txt to match.
// While the publisher ID is still a placeholder, no ad code is loaded: dev builds
// show grey boxes where ads will go, production builds show nothing.
export const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX';

export type AdPlacement = 'top' | 'sidebar' | 'inContent';

export const AD_SLOTS: Record<AdPlacement, string> = {
  top: '0000000000',       // Display ad, horizontal (728x90 desktop, 320x50 mobile)
  sidebar: '0000000000',   // Display ad, vertical (300x600), wide screens only
  inContent: '0000000000'  // Display ad, responsive, after each calculator's results
};

export const ADS_ENABLED = /^ca-pub-\d{16}$/.test(ADSENSE_CLIENT);

// Shown on the Privacy Policy page, which AdSense requires
export const CONTACT_EMAIL = 'contact@example.com';
