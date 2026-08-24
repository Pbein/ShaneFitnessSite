import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * Hero regression guard.
 *
 * docs/HERO-BRIEF.md §11 defines how to know the hero works, but the method was
 * only ever run by hand: screenshot the page twice, once with the text visible
 * and once with it hidden, diff the two to find the exact pixels the glyphs
 * occupy, then measure WCAG contrast between the text colour and the backdrop
 * beneath those pixels. This automates it so a future image swap, scrim tweak,
 * or copy change cannot quietly push the hero back under the line.
 *
 * Why the diff rather than something simpler: the brief is explicit that
 * averages and bounding-box sampling both lie. An average hides a local bright
 * patch — a ceiling spot behind three words passes on the mean and is unreadable
 * in practice. A bounding box penalises text that does not fill it, measuring
 * mostly gaps between glyphs. Only the glyph pixels themselves are the truth.
 *
 * The threshold here is 4.5:1 for BOTH lines. WCAG only asks 3:1 of the
 * headline at its size; the brief deliberately holds it to 4.5:1 anyway so the
 * margin absorbs a future copy edit, and this encodes that choice.
 *
 * SCOPE — read before trusting a green run. Contrast measures luminance, and
 * that is all it measures. The defect that prompted the art-direction split
 * below (a phone headline landing on the painted TRAIN SHANE sign) passes every
 * width in this file: the sign is dark-on-dark, so the white headline over it
 * measures ~12:1 while being genuinely hard to read. That was confirmed by
 * wiring the broken plate back in and watching all nine widths pass. Green here
 * means the hero is not too BRIGHT behind the words. It does not mean the hero
 * READS well. See docs/HERO-BRIEF.md §11 for the busyness metric that was tried
 * as a fix for this and rejected on the numbers.
 */

/** Site tokens, from tailwind.config.ts — the colours the hero text is painted in. */
const CREAM_100 = { r: 0xf5, g: 0xf5, b: 0xf5 }; // headline
const CREAM_300 = { r: 0xb0, g: 0xb0, b: 0xb0 }; // subheadline

const MIN_CONTRAST = 4.5;

/**
 * The widths from the brief's acceptance table, plus 440 — an iPhone 17 Pro Max,
 * which is where the overlap that prompted the art-direction split was spotted.
 * Heights are the real device heights; the hero is `min-h-[88vh]`, so height
 * changes its shape and therefore its crop.
 */
const VIEWPORTS = [
  { w: 375, h: 667, label: "iPhone SE" },
  { w: 390, h: 844, label: "iPhone 14" },
  { w: 412, h: 915, label: "Pixel" },
  { w: 440, h: 956, label: "iPhone 17 Pro Max" },
  { w: 768, h: 1024, label: "iPad" },
  { w: 1024, h: 1366, label: "iPad Pro" },
  { w: 1366, h: 768, label: "Laptop" },
  { w: 1440, h: 900, label: "Desktop" },
  { w: 1920, h: 1080, label: "Wide" },
];

type Contrast = { p5: number; min: number; median: number; samples: number };

/**
 * Measure WCAG contrast for one text element against whatever is behind it.
 *
 * Both screenshots use the same clip, and the element is hidden with
 * `visibility` rather than `display`, so layout — and therefore the backdrop —
 * is byte-identical between the two frames. Any pixel that changed is a glyph.
 */
async function measureContrast(
  page: Page,
  target: Locator,
  colour: { r: number; g: number; b: number },
): Promise<Contrast> {
  const box = await target.boundingBox();
  if (!box) throw new Error("hero text element has no box — did the selector change?");
  const clip = {
    x: Math.floor(box.x),
    y: Math.floor(box.y),
    width: Math.ceil(box.width),
    height: Math.ceil(box.height),
  };

  const shot = () => page.screenshot({ clip, animations: "disabled" });

  const withText = (await shot()).toString("base64");
  await target.evaluate((el) => ((el as HTMLElement).style.visibility = "hidden"));
  const withoutText = (await shot()).toString("base64");
  await target.evaluate((el) => ((el as HTMLElement).style.visibility = ""));

  // Decoding happens in the browser: canvas is already there, so the test needs
  // no image library of its own and cannot drift from what Chromium rendered.
  return page.evaluate(
    async ([a, b, c]) => {
      const decode = async (base64: string) => {
        const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
        const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(bitmap, 0, 0);
        return ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
      };

      const text = c as { r: number; g: number; b: number };
      const front = await decode(a as string);
      const back = await decode(b as string);

      const lin = (v: number) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      const lum = (r: number, g: number, bl: number) =>
        0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bl);
      const contrast = (l1: number, l2: number) =>
        (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

      const textLum = lum(text.r, text.g, text.b);
      const ratios: number[] = [];

      for (let i = 0; i < front.length; i += 4) {
        const changed = Math.max(
          Math.abs(front[i] - back[i]),
          Math.abs(front[i + 1] - back[i + 1]),
          Math.abs(front[i + 2] - back[i + 2]),
        );
        // A changed pixel is only a glyph pixel if it actually became the text
        // colour. Anti-aliased edges are a blend of text and backdrop; counting
        // them would report a contrast neither colour actually has, and there
        // are enough of them on 72px display type to drag the percentile down.
        const isGlyph =
          changed > 40 &&
          Math.max(
            Math.abs(front[i] - text.r),
            Math.abs(front[i + 1] - text.g),
            Math.abs(front[i + 2] - text.b),
          ) < 24;
        if (isGlyph) ratios.push(contrast(textLum, lum(back[i], back[i + 1], back[i + 2])));
      }

      ratios.sort((x, y) => x - y);
      return {
        p5: ratios[Math.floor(ratios.length * 0.05)] ?? 0,
        min: ratios[0] ?? 0,
        median: ratios[Math.floor(ratios.length * 0.5)] ?? 0,
        samples: ratios.length,
      };
    },
    [withText, withoutText, colour] as const,
  );
}

for (const vp of VIEWPORTS) {
  test.describe(`hero at ${vp.w}px (${vp.label})`, () => {
    test.use({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });

    test("headline and subheadline stay readable over the photo", async ({ page }) => {
      await page.goto("/");
      const hero = page.locator("section").first();
      const headline = hero.locator("h1");
      const subheadline = hero.locator("h1 + p");

      // The hero photo is the LCP element and the copy fades in; measuring before
      // either settles would compare a frame the visitor never sees.
      await expect(headline).toBeVisible();
      await page.waitForLoadState("networkidle");

      const h = await measureContrast(page, headline, CREAM_100);
      const s = await measureContrast(page, subheadline, CREAM_300);

      // A near-empty sample means the diff found no glyphs — the selector broke,
      // or the text stopped rendering. Passing on zero samples would be worse
      // than failing, so assert we actually measured something.
      expect(h.samples, "headline glyph pixels sampled").toBeGreaterThan(500);
      expect(s.samples, "subheadline glyph pixels sampled").toBeGreaterThan(500);

      expect(
        h.p5,
        `headline 5th-percentile contrast (min ${h.min.toFixed(1)}, median ${h.median.toFixed(1)})`,
      ).toBeGreaterThanOrEqual(MIN_CONTRAST);
      expect(
        s.p5,
        `subheadline 5th-percentile contrast (min ${s.min.toFixed(1)}, median ${s.median.toFixed(1)})`,
      ).toBeGreaterThanOrEqual(MIN_CONTRAST);
    });
  });
}

test.describe("hero art direction", () => {
  /**
   * The whole point of the <picture> split is that a phone gets the sign-free
   * plate and a desktop gets the branded one — and that neither downloads both.
   * A well-meaning refactor back to two <Image> elements with `hidden md:block`
   * would still look right in a screenshot while silently doubling the LCP
   * payload on the device that can least afford it, so the request count is
   * asserted, not just the rendered source.
   */
  const heroRequests = (page: Page) => {
    const urls: string[] = [];
    page.on("request", (r) => {
      const u = r.url();
      if (r.resourceType() === "image" && /hero-gym-room/.test(decodeURIComponent(u))) {
        urls.push(decodeURIComponent(u));
      }
    });
    return urls;
  };

  test("a phone gets the sign-free plate, and only that one", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const urls = heroRequests(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(urls.length, `hero images fetched: ${urls.join(", ")}`).toBe(1);
    expect(urls[0]).toContain("hero-gym-room-mobile");
  });

  test("a desktop gets the branded plate, and only that one", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const urls = heroRequests(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(urls.length, `hero images fetched: ${urls.join(", ")}`).toBe(1);
    expect(urls[0]).toMatch(/hero-gym-room\.jpg/);
    expect(urls[0]).not.toContain("mobile");
  });
});
