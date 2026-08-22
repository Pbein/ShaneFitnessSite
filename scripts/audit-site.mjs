/**
 * Pre-launch browser audit. Boots nothing — point it at a running server.
 *   node scripts/audit-site.mjs            (defaults to http://localhost:3000)
 *   BASE=https://… OUT=./tmp node scripts/audit-site.mjs
 *
 * Walks every public route at phone and desktop widths, scrolls the page so the
 * Reveal-on-scroll sections actually render before the screenshot, and records
 * console errors, failed requests, layout overflow, tap-target sizes, heading
 * structure, and per-page image/JS weight.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:3000';
const OUT = process.env.OUT || '.';
const ROUTES = ['/', '/about', '/services', '/success-stories', '/resources', '/contact', '/welcome?plan=essential', '/this-page-does-not-exist'];
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, isMobile: true },
  { name: 'desktop', width: 1440, height: 900, isMobile: false },
];

fs.mkdirSync(`${OUT}/shots`, { recursive: true });
const report = [];
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    hasTouch: vp.isMobile,
    userAgent: vp.isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });
  for (const route of ROUTES) {
    const slug = route.replace(/[\/?=]/g, '_') || '_home';
    const page = await ctx.newPage();
    const consoleErrors = [], failedReqs = [], weights = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
    page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + String(e).slice(0, 300)));
    page.on('requestfailed', (r) => failedReqs.push(r.url().slice(0, 160) + ' :: ' + (r.failure()?.errorText || '')));
    page.on('response', async (r) => {
      const t = r.request().resourceType();
      if (t === 'image' || t === 'script' || t === 'font' || t === 'stylesheet') {
        const len = Number(r.headers()['content-length'] || 0);
        if (len) weights.push({ t, len, url: r.url().slice(-70) });
      }
    });

    let status = null;
    try {
      status = (await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 }))?.status();
    } catch (e) {
      report.push({ vp: vp.name, route, error: String(e).slice(0, 200) });
      await page.close();
      continue;
    }

    // Scroll the whole page so IntersectionObserver reveals fire, then return to top.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.7;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 400));
    });

    const info = await page.evaluate(() => {
      const de = document.documentElement;
      const vw = de.clientWidth;
      const offenders = [];
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > vw + 1.5 || r.left < -1.5)) {
          const pr = el.parentElement?.getBoundingClientRect();
          if (!pr || pr.right <= vw + 1.5) {
            offenders.push({ tag: el.tagName.toLowerCase(), cls: String(el.className || '').slice(0, 80), right: Math.round(r.right) });
          }
        }
      });
      const small = [];
      document.querySelectorAll('a, button, input, textarea, select').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        if (r.height < 40) small.push({ tag: el.tagName.toLowerCase(), text: (el.textContent || '').trim().slice(0, 34), w: Math.round(r.width), h: Math.round(r.height) });
      });
      // A section that renders but shows no text = an empty band on a live page.
      const emptySections = [...document.querySelectorAll('section')]
        .map((s, i) => ({ i, text: s.innerText.trim().length, h: Math.round(s.getBoundingClientRect().height) }))
        .filter((s) => s.text === 0 && s.h > 40);
      return {
        title: document.title,
        canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href') || null,
        h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().slice(0, 70)),
        headingOrder: [...document.querySelectorAll('h1,h2,h3')].map((h) => h.tagName).join(','),
        scrollW: de.scrollWidth, clientW: de.clientWidth,
        offenders: offenders.slice(0, 10),
        smallTargets: small.slice(0, 10),
        imgs: [...document.images].map((i) => ({ src: i.currentSrc.slice(-60), alt: i.alt, natural: i.naturalWidth, rendered: Math.round(i.width) })),
        emptySections,
        outboundLinks: [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => h && /^(https?:|mailto:|tel:)/.test(h)))],
      };
    });

    await page.screenshot({ path: `${OUT}/shots/${vp.name}${slug}.png`, fullPage: true });

    let menu = null;
    if (vp.isMobile) {
      const btn = page.locator('button[aria-label="Toggle menu"]');
      if (await btn.count()) {
        await btn.click();
        await page.waitForTimeout(450);
        menu = await page.evaluate(() => {
          // By id, not by position: the panel used to be the header's last child
          // and is now its first, which silently turned this check into a
          // measurement of the bar instead.
          const panel = document.getElementById('mobile-menu');
          const r = panel?.getBoundingClientRect();
          return {
            bodyOverflow: getComputedStyle(document.body).overflow,
            panelTop: r ? Math.round(r.top) : null,
            panelBottom: r ? Math.round(r.bottom) : null,
            panelHeight: r ? Math.round(r.height) : null,
            viewportH: window.innerHeight,
            closeButton: !!document.querySelector('button[aria-label="Close menu"]'),
          };
        });
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(350);
        menu.scrollLeakedPx = await page.evaluate(() => window.scrollY);
        await page.screenshot({ path: `${OUT}/shots/${vp.name}${slug}__menu.png` });
      }
    }

    const totals = weights.reduce((a, w) => ({ ...a, [w.t]: (a[w.t] || 0) + w.len }), {});
    report.push({ vp: vp.name, route, status, ...info, consoleErrors, failedReqs, menu, totals, heaviest: weights.sort((a, b) => b.len - a.len).slice(0, 5) });
    await page.close();
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${OUT}/audit-report.json`, JSON.stringify(report, null, 2));
console.log('routes scanned:', report.length);
