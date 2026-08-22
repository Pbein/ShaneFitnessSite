import { describe, it, expect } from "vitest";
import {
  buildInquiryMailto,
  escapeHtml,
  renderInquiryEmail,
  validateInquiry,
  type InquiryFields,
} from "@/lib/contact";

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

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

describe("validateInquiry", () => {
  it("accepts a well-formed inquiry", () => {
    expect(validateInquiry(fields())).toEqual({});
  });

  it("rejects missing required fields", () => {
    const errors = validateInquiry(
      fields({ firstName: "", lastName: "", visitorEmail: "", message: "" }),
    );
    expect(Object.keys(errors).sort()).toEqual([
      "firstName",
      "lastName",
      "message",
      "visitorEmail",
    ]);
  });

  it("treats whitespace-only input as missing", () => {
    const errors = validateInquiry(fields({ firstName: "   ", message: "  \n " }));
    expect(errors.firstName).toBeDefined();
    expect(errors.message).toBeDefined();
  });

  it("rejects addresses that cannot be delivered to", () => {
    for (const visitorEmail of [
      "jamie",
      "jamie@",
      "@example.com",
      "jamie@example",
      "jamie @example.com",
      "jamie@exa mple.com",
    ]) {
      expect(validateInquiry(fields({ visitorEmail })).visitorEmail).toBeDefined();
    }
  });

  it("accepts real-world addresses a stricter regex would reject", () => {
    for (const visitorEmail of [
      "jamie.rivera+gym@example.co.uk",
      "j_r-99@sub.domain.example.com",
      "Shane12.sb@gmail.com",
    ]) {
      expect(validateInquiry(fields({ visitorEmail })).visitorEmail).toBeUndefined();
    }
  });

  it("enforces a minimum message length so 'hi' is not a lead", () => {
    expect(validateInquiry(fields({ message: "hi" })).message).toBeDefined();
  });

  it("enforces the upper bounds", () => {
    expect(validateInquiry(fields({ firstName: "a".repeat(81) })).firstName).toBeDefined();
    expect(
      validateInquiry(fields({ message: "a".repeat(5001) })).message,
    ).toBeDefined();
    expect(
      validateInquiry(fields({ message: "a".repeat(5000) })).message,
    ).toBeUndefined();
  });
});

/* ------------------------------------------------------------------ */
/* Email rendering                                                     */
/* ------------------------------------------------------------------ */

describe("renderInquiryEmail", () => {
  it("puts the visitor's name in the subject", () => {
    expect(renderInquiryEmail(fields()).subject).toBe("New inquiry from Jamie Rivera");
  });

  it("carries name and address in both parts", () => {
    const { text, html } = renderInquiryEmail(fields());
    for (const part of [text, html]) {
      expect(part).toContain("Jamie Rivera");
      expect(part).toContain("jamie@example.com");
    }
  });

  it("carries the message in both parts — raw in text, escaped in html", () => {
    const { text, html } = renderInquiryEmail(fields());
    expect(text).toContain("I'd like to get started.");
    expect(html).toContain("I&#39;d like to get started.");
  });

  it("trims the fields before rendering", () => {
    const { subject } = renderInquiryEmail(
      fields({ firstName: "  Jamie  ", lastName: " Rivera " }),
    );
    expect(subject).toBe("New inquiry from Jamie Rivera");
  });

  it("escapes markup so a hostile message cannot inject HTML", () => {
    const { html } = renderInquiryEmail(
      fields({
        message: "<script>alert(1)</script>",
        firstName: '"><img src=x onerror=alert(1)>',
      }),
    );
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
  });

  it("leaves the plain-text part unescaped and readable", () => {
    const { text } = renderInquiryEmail(fields({ message: "5k & squats <3" }));
    expect(text).toContain("5k & squats <3");
  });
});

/* ------------------------------------------------------------------ */
/* escapeHtml                                                          */
/* ------------------------------------------------------------------ */

describe("escapeHtml", () => {
  it("escapes every character that can break out of a text node or attribute", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  it("escapes ampersands first so entities are not double-broken", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });
});
