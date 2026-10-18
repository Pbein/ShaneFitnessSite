import { describe, it, expect } from "vitest";
import { isEmbeddableCalendly, calendlyScheduledId } from "@/lib/booking";

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

describe("calendlyScheduledId", () => {
  const msg = {
    event: "calendly.event_scheduled",
    payload: {
      event: { uri: "https://api.calendly.com/scheduled_events/E1" },
      invitee: { uri: "https://api.calendly.com/scheduled_events/E1/invitees/I1" },
    },
  };

  it("returns the invitee URI for a real booking", () => {
    expect(calendlyScheduledId("https://calendly.com", msg)).toBe(
      "https://api.calendly.com/scheduled_events/E1/invitees/I1",
    );
  });

  it("ignores the same message from any other origin — it could be forged", () => {
    expect(calendlyScheduledId("https://evil.example", msg)).toBeNull();
    expect(calendlyScheduledId("https://calendly.com.evil.example", msg)).toBeNull();
  });

  it("ignores Calendly's other events", () => {
    for (const event of [
      "calendly.profile_page_viewed",
      "calendly.event_type_viewed",
      "calendly.date_and_time_selected",
      "calendly.page_height",
    ]) {
      expect(calendlyScheduledId("https://calendly.com", { event })).toBeNull();
    }
  });

  it("still counts a booking whose payload lacks an invitee URI", () => {
    expect(calendlyScheduledId("https://calendly.com", { event: "calendly.event_scheduled" })).toBe("");
  });

  it("ignores non-object messages", () => {
    expect(calendlyScheduledId("https://calendly.com", "calendly.event_scheduled")).toBeNull();
    expect(calendlyScheduledId("https://calendly.com", null)).toBeNull();
  });
});
