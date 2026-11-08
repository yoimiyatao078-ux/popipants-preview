/* Signup behavior tests. Mocks fetch. Does not contact a provider or send mail.
   Run: node tools/test-signup.js
   Needs the site served at POPI_ORIGIN (default http://127.0.0.1:8771) and Chrome. */
const puppeteer = require('/tmp/pp-shot/node_modules/puppeteer-core');
const ORIGIN = process.env.POPI_ORIGIN || 'http://127.0.0.1:8771';

async function boot(page, path) {
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('popipants-welcomed', '1');
    localStorage.removeItem('popipants-newsletter');
    window.__calls = [];
    window.__stored = null;
    window.__fetchMode = 'ok';
    const origSet = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      if (key === 'popipants-newsletter') window.__stored = value;
      return origSet(key, value);
    };
    window.fetch = function (url, opts) {
      const fields = [];
      if (opts && opts.body && typeof opts.body.forEach === 'function') {
        opts.body.forEach(function (val, key) { fields.push([key, String(val)]); });
      }
      window.__calls.push({ url: String(url), method: opts && opts.method, fields: fields });
      if (window.__fetchMode === 'network') return Promise.reject(new TypeError('network'));
      if (window.__fetchMode === 'http') return Promise.resolve({ ok: false, status: 502 });
      return Promise.resolve({ ok: true, status: 200 });
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

  // Drop alert, no endpoint: honest unavailable, email stays, nothing stored, no request.
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1100, height: 900 });
    await boot(page, '/collection.html');
    await page.waitForSelector('.sx-alert');
    const note = await page.$eval('.sx-note', el => el.textContent);
    assert('drop alert explains that signup is unavailable', /not saved/i.test(note), note);
    await page.$eval('.sx-alert input', el => { el.value = 'reader@example.com'; });
    await page.click('.sx-alert button');
    await new Promise(r => setTimeout(r, 150));
    const after = await page.evaluate(() => ({
      msg: document.querySelector('.sx-msg').textContent,
      live: document.querySelector('.sx-msg').getAttribute('aria-live'),
      value: document.querySelector('.sx-alert input').value,
      disabled: document.querySelector('.sx-alert button').disabled,
      calls: window.__calls.length,
      stored: window.__stored,
      key: localStorage.getItem('popipants-newsletter')
    }));
    assert('unavailable message is announced', after.live === 'polite' && /not saved/i.test(after.msg), after.msg);
    assert('email stays in the field for a later try', after.value === 'reader@example.com');
    assert('button can be used again', after.disabled === false);
    assert('no request and no localStorage list', after.calls === 0 && after.stored == null && after.key == null, JSON.stringify(after));
    await page.close();
  }

  // Drop alert with a mocked provider: success, then HTTP error, then retry.
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1100, height: 900 });
    await boot(page, '/collection.html');
    await page.waitForSelector('.sx-alert');
    await page.evaluate(() => { POPI_CONFIG.newsletter.endpoint = 'https://example.test/list'; });
    await page.$eval('.sx-alert input', el => { el.value = 'reader@example.com'; });
    await page.click('.sx-alert button');
    await new Promise(r => setTimeout(r, 150));
    const ok = await page.evaluate(() => ({
      msg: document.querySelector('.sx-msg').textContent,
      value: document.querySelector('.sx-alert input').value,
      call: window.__calls[0]
    }));
    assert('success only after a 2xx response', /on the list/i.test(ok.msg), ok.msg);
    assert('successful submit clears the field', ok.value === '');
    assert('post goes to the configured endpoint with email and tag only',
      ok.call && ok.call.method === 'POST' && ok.call.url === 'https://example.test/list' &&
      ok.call.fields.some(f => f[0] === 'email' && f[1] === 'reader@example.com') &&
      ok.call.fields.some(f => f[0] === 'tag' && f[1] === 'drop') &&
      !ok.call.fields.some(f => /key|token|auth/i.test(f[0])),
      JSON.stringify(ok.call));

    await page.evaluate(() => { window.__fetchMode = 'http'; });
    await page.$eval('.sx-alert input', el => { el.value = 'reader@example.com'; });
    await page.click('.sx-alert button');
    await new Promise(r => setTimeout(r, 150));
    const bad = await page.evaluate(() => ({
      msg: document.querySelector('.sx-msg').textContent,
      value: document.querySelector('.sx-alert input').value,
      disabled: document.querySelector('.sx-alert button').disabled,
      calls: window.__calls.length
    }));
    assert('provider error stays in the form', /nothing was saved/i.test(bad.msg) && bad.value === 'reader@example.com' && bad.disabled === false, JSON.stringify(bad));

    await page.evaluate(() => { window.__fetchMode = 'network'; });
    await page.click('.sx-alert button');
    await new Promise(r => setTimeout(r, 150));
    const again = await page.evaluate(() => ({
      msg: document.querySelector('.sx-msg').textContent,
      calls: window.__calls.length,
      value: document.querySelector('.sx-alert input').value
    }));
    assert('network error can be retried', again.calls === 3 && /nothing was saved/i.test(again.msg) && again.value === 'reader@example.com', JSON.stringify(again));
    const stored = await page.evaluate(() => localStorage.getItem('popipants-newsletter') || window.__stored);
    assert('provider attempts still do not use localStorage', stored == null, stored);
    await page.close();
  }

  // Secret club: unavailable, then mocked success. No false "on the list".
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await boot(page, '/index.html');
    await page.click('[data-popup="signup"]');
    await page.waitForSelector('#secret-email');
    const note = await page.$eval('#secret-note', el => el.textContent);
    assert('secret club shows the unavailable notice', /not saved/i.test(note), note);
    await page.$eval('#secret-email', el => { el.value = 'reader@example.com'; });
    await page.click('.signup-form button');
    await new Promise(r => setTimeout(r, 150));
    const held = await page.evaluate(() => ({
      msg: document.querySelector('#secret-msg').textContent,
      form: !!document.querySelector('#secret-email'),
      value: document.querySelector('#secret-email').value,
      calls: window.__calls.length,
      stored: localStorage.getItem('popipants-newsletter')
    }));
    assert('secret club does not claim a list without a provider', /not saved/i.test(held.msg) && held.form && held.value === 'reader@example.com' && held.calls === 0 && held.stored == null, JSON.stringify(held));

    await page.evaluate(() => { POPI_CONFIG.newsletter.endpoint = 'https://example.test/list'; window.__fetchMode = 'ok'; });
    await page.click('.signup-form button');
    await new Promise(r => setTimeout(r, 200));
    const joined = await page.evaluate(() => ({
      body: document.querySelector('.pc-popup-body').textContent,
      calls: window.__calls.length,
      tag: window.__calls[0] && window.__calls[0].fields
    }));
    assert('secret club confirms only after the provider accepts', /on the list/i.test(joined.body) && joined.calls === 1, joined.body);
    assert('secret club tags the source and sends no key', JSON.stringify(joined.tag).indexOf('secret-club') >= 0 && !/access_key|api_key/i.test(JSON.stringify(joined.tag)), JSON.stringify(joined.tag));
    await page.close();
  }

  // Palette popup must not store an address or promise a discount.
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await boot(page, '/palette-a.html');
    await page.evaluate(() => { if (window.popipantsNewsletter) popipantsNewsletter.open(); });
    await page.waitForSelector('#nl-email');
    const copy = await page.$eval('.pc-popup', el => el.textContent);
    assert('palette popup does not offer a discount', !/10%|code/i.test(copy), copy.slice(0, 180));
    await page.$eval('#nl-email', el => { el.value = 'reader@example.com'; });
    await page.click('#nl-msg').catch(() => {});
    await page.click('.signup-form button');
    await new Promise(r => setTimeout(r, 150));
    const pal = await page.evaluate(() => ({
      msg: document.querySelector('#nl-msg').textContent,
      value: document.querySelector('#nl-email') && document.querySelector('#nl-email').value,
      stored: localStorage.getItem('popipants-newsletter'),
      calls: window.__calls.length
    }));
    assert('palette signup stays unavailable without an endpoint', /not saved/i.test(pal.msg) && pal.value === 'reader@example.com' && pal.stored == null && pal.calls === 0, JSON.stringify(pal));
    await page.close();
  }

  await browser.close();
  const failed = checks.filter(c => !c.ok);
  console.log(JSON.stringify({ passed: checks.length - failed.length, failed: failed.map(c => c.name) }, null, 2));
  process.exit(failed.length ? 1 : 0);
})().catch(err => { console.error(err); process.exit(1); });
