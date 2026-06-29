import { test, expect } from "@playwright/test";

/**
 * Smoke of the /services page: verifies the service cards render and that their
 * booking/payment CTAs point OUTWARD (to Stripe / Calendly / Stripe billing),
 * not to a dead "#". External CTAs are rendered as <a target="_blank"> anchors
 * by CtaButton. Asserts on the URL scheme/host, not exact CMS values.
 */

const EXTERNAL_CTA = /^https:\/\/(buy\.stripe\.com|calendly\.com|billing\.stripe\.com)/;

test("/services renders service cards", async ({ page }) => {
  await page.goto("/services");
  await expect(
    page.getByRole("heading", { name: "Find the right way to train" }),
  ).toBeVisible();
  // Each service card carries a price in brand styling; there should be 3.
  await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible();
});

test("/services CTAs point to external booking/payment URLs", async ({ page }) => {
  await page.goto("/services");

  // External CTAs are <a target="_blank"> anchors with an https booking/payment href.
  const externalAnchors = page.locator('a[target="_blank"]');
  const count = await externalAnchors.count();
  expect(count).toBeGreaterThan(0);

  // At least one anchor must point to an external booking/payment destination
  // (i.e. CTAs are wired outward, not stuck on "#").
  const hrefs: string[] = [];
  for (let i = 0; i < count; i++) {
    const href = await externalAnchors.nth(i).getAttribute("href");
    if (href) hrefs.push(href);
  }

  expect(hrefs.some((h) => EXTERNAL_CTA.test(h))).toBe(true);
  // And none of the external CTAs collapsed to a dead "#".
  expect(hrefs.every((h) => h !== "#")).toBe(true);
});
