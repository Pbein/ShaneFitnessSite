import { describe, it, expect } from "vitest";
import { buildInquiryMailto, type InquiryFields } from "@/lib/contact";

/**
 * Regression guard for the contact-form recipient bug (F1).
 *
 * The local `email` in ContactForm's submit handler shadowed the `email` prop
 * holding the business address, so the mailto: target became the *visitor's*
 * address and every inquiry went back to the sender. These tests pin the
 * invariant: the recipient is always the configured business address, whatever
 * the visitor types.
 */

const SHANE = "Shane12.sb@gmail.com";

function fields(overrides: Partial<InquiryFields> = {}): InquiryFields {
  return {
    firstName: "Jamie",
    lastName: "Rivera",
    visitorEmail: "jamie@example.com",
    message: "I'd like to get started.",
    ...overrides,
  };
}

/** The address between "mailto:" and the query string. */
function recipientOf(href: string): string {
  expect(href.startsWith("mailto:")).toBe(true);
  return href.slice("mailto:".length).split("?")[0];
}

describe("buildInquiryMailto — recipient", () => {
  it("targets the configured business address, not the visitor's", () => {
    const href = buildInquiryMailto(SHANE, fields());
    expect(recipientOf(href)).toBe(SHANE);
    expect(recipientOf(href)).not.toBe("jamie@example.com");
  });

  it("keeps the business address for any visitor email", () => {
    for (const visitorEmail of [
      "someone@else.com",
      "UPPER@Example.COM",
      "plus+tag@example.co.uk",
      "",
    ]) {
      const href = buildInquiryMailto(SHANE, fields({ visitorEmail }));
      expect(recipientOf(href)).toBe(SHANE);
    }
  });

  it("cannot be redirected by a visitor email containing mailto separators", () => {
    const href = buildInquiryMailto(
      SHANE,
      fields({ visitorEmail: "attacker@evil.com?subject=hijacked" }),
    );
    expect(recipientOf(href)).toBe(SHANE);
  });

  it("still targets the business address when every field is blank", () => {
    const href = buildInquiryMailto(SHANE, {
      firstName: "",
      lastName: "",
      visitorEmail: "",
      message: "",
    });
    expect(recipientOf(href)).toBe(SHANE);
  });

  it("uses whatever recipient the CMS supplies", () => {
    const href = buildInquiryMailto("hello@trainshane.com", fields());
    expect(recipientOf(href)).toBe("hello@trainshane.com");
  });
});

describe("buildInquiryMailto — payload", () => {
  it("carries the visitor's address in the body, not the target", () => {
    const href = buildInquiryMailto(SHANE, fields());
    const body = decodeURIComponent(new URL(href).searchParams.get("body") ?? "");
    expect(body).toContain("Email: jamie@example.com");
    expect(body).toContain("Name: Jamie Rivera");
    expect(body).toContain("I'd like to get started.");
  });

  it("puts the visitor's name in the subject", () => {
    const href = buildInquiryMailto(SHANE, fields());
    const subject = decodeURIComponent(new URL(href).searchParams.get("subject") ?? "");
    expect(subject).toBe("New inquiry from Jamie Rivera");
  });

  it("percent-encodes subject and body so special characters survive", () => {
    const href = buildInquiryMailto(
      SHANE,
      fields({ firstName: "A&B", message: "goals: 5k & squats?" }),
    );
    expect(href).not.toContain("goals: 5k & squats?");
    const body = decodeURIComponent(new URL(href).searchParams.get("body") ?? "");
    expect(body).toContain("goals: 5k & squats?");
  });
});
