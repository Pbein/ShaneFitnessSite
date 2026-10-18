import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isValidRedditPixelId, reportRedditEvent, redditPixelInitScript } from "@/lib/reddit";

/**
 * The Pixel ID is interpolated into an inline <script>, so — as with the Google
 * Conversion ID in analytics.test.ts — the validation is the security boundary.
 */

describe("isValidRedditPixelId", () => {
  it("accepts the real formats", () => {
    for (const id of ["a2_juobbt1jcd11", "a2_abc123def45", "t2_abcde12"]) {
      expect(isValidRedditPixelId(id)).toBe(true);
    }
  });

  it("tolerates surrounding whitespace from a sloppy paste", () => {
    expect(isValidRedditPixelId("  a2_juobbt1jcd11 ")).toBe(true);
  });

  it("rejects anything that could break out of the inline script", () => {
    for (const bad of [
      "a2_abc'); alert(1); //",
      "a2_abc</script><script>alert(1)</script>",
      "a2_abc'",
      "a2_abc\n123",
    ]) {
      expect(isValidRedditPixelId(bad)).toBe(false);
    }
  });

  it("rejects near-misses and empties", () => {
    for (const bad of ["", "a2_", "juobbt1jcd11", "AW-123456789", "a2_abc", undefined, null]) {
      expect(isValidRedditPixelId(bad as string)).toBe(false);
    }
  });
});

describe("redditPixelInitScript", () => {
  it("inits with the ID, counts the first page visit, then drains the queue", () => {
    const s = redditPixelInitScript("a2_juobbt1jcd11");
    const init = s.indexOf("rdt('init','a2_juobbt1jcd11',");
    const visit = s.indexOf("rdt('track','PageVisit')");
    const drain = s.indexOf("__rdtPending||[]");
    expect(init).toBeGreaterThan(-1);
    expect(visit).toBeGreaterThan(init);
    expect(drain).toBeGreaterThan(visit);
  });
});

type FakeWindow = {
  rdt?: unknown;
  __rdtPending?: unknown[][];
  sessionStorage: { getItem(k: string): string | null; setItem(k: string, v: string): void };
};

function installWindow(): FakeWindow {
  const store = new Map<string, string>();
  const win: FakeWindow = {
    sessionStorage: {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => void store.set(k, v),
    },
  };
  (globalThis as unknown as { window?: unknown }).window = win;
  return win;
}

describe("reportRedditEvent", () => {
  const rdt = vi.fn();
  let win: FakeWindow;

  beforeEach(() => {
    rdt.mockClear();
    win = installWindow();
    win.rdt = rdt;
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it("tracks the event in Reddit's expected shape", () => {
    reportRedditEvent("Lead");
    expect(rdt).toHaveBeenCalledWith("track", "Lead");
  });

  it("sends value in dollars, currency and conversionId when given", () => {
    reportRedditEvent("Purchase", { value: 199, conversionId: "cs_test_abc" });
    expect(rdt).toHaveBeenCalledWith("track", "Purchase", {
      value: 199,
      currency: "USD",
      conversionId: "cs_test_abc",
    });
  });

  it("queues the event when the pixel has not initialised yet", () => {
    // /welcome fires Purchase from an effect that can beat the init script.
    delete win.rdt;
    reportRedditEvent("Purchase");
    expect(win.__rdtPending).toEqual([["track", "Purchase"]]);
  });

  it("does nothing on the server", () => {
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(() => reportRedditEvent("Lead")).not.toThrow();
    expect(rdt).not.toHaveBeenCalled();
  });

  it("fires once per dedupe key, so a refresh cannot double-count a payment", () => {
    reportRedditEvent("Purchase", { dedupeKey: "purchase:premium" });
    reportRedditEvent("Purchase", { dedupeKey: "purchase:premium" });
    expect(rdt).toHaveBeenCalledTimes(1);
  });

  it("does not share a dedupe guard with Google", async () => {
    // Both platforms get /welcome's Purchase with the same dedupeKey. If they
    // shared a storage key, whichever ran first would silence the other.
    const { reportConversion } = await import("@/lib/analytics");
    reportConversion("AW-1/AbCdE", "purchase:premium");
    reportRedditEvent("Purchase", { dedupeKey: "purchase:premium" });
    expect(rdt).toHaveBeenCalledTimes(1);
  });
});

describe("RedditPixelTag", () => {
  it("renders nothing when no Pixel ID is set — the default state", async () => {
    const { RedditPixelTag } = await import("@/components/RedditPixelTag");
    expect(RedditPixelTag({ pixelId: undefined })).toBeNull();
    expect(RedditPixelTag({ pixelId: "" })).toBeNull();
  });

  it("renders nothing for a malformed ID", async () => {
    const { RedditPixelTag } = await import("@/components/RedditPixelTag");
    expect(RedditPixelTag({ pixelId: "a2_x'); alert(1); //" })).toBeNull();
  });

  it("renders the pixel for a valid ID", async () => {
    const { RedditPixelTag } = await import("@/components/RedditPixelTag");
    const out = RedditPixelTag({ pixelId: "a2_juobbt1jcd11" });
    expect(JSON.stringify(out)).toContain("a2_juobbt1jcd11");
  });
});
