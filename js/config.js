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
  // Newsletter / drop alerts. Leave endpoint '' until a public form URL is confirmed.
  // An empty endpoint does not save the address anywhere. No API key belongs in this file.
  // The URL must accept a CORS POST of the field named below (optional "tag") and return 2xx.
  newsletter: { provider: '', endpoint: '', field: 'email' },
  currency: 'NOK'
};

/* One signup path for the secret club, drop alerts, and the palette popup.
   Resolves { sent: true } only after the provider accepts the POST.
   Resolves { sent: false, unavailable: true } when no endpoint is set.
   Rejects on a network or HTTP error. Never writes localStorage. */
window.popiSubscribe = function (email, source) {
  var nl = (window.POPI_CONFIG && window.POPI_CONFIG.newsletter) || {};
  if (!nl.endpoint) return Promise.resolve({ sent: false, unavailable: true });
  var fd = new FormData();
  fd.append(nl.field || 'email', email);
  if (source) fd.append('tag', source);
  return fetch(nl.endpoint, { method: 'POST', body: fd, mode: 'cors' }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return { sent: true };
  });
};
window.popiSignupNote = function () {
  var nl = (window.POPI_CONFIG && window.POPI_CONFIG.newsletter) || {};
  if (nl.endpoint) return 'Your email is sent to the shop mailing list and is not kept in this browser.';
  return 'Signup isn\'t available yet. Your email is not saved.';
};
