/* Signup tests. Mocks the browser form submit. Does not POST to Buttondown or send mail.
   Run: node tools/test-signup.js
   Site at POPI_ORIGIN (default http://127.0.0.1:8771). Chrome required. */
const puppeteer = require('/tmp/pp-shot/node_modules/puppeteer-core');
const ORIGIN = process.env.POPI_ORIGIN || 'http://127.0.0.1:8771';
const ENDPOINT = 'https://buttondown.com/api/emails/embed-subscribe/popipants';

async function boot(page, path) {
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.method() === 'POST') req.abort('aborted');
    else req.continue();
  });
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('popipants-welcomed', '1');
    localStorage.removeItem('popipants-newsletter');
    window.__submits = [];
    window.__stored = null;
    window.__submitMode = 'ok';
    const origSet = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      if (key === 'popipants-newsletter') window.__stored = value;
      return origSet(key, value);
    };
    HTMLFormElement.prototype.submit = function () {
      const fields = [].map.call(this.querySelectorAll('input'), i => [i.name, i.value]);
      window.__submits.push({ action: this.action, method: (this.method || '').toLowerCase(), fields: fields });
      if (window.__submitMode === 'throw') throw new Error('submit blocked');
    };
  });
  await page.goto(ORIGIN + path, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 400));
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || '/usr/local/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const checks = [];
  const assert = (name, ok, extra) => {
    checks.push({ name, ok: !!ok });
    if (!ok) console.error('FAIL', name, extra == null ? '' : extra);
  };

  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1100, height: 900 });
    await boot(page, '/collection.html');
    await page.waitForSelector('.sx-alert');
    const note = await page.$eval('.sx-note', el => el.textContent);
    assert('drop alert names Buttondown and says the browser does not keep the email', /Buttondown/i.test(note) && /not saved/i.test(note), note);
    await page.$eval('.sx-alert input', el => { el.value = 'not-an-email'; });
    await page.click('.sx-alert button');
    await new Promise(r => setTimeout(r, 100));
    const bad = await page.evaluate(() => ({
      msg: document.querySelector('.sx-msg').textContent,
      invalid: document.querySelector('.sx-alert input').getAttribute('aria-invalid'),
      submits: window.__submits.length
    }));
    assert('bad email is announced and not submitted', /little off/i.test(bad.msg) && bad.invalid === 'true' && bad.submits === 0, JSON.stringify(bad));

    await page.evaluate(() => { POPI_CONFIG.newsletter.endpoint = ''; });
    await page.$eval('.sx-alert input', el => { el.value = 'reader@example.com'; });
    await page.click('.sx-alert button');
    await new Promise(r => setTimeout(r, 100));
    const off = await page.evaluate(() => ({
      msg: document.querySelector('.sx-msg').textContent,
      value: document.querySelector('.sx-alert input').value,
      disabled: document.querySelector('.sx-alert button').disabled,
      submits: window.__submits.length,
      stored: window.__stored || localStorage.getItem('popipants-newsletter')
    }));
    assert('empty endpoint does not submit or store', /not saved/i.test(off.msg) && !/on the list/i.test(off.msg) && off.value === 'reader@example.com' && off.disabled === false && off.submits === 0 && off.stored == null, JSON.stringify(off));

    await page.evaluate(() => { POPI_CONFIG.newsletter.endpoint = 'https://buttondown.com/api/emails/embed-subscribe/popipants'; });
    await page.click('.sx-alert button');
    await new Promise(r => setTimeout(r, 150));
    const go = await page.evaluate(() => ({
      msg: document.querySelector('.sx-msg').textContent,
      value: document.querySelector('.sx-alert input').value,
      live: document.querySelector('.sx-msg').getAttribute('aria-live'),
      submit: window.__submits[0],
      stored: window.__stored || localStorage.getItem('popipants-newsletter')
    }));
    const fields = go.submit && go.submit.fields || [];
    assert('valid drop alert posts a form to the embed URL', go.submit && go.submit.method === 'post' && go.submit.action === 'https://buttondown.com/api/emails/embed-subscribe/popipants', JSON.stringify(go.submit));
    assert('form fields are email and tag only', fields.length === 2 && fields.some(f => f[0] === 'email' && f[1] === 'reader@example.com') && fields.some(f => f[0] === 'tag' && f[1] === 'drop') && !fields.some(f => /key|token|auth/i.test(f[0])), JSON.stringify(fields));
    assert('page does not claim the person is already on the list', go.live === 'polite' && /Opening Buttondown/i.test(go.msg) && !/on the list/i.test(go.msg), go.msg);
    assert('address stays available and is not stored locally', go.value === 'reader@example.com' && go.stored == null);
    await page.close();
  }

  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1100, height: 900 });
    await boot(page, '/collection.html');
    await page.waitForSelector('.sx-alert');
    await page.evaluate(() => { window.__submitMode = 'throw'; });
    await page.$eval('.sx-alert input', el => { el.value = 'reader@example.com'; });
    await page.click('.sx-alert button');
    await new Promise(r => setTimeout(r, 100));
    const err = await page.evaluate(() => ({
      msg: document.querySelector('.sx-msg').textContent,
      value: document.querySelector('.sx-alert input').value,
      disabled: document.querySelector('.sx-alert button').disabled
    }));
    assert('a blocked submit is announced and can be retried', /nothing was saved/i.test(err.msg) && err.value === 'reader@example.com' && err.disabled === false, JSON.stringify(err));
    await page.evaluate(() => { window.__submitMode = 'ok'; });
    await page.click('.sx-alert button');
    await new Promise(r => setTimeout(r, 100));
    const retried = await page.evaluate(() => window.__submits.length);
    assert('retry submits again', retried === 2, String(retried));
    await page.close();
  }

  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await boot(page, '/index.html');
    await page.click('[data-popup="signup"]');
    await page.waitForSelector('#secret-email');
    const note = await page.$eval('#secret-note', el => el.textContent);
    assert('secret club notice names Buttondown', /Buttondown/i.test(note) && /not saved/i.test(note), note);
    await page.$eval('#secret-email', el => { el.value = 'reader@example.com'; });
    await page.click('.signup-form button');
    await new Promise(r => setTimeout(r, 150));
    const club = await page.evaluate(() => ({
      msg: document.querySelector('#secret-msg').textContent,
      form: !!document.querySelector('#secret-email'),
      value: document.querySelector('#secret-email').value,
      submit: window.__submits[0],
      stored: localStorage.getItem('popipants-newsletter')
    }));
    const fields = club.submit && club.submit.fields || [];
    assert('secret club keeps the form and does not claim success', club.form && /Opening Buttondown/i.test(club.msg) && !/on the list/i.test(club.msg) && club.value === 'reader@example.com' && club.stored == null, JSON.stringify(club));
    assert('secret club posts email plus the secret-club tag', club.submit && club.submit.action === 'https://buttondown.com/api/emails/embed-subscribe/popipants' && club.submit.method === 'post' && fields.some(f => f[0] === 'email' && f[1] === 'reader@example.com') && fields.some(f => f[0] === 'tag' && f[1] === 'secret-club'), JSON.stringify(club.submit));
    await page.close();
  }

  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await boot(page, '/palette-a.html');
    await page.evaluate(() => { if (window.popipantsNewsletter) popipantsNewsletter.open(); });
    await page.waitForSelector('#nl-email');
    const copy = await page.$eval('.pc-popup', el => el.textContent);
    assert('palette popup does not offer a discount', !/10%|discount code/i.test(copy), copy.slice(0, 200));
    await page.$eval('#nl-email', el => { el.value = 'reader@example.com'; });
    await page.click('.nl-overlay .signup-form button');
    await new Promise(r => setTimeout(r, 150));
    const pal = await page.evaluate(() => ({
      msg: document.querySelector('#nl-msg').textContent,
      value: document.querySelector('#nl-email').value,
      tag: (window.__submits[0] && window.__submits[0].fields || []).filter(f => f[0] === 'tag').map(f => f[1]),
      stored: localStorage.getItem('popipants-newsletter')
    }));
    assert('palette popup hands off to Buttondown without storing the address', /Opening Buttondown/i.test(pal.msg) && pal.value === 'reader@example.com' && pal.tag[0] === 'palette' && pal.stored == null, JSON.stringify(pal));
    await page.close();
  }

  await browser.close();
  const failed = checks.filter(c => !c.ok);
  console.log(JSON.stringify({ passed: checks.length - failed.length, endpoint: ENDPOINT, failed: failed.map(c => c.name) }, null, 2));
  process.exit(failed.length ? 1 : 0);
})().catch(err => { console.error(err); process.exit(1); });
