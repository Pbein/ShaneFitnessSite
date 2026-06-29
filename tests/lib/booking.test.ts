import { describe, it, expect } from "vitest";
import { isEmbeddableCalendly } from "@/lib/booking";

describe("isEmbeddableCalendly", () => {
  it("is true for a real calendly.com scheduling link", () => {
    expect(
      isEmbeddableCalendly("https://calendly.com/shane12-sb/free-consultation"),
    ).toBe(true);
  });

  it("is true for a *.calendly.com subdomain path", () => {
    expect(isEmbeddableCalendly("https://shane.calendly.com/intro")).toBe(true);
  });

  it("is false for the bare https://calendly.com/ placeholder", () => {
    expect(isEmbeddableCalendly("https://calendly.com/")).toBe(false);
  });

  it("is false for https://calendly.com with no trailing slash (empty path)", () => {
    expect(isEmbeddableCalendly("https://calendly.com")).toBe(false);
  });

  it("is false for a path that is only slashes", () => {
    expect(isEmbeddableCalendly("https://calendly.com///")).toBe(false);
  });

  it("is false for a non-calendly URL", () => {
    expect(isEmbeddableCalendly("https://example.com/shane/intro")).toBe(false);
  });

  it("is false for a host that merely contains 'calendly.com' but isn't the domain", () => {
    expect(isEmbeddableCalendly("https://calendly.com.evil.com/x")).toBe(false);
  });

  it("is false for an empty string", () => {
    expect(isEmbeddableCalendly("")).toBe(false);
  });

  it("is false for undefined", () => {
    expect(isEmbeddableCalendly(undefined)).toBe(false);
  });

  it("is false for a malformed / non-URL string", () => {
    expect(isEmbeddableCalendly("not a url")).toBe(false);
    expect(isEmbeddableCalendly("calendly.com/shane")).toBe(false);
  });
});
