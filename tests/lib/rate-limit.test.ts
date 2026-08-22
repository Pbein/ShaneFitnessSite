import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, __resetRateLimit } from "@/lib/rate-limit";

/**
 * Time is injected rather than mocked so these stay pure and fast. The limiter
 * is in-process by design — see the note in the module about what it does and
 * does not defend against.
 */
const OPTS = { limit: 3, windowMs: 1000 };

beforeEach(__resetRateLimit);

describe("rateLimit", () => {
  it("allows up to the limit within a window", () => {
    for (let i = 0; i < 3; i++) {
      expect(rateLimit("ip", OPTS, 0).ok).toBe(true);
    }
  });

  it("blocks the request after the limit", () => {
    for (let i = 0; i < 3; i++) rateLimit("ip", OPTS, 0);
    expect(rateLimit("ip", OPTS, 0).ok).toBe(false);
  });

  it("reports seconds remaining when blocked", () => {
    for (let i = 0; i < 4; i++) rateLimit("ip", OPTS, 0);
    expect(rateLimit("ip", OPTS, 400).retryAfter).toBe(1);
  });

  it("keys are independent — one visitor cannot lock out another", () => {
    for (let i = 0; i < 4; i++) rateLimit("a", OPTS, 0);
    expect(rateLimit("a", OPTS, 0).ok).toBe(false);
    expect(rateLimit("b", OPTS, 0).ok).toBe(true);
  });

  it("resets once the window has elapsed", () => {
    for (let i = 0; i < 4; i++) rateLimit("ip", OPTS, 0);
    expect(rateLimit("ip", OPTS, 0).ok).toBe(false);
    expect(rateLimit("ip", OPTS, 1000).ok).toBe(true);
  });

  it("does not reset early", () => {
    for (let i = 0; i < 4; i++) rateLimit("ip", OPTS, 0);
    expect(rateLimit("ip", OPTS, 999).ok).toBe(false);
  });
});
