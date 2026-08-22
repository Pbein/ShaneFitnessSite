import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isValidConversionId,
  isValidConversionLabel,
  conversionSendTo,
  reportConversion,
} from "@/lib/analytics";

/**
 * The Conversion ID is interpolated into an inline <script> to initialise gtag.
 * That makes this validation a security boundary, not a convenience: anything
 * that gets past it runs as JavaScript on every page, for every visitor. Sanity
 * validates the field too, but Studio rules can be bypassed by writing to the
 * API directly, so these are the tests that matter.
 */

describe("isValidConversionId", () => {
  it("accepts the real format", () => {
    for (const id of ["AW-123456789", "AW-1234567890", "AW-123456"]) {
      expect(isValidConversionId(id)).toBe(true);
    }
  });

  it("tolerates surrounding whitespace from a sloppy paste", () => {
    expect(isValidConversionId("  AW-123456789  ")).toBe(true);
  });

  it("rejects anything that could break out of the inline script", () => {
    for (const bad of [
      "AW-123'); alert(1); //",
      "AW-123</script><script>alert(1)</script>",
      'AW-123"',
      "AW-123\\",
      "AW-123\n456",
    ]) {
      expect(isValidConversionId(bad)).toBe(false);
    }
  });

  it("rejects near-misses and empties", () => {
    for (const bad of [
      "",
      "   ",
      "AW-",
      "AW-abc",
      "123456789",
      "G-ABC123", // a GA4 measurement ID, easy to paste by mistake
      "GTM-ABC123", // a Tag Manager ID, likewise
      "AW-12345", // too short
      "AW-1234567890123456", // too long
      undefined,
      null,
    ]) {
      expect(isValidConversionId(bad as string)).toBe(false);
    }
  });
});

describe("isValidConversionLabel", () => {
  it("accepts real labels", () => {
    for (const l of ["AbC-D_efGhIjK", "abcdefghij", "A1b2C3d4_e-F"]) {
      expect(isValidConversionLabel(l)).toBe(true);
    }
  });

  it("rejects a label pasted with the ID still attached", () => {
    // The single most likely mistake: copying "AW-123456789/AbC-Def" whole.
    expect(isValidConversionLabel("AW-123456789/AbC-Def")).toBe(false);
  });

  it("rejects injection attempts and junk", () => {
    for (const bad of ["", "abc", "a'); alert(1); //", "<script>", "ab cd", undefined, null]) {
      expect(isValidConversionLabel(bad as string)).toBe(false);
    }
  });
});

describe("conversionSendTo", () => {
  it("joins a valid pair the way Google expects", () => {
    expect(conversionSendTo("AW-123456789", "AbC-D_ef")).toBe("AW-123456789/AbC-D_ef");
  });

  it("trims each half", () => {
    expect(conversionSendTo(" AW-123456789 ", " AbC-D_ef ")).toBe("AW-123456789/AbC-D_ef");
  });

  it("returns null when either half is missing or malformed", () => {
    expect(conversionSendTo(undefined, "AbC-D_ef")).toBeNull();
    expect(conversionSendTo("AW-123456789", undefined)).toBeNull();
    expect(conversionSendTo("G-ABC123", "AbC-D_ef")).toBeNull();
    expect(conversionSendTo("AW-123456789", "AW-123/AbC")).toBeNull();
  });

  it("is null when nothing is configured at all — the default state", () => {
    expect(conversionSendTo(undefined, undefined)).toBeNull();
  });
});

/**
 * The suite runs in vitest's `node` environment, where there is no `window`.
 * Rather than switch this file to jsdom — which is only present as a transitive
 * dependency here, so relying on it would be fragile — we install the smallest
 * possible stand-in: the two things reportConversion actually touches.
 */
type FakeWindow = {
  gtag?: unknown;
  sessionStorage: {
    getItem(k: string): string | null;
    setItem(k: string, v: string): void;
  };
};

function installWindow(): { win: FakeWindow; store: Map<string, string> } {
  const store = new Map<string, string>();
  const win: FakeWindow = {
    sessionStorage: {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => void store.set(k, v),
    },
  };
  (globalThis as unknown as { window?: unknown }).window = win;
  return { win, store };
}

describe("reportConversion", () => {
  const gtag = vi.fn();
  let win: FakeWindow;

  beforeEach(() => {
    gtag.mockClear();
    ({ win } = installWindow());
    win.gtag = gtag;
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it("sends the conversion event in Google's expected shape", () => {
    reportConversion("AW-123456789/AbC-D_ef");
    expect(gtag).toHaveBeenCalledWith("event", "conversion", {
      send_to: "AW-123456789/AbC-D_ef",
    });
  });

  it("does nothing when tracking is unconfigured", () => {
    reportConversion(null);
    expect(gtag).not.toHaveBeenCalled();
  });

  it("does not throw when gtag is absent — an ad blocker removed it", () => {
    delete win.gtag;
    expect(() => reportConversion("AW-123456789/AbC-D_ef")).not.toThrow();
  });

  it("does nothing on the server, where there is no window at all", () => {
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(() => reportConversion("AW-123456789/AbC-D_ef")).not.toThrow();
    expect(gtag).not.toHaveBeenCalled();
  });

  it("fires once per dedupe key, so a refresh cannot double-count a payment", () => {
    reportConversion("AW-1/AbCdE", "purchase:premium");
    reportConversion("AW-1/AbCdE", "purchase:premium");
    reportConversion("AW-1/AbCdE", "purchase:premium");
    expect(gtag).toHaveBeenCalledTimes(1);
  });

  it("treats different dedupe keys independently", () => {
    reportConversion("AW-1/AbCdE", "purchase:premium");
    reportConversion("AW-1/AbCdE", "purchase:in-person");
    expect(gtag).toHaveBeenCalledTimes(2);
  });

  it("fires every time when no dedupe key is given", () => {
    reportConversion("AW-1/AbCdE");
    reportConversion("AW-1/AbCdE");
    expect(gtag).toHaveBeenCalledTimes(2);
  });
});

/* ------------------------------------------------------------------ */
/* The tag component                                                   */
/* ------------------------------------------------------------------ */

describe("GoogleAdsTag", () => {
  it("renders nothing when no Conversion ID is set — the default state", async () => {
    const { GoogleAdsTag } = await import("@/components/GoogleAdsTag");
    expect(GoogleAdsTag({ conversionId: undefined })).toBeNull();
    expect(GoogleAdsTag({ conversionId: "" })).toBeNull();
  });

  it("renders nothing for a malformed ID rather than shipping a broken tag", async () => {
    const { GoogleAdsTag } = await import("@/components/GoogleAdsTag");
    expect(GoogleAdsTag({ conversionId: "G-ABC123" })).toBeNull();
    expect(GoogleAdsTag({ conversionId: "AW-1'); alert(1); //" })).toBeNull();
  });

  it("renders the tag for a valid ID", async () => {
    const { GoogleAdsTag } = await import("@/components/GoogleAdsTag");
    const out = GoogleAdsTag({ conversionId: "AW-123456789" });
    expect(out).not.toBeNull();
    // The ID must reach both the script src and the inline config call.
    expect(JSON.stringify(out)).toContain("AW-123456789");
  });
});
