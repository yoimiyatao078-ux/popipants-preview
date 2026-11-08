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
  // Public Buttondown embed form. No API key: the browser posts the form and follows Buttondown's page.
  // Docs: https://docs.buttondown.com/building-your-subscriber-base
  newsletter: {
    provider: 'buttondown',
    endpoint: 'https://buttondown.com/api/emails/embed-subscribe/popipants',
    page: 'https://buttondown.com/popipants',
    field: 'email'
  },
  currency: 'NOK'
};

/* Native form POST, matching Buttondown's embed docs. Do not fetch() this URL:
   their response may be a confirmation or captcha page the visitor has to see.
   Resolves { redirecting: true } after the form is submitted (the page should leave).
   Resolves { unavailable: true } when no endpoint is set. Never writes localStorage.
   This does not mean Buttondown accepted the address. */
window.popiSubscribe = function (email, source) {
  var nl = (window.POPI_CONFIG && window.POPI_CONFIG.newsletter) || {};
  if (!nl.endpoint) return Promise.resolve({ redirecting: false, unavailable: true });
  var form = document.createElement('form');
  form.method = 'post';
  form.action = nl.endpoint;
  form.acceptCharset = 'UTF-8';
  form.hidden = true;
  function field(name, value) {
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  field(nl.field || 'email', email);
  if (source) field('tag', source);
  document.body.appendChild(form);
  try { form.submit(); }
  catch (err) { return Promise.reject(err); }
  return Promise.resolve({ redirecting: true });
};
window.popiSignupNote = function () {
  var nl = (window.POPI_CONFIG && window.POPI_CONFIG.newsletter) || {};
  if (nl.endpoint) return 'This sends your email to Buttondown to finish signup. It is not saved in this browser.';
  return 'Signup isn\'t available yet. Your email is not saved.';
};
window.popiSignupGo = 'Opening Buttondown to finish signup.';
