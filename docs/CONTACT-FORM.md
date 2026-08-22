# The contact form

Built 2026-08-22, replacing the `mailto:` handoff that had never sent anything
(blocker B1 in `LAUNCH-READINESS.md`).

## What was wrong

The old form set `window.location.href` to a `mailto:` link and then displayed
"Your email app should have opened…" **unconditionally** — it could not check,
because nothing in the browser reports whether a `mailto:` handler exists or
whether the user ever pressed send.

- **Webmail visitors** (anyone living in Gmail's web app, a large share of this
  audience) clicked Send and nothing happened at all. The success message
  appeared anyway. The lead vanished and nobody knew.
- **Phone visitors** got a pre-filled draft they still had to send themselves.
- **Shane** received no notification and there was no record of who tried.

## What it is now

A **Server Action** that sends a real email through Resend and returns a real
result.

```
ContactForm.tsx  (client)        actions.ts  (server)
  useActionState ──────────────▶  submitInquiry
  useFormStatus                     ├── honeypot check
  renders: idle | error | success   ├── validateInquiry      (pure, tested)
                                    ├── rateLimit            (pure, tested)
                                    ├── getSiteSettings()    ← recipient
                                    ├── renderInquiryEmail   (pure, tested)
                                    └── resend.emails.send
```

| File | Role |
|---|---|
| `src/lib/contact.ts` | Validation, email rendering, HTML escaping, mailto fallback — all pure |
| `src/lib/rate-limit.ts` | In-process sliding window, time injected for testing |
| `src/app/(site)/contact/actions.ts` | The Server Action: the only impure part |
| `src/components/ContactForm.tsx` | Form UI and the three states |
| `tests/lib/contact.test.ts`, `tests/lib/rate-limit.test.ts` | 80 tests total across the suite |

## Decisions worth knowing

**`action={formAction}`, not `onSubmit`.** This is what makes the form work with
JavaScript disabled or still loading — the browser posts the form natively and
React reconciles the returned state. An `onSubmit` handler would have made the
form dead until hydration finished, on a page that already pulls ~860KB of
third-party Calendly JS.

**The recipient is never accepted from the client.** `submitInquiry` calls
`getSiteSettings()` itself. A recipient in the payload would be an open relay:
anyone could POST the endpoint and have Shane's domain send mail anywhere. It
also structurally prevents the F1 bug (inquiries mailed back to the sender)
from ever recurring — there is no client-supplied address to get backwards.

**`replyTo` is the visitor.** Shane hits Reply and reaches the person, from his
own inbox. The `from` is always `noreply@trainshane.com`, because sending *as*
the visitor's address would fail SPF/DKIM and land in spam.

**Everything hostile is escaped.** Anyone on the internet can type anything into
this form, and it lands in Shane's mail client. `escapeHtml` covers the HTML
part; the plain-text part is deliberately left raw, which is correct — there is
no markup context to break out of.

**Idempotency key = hash of the payload.** The same message within 24 hours
returns the original send rather than a second email, so a double-click or a
retry produces one notification. A genuinely identical message twice in a day is
a double-submit, and suppressing it is the right call.

**Failures are generic to the visitor, specific to the log.** An unverified
domain, a Resend outage and a missing API key all render the same sentence plus
a `mailto:` escape hatch, because the visitor can act on none of them. The
distinguishing detail goes to `console.error`, where it is actionable — visible
in `vercel logs`.

**The honeypot reports success.** A bot that fills the hidden `company` field
gets the success state and the message is dropped. Telling a bot it was caught
only teaches it to avoid the trap.

**Rate limiting is in-process and that is a deliberate trade.** On Fluid Compute
the instance is reused, so the window genuinely persists between requests — but
traffic across regions or a cold start resets it. It stops a bored script and an
accidental double-submit, not a targeted flood. If inquiry spam ever becomes
real, the fix is a shared store (Upstash Redis via the Vercel Marketplace), not
tuning the constants. Current setting: **5 submissions per IP per 15 minutes.**

## Infrastructure

Provisioned through the Vercel Marketplace, not a hand-wired SDK:

```bash
vercel integration add resend/resend-email -m domain=trainshane.com -m region=us-east-1
```

- Resource `resend-email-sky-ribbon`, **Free plan** — 3,000 emails/month, 100/day.
- `RESEND_API_KEY` and `RESEND_EMAIL_DOMAIN` are injected into production,
  preview and development automatically. Neither is in the repo.
- Region `us-east-1`, matching the audience.

### Domain verification

Sending from `noreply@trainshane.com` requires `trainshane.com` to be verified
in Resend. Three records, added to Cloudflare alongside the Vercel ones:

| Type | Name | Value | Priority |
|---|---|---|---|
| `TXT` | `resend._domainkey` | the DKIM public key | — |
| `MX` | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |
| `TXT` | `send` | `v=spf1 include:amazonses.com ~all` | — |

Until those verify, the code falls back to `onboarding@resend.dev`, which is
Resend's sandbox and **only delivers to the Resend account owner's own address**
— fine as a stopgap, useless for real inquiries. Check status with:

```bash
curl -s https://api.resend.com/domains -H "Authorization: Bearer $RESEND_API_KEY"
```

### Domain warm-up

A brand-new sending domain is limited to roughly 150 emails on day one. Far
above anything this form will produce, but worth knowing before anyone points a
bulk send at the same domain.

## Still open

- **No confirmation email to the visitor.** The on-page success state covers
  receipt; an auto-reply would add reassurance. Deliberately skipped at launch to
  keep one send path rather than two.
- **No stored record.** If Shane ever wants inquiries in a database or a CRM
  rather than only his inbox, that is a second destination in the same action.
- **`track("contact_submit")` fires on success** — Vercel Analytics only, no
  payload, no PII.
