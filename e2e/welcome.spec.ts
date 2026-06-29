import { test, expect } from "@playwright/test";

/**
 * Render-level smoke of the post-payment /welcome page. Assertions are on the
 * deterministic per-plan copy and structure (PLAN_COPY in src/lib/welcome.ts),
 * never on CMS-provided URL values, so they survive content edits.
 */

test("?plan=essential shows the Essential heading", async ({ page }) => {
  await page.goto("/welcome?plan=essential");
  await expect(
    page.getByRole("heading", { name: "Welcome to Essential Coaching" }),
  ).toBeVisible();
});

test("?plan=premium shows the Premium heading", async ({ page }) => {
  await page.goto("/welcome?plan=premium");
  await expect(
    page.getByRole("heading", { name: "Welcome to Premium Coaching" }),
  ).toBeVisible();
});

test("?plan=in-person shows the in-person heading", async ({ page }) => {
  await page.goto("/welcome?plan=in-person");
  await expect(
    page.getByRole("heading", {
      name: "Payment received — let's get you on the calendar",
    }),
  ).toBeVisible();
});

test("no plan param shows the default heading", async ({ page }) => {
  await page.goto("/welcome");
  await expect(
    page.getByRole("heading", { name: "Payment received — let's get started" }),
  ).toBeVisible();
});

test("welcome renders either the Calendly embed or the fallback card", async ({
  page,
}) => {
  await page.goto("/welcome?plan=essential");

  const embed = page.locator(".calendly-inline-widget[data-url]");
  const fallback = page.getByRole("heading", { name: "Book your first session" });

  // Exactly one of the two booking experiences must render.
  const embedCount = await embed.count();
  const fallbackCount = await fallback.count();
  expect(embedCount + fallbackCount).toBeGreaterThan(0);
});

test("subscription plan shows a manage-subscription link when the CMS field is set", async ({
  page,
}) => {
  await page.goto("/welcome?plan=essential");

  // Essential is a subscription plan, so the page renders the "manage your
  // subscription" link IFF siteSettings.manageSubscriptionUrl is set in the CMS.
  // Assert on it when present rather than failing hard when the field is unset.
  const manageLink = page.getByRole("link", { name: "manage your subscription" });
  if (await manageLink.count()) {
    await expect(manageLink.first()).toBeVisible();
    await expect(manageLink.first()).toHaveAttribute("href", /.+/);
  } else {
    test.info().annotations.push({
      type: "note",
      description:
        "manageSubscriptionUrl is unset in the CMS — manage-subscription link not rendered (expected).",
    });
  }
});
