# Going live on `trainshane.com`

Written 2026-08-22. Two audiences, clearly split:

- **Part A is for Shane.** He buys and owns the domain. Send him Part A on its own.
- **Parts B–I are for whoever does the wiring.** Nothing there needs Shane except
  the DNS records in Part C, which he either pastes himself or delegates.

The domain purchase is the only step that cannot be undone cheaply or done out of
order. Everything after it is a config change we can repeat.

---

## The decision this document assumes

| | |
|---|---|
| Domain | `trainshane.com` |
| Registrar | **Cloudflare Registrar**, on **Shane's own account, with Shane's own card** |
| DNS host | Cloudflare (mandatory — Cloudflare Registrar only sells domains it also serves DNS for) |
| Hosting | Vercel, project `pbeins-projects/shane-fitness-site` (unchanged) |
| Canonical hostname | **`https://trainshane.com`** (apex). `www.trainshane.com` redirects to it. |

**Why Cloudflare Registrar:** it sells at wholesale cost with no first-year teaser
price and no renewal markup, WHOIS privacy is free and permanent, and transfer
locks are not used as a retention tactic. Expect roughly **$10–12/year, every
year**. GoDaddy and Namecheap are cheaper in year one and meaningfully more
expensive forever after.

**Why apex, not `www`:** Shane will say this domain out loud — to clients, on
Instagram, on a business card. `trainshane.com` is what he will say. Vercel's own
docs lean `www`-first (an apex cannot be a CNAME, so it cannot fail over as
gracefully), but that matters for high-traffic apps, not a marketing site of
eight static pages. Both hostnames work either way; this only decides which one
the other redirects to, and which one every canonical tag, Stripe redirect and
share card points at. **Pick it once here and never mix the two.**

---

# PART A — For Shane: buying the domain

**Time: about 10 minutes. Cost: about $11 for the first year.**

You are buying this on your own account with your own card, on purpose. The
domain is a business asset — if it is registered under someone else's account,
you do not fully control your own web address. This keeps it yours.

### 1. Create a Cloudflare account

Go to **https://dash.cloudflare.com/sign-up**. Use an email address you will
still have in five years — a personal Gmail is fine; a work address you might
lose is not. Verify the email.

### 2. Turn on two-factor authentication immediately

**My Profile → Authentication → Two-Factor Authentication.** Use an
authenticator app. Save the recovery codes somewhere real.

This is not optional paperwork. Whoever controls this account controls the web
address your clients type. It is the most security-sensitive account in the
business.

### 3. Add a payment method

**Manage Account → Billing → Payment Methods.** Add a card. Cloudflare charges
nothing until you actually buy the domain.

### 4. Register the domain

**Domain Registration → Register Domains** in the left sidebar. Search for:

```
trainshane.com
```

It was confirmed available on 2026-08-22 at $11.25/year. Prices move; anything
around $10–12 is right. Select it and complete the purchase.

**During checkout:**

- **Auto-renew: ON.** Leave it on. A lapsed domain is how businesses lose their
  web address to a squatter, and it happens quietly.
- **WHOIS privacy / redaction: ON.** Cloudflare does this free and by default —
  it keeps your home address and phone number out of public records. If you see
  the option, confirm it is on.
- **Do not buy anything else.** No extra TLDs, no "protection" packages.

### 5. Confirm it worked

Within a minute or two you should see `trainshane.com` under **Domain
Registration → Manage Domains**, and a matching entry in your Cloudflare
**Websites** list. That second one is the DNS zone — it is what lets us point the
domain at the website.

### 6. Send this back

Message Philip with:

1. **"trainshane.com is registered"**
2. The **email address on the Cloudflare account** — not the password, never the
   password.

Then pick one:

- **Option 1 (fastest):** invite Philip as a member — **Manage Account → Members
  → Invite**, role **Administrator** or **DNS**. He adds the records himself and
  you are done. You can remove him any time afterward.
- **Option 2:** stay hands-on. Philip sends you an exact list of about five DNS
  records to paste in. Ten minutes on a screen share.

Either is fine. Option 1 is faster; Option 2 means nobody but you ever touches
the account.

### One thing to know going in

After the records are added, the change spreads across the internet. Usually
minutes, occasionally a few hours. **The site does not break while this
happens** — the current address (`shane-fitness-site.vercel.app`) keeps working
the whole time. There is no window where you are offline.

---

# PART B — Add the domain in Vercel — **DONE 2026-08-22**

Done before touching Cloudflare DNS, because Vercel generates the record values
and they are project-specific.

```bash
vercel domains add trainshane.com     shane-fitness-site   # domain_added
vercel domains add www.trainshane.com shane-fitness-site   # domain_added
vercel domains verify trainshane.com                       # prints the records
```

Both hostnames are attached to `shane-fitness-site`
(`prj_U7fRqFFUTkRV2NxxvvCchc5hInxi`) and show `"domainOwnership":
"current-scope"`, `"attached": true`. Status is `invalid-configuration` until the
Part C records land — which is the expected state, not a fault.

**One thing still to do by hand, in the dashboard:** Settings → Domains → set
**`trainshane.com` as Primary**, and set `www.trainshane.com` to **Redirect to
`trainshane.com`**. There is no CLI flag for this. If it is skipped, both
hostnames serve the same content independently — which splits Google's view of
the site between two addresses and means half the share links in the wild carry
the wrong one.

> **If these records are ever regenerated, read them off `vercel domains verify`,
> not from a guide.** Vercel issues a per-project CNAME target and IPs from an
> anycast pool. Almost every article online quotes `76.76.21.21` and
> `cname.vercel-dns.com`, which are Vercel's *rank-2 legacy* values.

---

# PART C — The DNS records, all in one sitting

Do the Vercel records and the Resend email records **at the same time**. Both
live in the same Cloudflare zone and both need propagation, so doing them
together turns two waiting periods into one.

In Cloudflare: **Websites → trainshane.com → DNS → Records**.

**These are the real values, read from `vercel domains verify` on 2026-08-22 after
both hostnames were attached to the project.** Not placeholders.

| Type | Name | Value | Proxy | Purpose |
|---|---|---|---|---|
| CNAME | `@` | `a2250fb8a84eeb3a.vercel-dns-017.com` | **DNS only** | Apex → Vercel |
| CNAME | `www` | `a2250fb8a84eeb3a.vercel-dns-017.com` | **DNS only** | www → Vercel |
| MX | `send` | *(from Resend)*, priority 10 | n/a | Resend bounce handling |
| TXT | `send` | *(SPF string from Resend)* | n/a | SPF |
| TXT | `resend._domainkey` | *(long DKIM key from Resend)* | n/a | DKIM signing |

**Yes, a CNAME at the apex — that is deliberate and it is what Vercel asked for.**
Plain DNS forbids a CNAME at a zone apex, but Cloudflare implements **CNAME
flattening**: it resolves the target itself and answers apex queries with A
records. Vercel detected Cloudflare as the DNS provider and recommended the
flattened CNAME accordingly, and it is the better option — it follows Vercel's
anycast pool automatically instead of pinning an IP that can be reassigned.

**Fallback, only if Cloudflare rejects the apex CNAME:** two A records at `@`,
`216.198.79.1` and `64.29.17.1` (Vercel's current rank-1 pool). The much-quoted
`76.76.21.21` is Vercel's rank-2 legacy address — it works, but prefer the pair
above.

### The one mistake that will cost you an afternoon

**Every Vercel record must be grey-cloud "DNS only" — never orange-cloud
"Proxied."**

Cloudflare defaults new A and CNAME records to Proxied. If you leave it on,
Cloudflare terminates TLS itself, Vercel's certificate challenge never reaches
Vercel, the certificate is never issued, and Vercel reports the domain invalid.
The visible symptom is `ERR_TOO_MANY_REDIRECTS`, which looks like a site bug and
sends you debugging entirely the wrong thing. Click the orange cloud until it
turns grey.

### Also check

- **CAA records.** Look for any record of type `CAA`. If there are none you are
  fine — no CAA means any authority may issue. If any exist, Let's Encrypt must
  be permitted: `0 issue "letsencrypt.org"`. A CAA record that omits Let's
  Encrypt blocks Vercel's certificate silently.
- **Leftover records.** A freshly registered domain should have an empty zone. If
  Cloudflare pre-created a parking A record or a placeholder CNAME at `@` or
  `www`, delete it — a stale record at the same name wins over the one you just
  added.

### Optional, and worth it: `shane@trainshane.com`

Cloudflare **Email Routing** (free, in the sidebar) forwards
`shane@trainshane.com` to his Gmail in about five minutes. It adds its own MX
records at the apex, which does **not** conflict with Resend — Resend's MX sits
on the `send.` subdomain. A branded reply address is worth more than it costs on
a site whose entire job is inbound inquiries.

Do this **after** the site is confirmed live, not during. One change at a time.

---

# PART D — The site itself

**Order matters, and step 3 is the one people skip.**

1. Wait until Vercel shows **Valid Configuration** with a certificate issued on
   both `trainshane.com` and `www.trainshane.com`.

2. Set the environment variable:

   ```bash
   vercel env add NEXT_PUBLIC_SITE_URL production
   # paste exactly: https://trainshane.com     (no trailing slash)
   ```

3. **Redeploy. This is not optional.**

   ```bash
   vercel --prod
   ```

   Every marketing page on this site is **statically prerendered at build time**.
   The env var is read during the build and baked into the HTML — setting it
   changes nothing already deployed. `robots.txt` and `sitemap.xml` are worse:
   they have `initialRevalidateSeconds: false`, so there is no ISR fallback to
   quietly correct them later. Without a rebuild they advertise
   `shane-fitness-site.vercel.app` to Google indefinitely.

   Skipping this produces a site that *looks* fine and is quietly wrong in every
   canonical tag, every Open Graph share card, and the sitemap.

4. **Add the new domain as a CORS origin in Sanity.** ✅ done 2026-08-22

   The Studio at `https://trainshane.com/studio` talks to Sanity's API from the
   browser, and Sanity only answers browsers on an **explicitly allow-listed
   origin**. The old `shane-fitness-site.vercel.app` was on that list; the new
   domain was not, so the Studio loaded and then failed to fetch anything.

   Sanity prompts you to approve the new origin the first time you open the
   Studio on it, which is how this was actually caught — worth knowing it is a
   one-click approval, not a debugging session.

   To do it deliberately instead of being prompted:
   [sanity.io/manage](https://www.sanity.io/manage) → project `gze75bpb` →
   **API → CORS origins → Add origin** → `https://trainshane.com`, and **tick
   "Allow credentials"** (the Studio authenticates; without it you get a login
   loop rather than a clear error). Add `https://www.trainshane.com` too if you
   ever serve the Studio there — with the 308 redirect in place you don't need
   to.

   > **This step is invisible until it bites.** Nothing about the site's public
   > pages depends on it — they're server-rendered and fetch from Sanity
   > server-side, where CORS does not apply. Only the browser-based Studio
   > breaks, so a full check of the live site passes while `/studio` is dead.
   > Leave the old vercel.app origin in place as a fallback route into the CMS.

---

# PART E — Stripe

Three Payment Links and one Customer portal. Dashboard → **Payment Links** →
each link → **Edit** → **After payment**.

The paths and `plan` values were verified correct on 2026-08-21, so **this is a
hostname swap, not a repair.** Change only the part before `/welcome`:

| Link | From | To |
|---|---|---|
| In Person, $100 one-time | `https://shane-fitness-site.vercel.app/welcome?plan=in-person` | `https://trainshane.com/welcome?plan=in-person` |
| Essential, $199/mo | `…/welcome?plan=essential` | `https://trainshane.com/welcome?plan=essential` |
| Premium, $349/mo | `…/welcome?plan=premium` | `https://trainshane.com/welcome?plan=premium` |

Leave `?plan=` alone. Those three values are matched exactly against `PLAN_COPY`
in `src/lib/welcome.ts`. A typo there fails **silently** — the visitor still gets
a 200 and plausible copy, but is offered the free-consultation Calendly instead
of the event type they just paid for.

While you are in Stripe:

- **Settings → Billing → Customer portal → return URL** → `https://trainshane.com`
- **On each of the three links, turn on "Collect terms of service agreement"**,
  pointing at `https://trainshane.com/terms`. It is currently `No`. For recurring
  subscriptions with a stated cancellation policy, acceptance recorded against
  the payment is worth considerably more than a footer link.

The old `shane-fitness-site.vercel.app` redirects keep working even if you forget
all of this — nothing breaks loudly. Which is exactly why it is easy to leave
undone for six months.

---

# PART F — Calendly

**Almost certainly nothing to do, but confirm rather than assume.**

Calendly links are absolute `calendly.com/...` URLs. They neither know nor care
what hostname embeds them, so the domain change does not touch them. In use:

| Where | Event |
|---|---|
| Site-wide "Book a Free Consultation" | `calendly.com/shane12-sb/free-consultation` |
| `/welcome?plan=essential` | `calendly.com/shane12-sb/30min` |
| `/welcome?plan=premium` | `calendly.com/shane12-sb/weekly-one-on-one` |
| `/welcome?plan=in-person` | `calendly.com/shane12-sb/in-person-1-1-session` |

Two things to check in the Calendly dashboard:

1. **Per-event "Redirect to an external site" setting.** If any event redirects
   somewhere on the old hostname after booking, update it. The default is
   Calendly's own confirmation page, in which case there is nothing to change.
2. **Hardcoded links** in event descriptions or confirmation emails that point at
   `shane-fitness-site.vercel.app`.

---

# PART G — Everywhere else the old hostname might be written down

- **Sanity Studio** — check `siteSettings` for any absolute URL on the old host.
  Booking and payment links are external, so this should be clean.
- **Sanity webhook**, if `SANITY_REVALIDATE_SECRET` gets set (see
  `LAUNCH-READINESS.md` S3): point it at `https://trainshane.com/api/revalidate`.
- **Instagram bio link** — this is the actual traffic source. Update it.
- **Google Search Console** — add `https://trainshane.com` as a new property (a
  hostname change is a new property, not an edit), then submit
  `https://trainshane.com/sitemap.xml`.
- **Google Business Profile** — worth creating. For "personal trainer DC / MD /
  VA", local search is where this audience actually is.
- **Resend** — the `from` address moves to `noreply@trainshane.com` once the
  domain verifies. See `docs/CONTACT-FORM.md`.

---

# PART H — Verification, after everything above

Run these in order. Each catches a different failure.

```bash
# 1. Both hostnames resolve and serve, and www redirects to apex
curl -sI https://trainshane.com     | head -1              # expect 200
curl -sI https://www.trainshane.com | head -1              # expect 307/308
curl -sI https://www.trainshane.com | grep -i location     # -> https://trainshane.com/

# 2. The rebuild actually took. This is the step that gets skipped.
curl -s https://trainshane.com/services | grep -o '<link rel="canonical"[^>]*>'
#    expect href="https://trainshane.com/services"
#    still says shane-fitness-site.vercel.app -> Part D step 3 did not happen

curl -s https://trainshane.com/robots.txt  | grep -i sitemap   # new host
curl -s https://trainshane.com/sitemap.xml | head -20          # new host
curl -s https://trainshane.com | grep -o 'og:url[^>]*'         # new host

# 3. Hidden pages are still hidden
curl -sI https://trainshane.com/success-stories | head -1       # expect 404
curl -sI https://trainshane.com/resources       | head -1       # expect 404

# 4. Full browser audit against the real domain
BASE=https://trainshane.com node scripts/audit-site.mjs
#    expect 200s everywhere, no console errors, one <h1> per route
```

Then by hand, in a browser:

- [ ] Buy the **$100 In-Person** link with a **real card** → lands on
      `https://trainshane.com/welcome?plan=in-person` → the copy names the
      in-person session → book the Calendly slot → **the calendar invite actually
      arrives** → **refund the charge in Stripe** → **delete the test Calendly
      booking**.
- [ ] Open `/welcome?plan=essential` and `?plan=premium` directly (free) and
      confirm each shows its own tier's copy and its own Calendly event.
- [ ] **Submit the contact form** on `https://trainshane.com/contact` and confirm
      the email reaches `Shane12.sb@gmail.com`.
- [ ] "Manage subscription" in the footer opens the Stripe portal and returns to
      `trainshane.com`.
- [ ] Open the site on a real phone. The hamburger menu covers the full screen
      with no page visible behind it at the top.
- [ ] Paste `https://trainshane.com` into an iMessage or a Slack DM and confirm
      the share card renders with the right image and title.
- [ ] **Open `https://trainshane.com/studio` and confirm content actually
      loads**, not just that the page renders. If documents fail to appear or
      you get a login loop, the CORS origin from Part D step 4 is missing. This
      is the one check that a full pass over the public site will never catch.
- [ ] Publish a trivial CMS edit and watch it land. Seconds = the webhook is
      good. About a minute = ISR is carrying it (fine). Never = stop and
      investigate.

---

# PART I — If something goes wrong

Nothing here is a one-way door.

| Symptom | Cause | Fix |
|---|---|---|
| `ERR_TOO_MANY_REDIRECTS` | Cloudflare proxy is ON | Grey-cloud the A and CNAME records |
| Vercel stuck on "Invalid Configuration" | Value mismatch, or a leftover parking record at the same name | Compare against the Vercel card character by character; delete duplicates |
| Certificate never issues | CAA record excludes Let's Encrypt | Add `0 issue "letsencrypt.org"`, or remove the CAA records |
| Site loads, but canonicals and sitemap still say `.vercel.app` | The redeploy in Part D step 3 did not happen | `vercel --prod` |
| Public site fine, but `/studio` shows no content or loops on login | New domain isn't a Sanity CORS origin | Part D step 4 — add it with "Allow credentials" ticked |
| Everything is broken and it is Sunday | — | The old `shane-fitness-site.vercel.app` URL still works and is untouched by any of this. Point Instagram back at it and debug on Monday. |

Adding a custom domain does not decommission the old Vercel URL. It remains a
working fallback indefinitely.

---

## Order of operations, condensed

```
Shane: buy trainshane.com at Cloudflare          (Part A)  ~10 min
  |
Vercel: add both hostnames, screenshot records   (Part B)  ~5 min
  |
Cloudflare: paste Vercel + Resend records,       (Part C)  ~10 min
            ALL GREY CLOUD
  |
        wait for Valid Configuration                 minutes to hours
  |
Vercel: NEXT_PUBLIC_SITE_URL, then REDEPLOY      (Part D)  ~5 min
  |
Sanity: add the domain as a CORS origin          (Part D4) ~2 min
        — or /studio loads but stays empty
  |
Stripe: 3 redirects, portal URL, ToS checkbox    (Part E)  ~10 min
  |
Calendly: confirm nothing points at old host     (Part F)  ~5 min
  |
Verify everything, incl. one real purchase       (Part H)  ~20 min
```
