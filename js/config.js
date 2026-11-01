/* popipants site config — the ONLY place to plug in real services later.
   Nothing here talks to any service until you fill in a value. */
window.POPI_CONFIG = {
  // Where contact messages go when no form provider is set (opens the visitor's mail app).
  // TODO(Yoimiya): put the real shop email here.
  contactEmail: 'hello@popipants.com',
  // Form provider for the contact form. Leave endpoint '' to use the mailto fallback.
  // Works with any service that accepts a JSON POST, e.g. Formspree ("https://formspree.io/f/XXXX"),
  // Web3Forms ("https://api.web3forms.com/submit" + accessKey) or Getform.
  contact: { provider: '', endpoint: '', accessKey: '' },
  // Newsletter / drop alerts. Leave endpoint '' and sign-ups are only kept in this browser (demo).
  // e.g. Buttondown: "https://api.buttondown.email/v1/subscribers" (needs a server-side key, so use their
  // embed form URL "https://buttondown.email/api/emails/embed-subscribe/USERNAME"), MailerLite or Brevo form action URL.
  newsletter: { provider: '', endpoint: '', field: 'email' },
  currency: 'NOK'
};
