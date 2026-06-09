# Train Shane — Content Map

> Inventory of the existing 3-page Squarespace site (`/SquareSpaceDemo`), organized so it maps cleanly onto the planned Sanity schema. This is the source of truth for seeding the CMS. **Nothing here is final copy — it's migrated as-is, lightly cleaned for typos/encoding.** Flagged items need an owner decision (marked ⚠️).

---

## 1. Brand Cues (inferred)

**Business name:** Train Shane — *Personal Training* (logo wordmark). Site title / Squarespace handle: "TrainShane".

**Archetype:** The Educator Coach — evidence-based, mature, approachable. Not gym-bro, not clinical. (Confirmed by the About portrait and copy.)

**Voice / tone:** First-person, calm, reassuring, anti-gimmick. Recurring themes: *simple, sustainable, realistic, results, habits, no extremes*. Signature line: **"Realistic. Sustainable. Results."**

**Color palette** (from logo + About composite image):
| Role | Hex | Notes |
|---|---|---|
| Background base | `#0A0A0A` / `#111111` / `#171717` | Deep charcoal, not pure black |
| Accent (brand red) | `#D62828` (logo gradient ~`#C1121F`→`#E5383B`) | Used sparingly: CTAs, icons, dividers, highlight words |
| Text primary | `#F5F5F5` | |
| Text secondary | `#B0B0B0` | |
| Text muted | `#7A7A7A` | |
| Card surface | `rgba(255,255,255,.03)` w/ `1px solid rgba(255,255,255,.08)` | Minimal, professional |

**Typography:**
- Headings — condensed uppercase: **Oswald / Bebas Neue / Barlow Condensed**. (Recommend Oswald for range of weights.)
- Body — **Inter** or **Manrope**.

**Motion bar:** subtle only — fade-up on scroll, slight parallax, number counters for credentials. No neon, no flying elements.

**Photography style:** natural-light gym, confident/approachable, no shirtless mirror selfies. The supplied About portrait is the gold standard.

---

## 2. Image Inventory

| File | Suggested role | Notes |
|---|---|---|
| `Logo.webp` (= `ChatGPT…02_22_02PM.png`) | **Logo** | TS crest + "TRAIN SHANE / PERSONAL TRAINING" on black. Use in header + footer. |
| `ChatGPT…03_03_31PM.png` (= `AboutPic.png`) | **About hero / portrait** | Full "About Me" composite: portrait + credentials + interests. The single strongest brand asset. Use the portrait crop for About hero; rebuild the credential/interest content as native components (don't ship the flat image as the page). |
| `unsplash-image-BpuZCbAOhnw.jpg` | **Hero background / section accent** | Dramatic low-key dumbbell on black. Good for home hero bg or a CTA band. |
| `unsplash-image-JWK2H-2qz1Y.jpg` | **Section background** | Blank paper + pen on black — fits a "your plan starts here" / contact band. |
| `HomeAbout.png`, `Footer.png`, `AboutPageCTA.png` | *reference screenshots only* | Current-site screenshots, not deliverable assets. |

⚠️ **Need from owner:** higher-res standalone portrait(s), and any real client/gym action photos for a gallery. Current assets are thin (mostly stock + one composite).

---

## 3. Pages & Sections

### Navigation (current)
`Services` · `About` · `Contact` — logo links home. Footer: business name, email, Instagram icon.

> Note: the current "Services" nav item points to the **Store** page (Squarespace commerce). In the rebuild, Services = the 3 offerings below, and the prior ChatGPT brief suggests a richer nav (Home / About / Coaching / Success Stories / Contact). ⚠️ Decide final nav (see questions at bottom).

---

### HOME (`TrainShane.html`)
The current home page is essentially the **About** content + a contact form. Sections present:

**A. About Me (hero/intro block)**
> "I'm a NASM Certified Personal Trainer with a Master of Science in Health Promotion Management from American University. My background combines evidence-based health education, behavior change research, and hands-on coaching experience working with a wide range of individuals, including beginners, busy professionals, recreational athletes, and those looking to improve their overall health and quality of life.
>
> My passion for health and wellness began more than a decade ago through my own fitness journey. Over the years, I've spent countless hours learning through both formal education and personal trial and error, exploring different training methods, nutrition strategies, recovery techniques, and approaches to long-term health. That experience taught me that sustainable results rarely come from extremes. Instead, they come from building simple habits and systems that fit into everyday life.
>
> Through my graduate studies, I developed a strong interest in health behavior change and the psychology behind lasting lifestyle transformation. My research focused on understanding how people build healthy habits, overcome barriers, and create meaningful change that can be maintained long-term. This perspective continues to shape my coaching philosophy today.
>
> I also have a particular interest in chronic pain, movement, and the relationship between physical and mental well-being. I understand that many people face challenges that extend beyond simply knowing what exercises to do. Stress, pain, previous injuries, confidence, and daily life demands all play a role in long-term success, and I strive to help clients navigate those challenges with a realistic and sustainable approach.
>
> Outside of coaching, my other interests include: Brazilian Jiu-Jitsu, continually improving my Spanish, and a strong interest in mental health, personal growth, and overall well-being. These passions have reinforced my belief that health is about much more than appearance. It's about building resilience, enjoyment, confidence, physical capability, and a lifestyle that supports the life you want to live.
>
> Whether you're looking to improve your body composition, gain strength, establish a consistent exercise routine, or simply feel healthier and more confident, my goal is to help you create a clear, practical path forward that fits your lifestyle and produces lasting results."

**B. "My Goal for You"**
> "Both my journey and relationship with all things health and exercise have been anything but linear. My initial interest in health and wellness began more than 15 years ago. Since then, I have explored many concepts, trends, routines, diets, supplements, and so on — all for better or worse — that took me down a unique path of learning and understanding. However, after years of working towards my own fitness goals, and working with others to achieve their own, I gathered the following: people's inability to reach their goals is not from lack of information, nor lack of motivation. It is typically the opposite; there is too much information nowadays from social media, podcasts, societal trends, medical advice, etc., that people become confused and overwhelmed on where to begin, and never even take the first step forward.
>
> My goal is to provide you with a foundation to begin or enhance an exercise routine specific to you, that is simple and sustainable, and above all, that you ENJOY! I want to teach you enough that eventually you don't need me at all!"

**C. Contact band — "Ready to Get Started?"**
> "Send me a quick message, and I'll get back to you within one business day."
> Form: First Name (req), Last Name (req), Email (req), "Sign up for news and updates" checkbox, Message (req), Submit.

**Credentials (from About composite image — render as cards):**
- **Education** — Master of Science, Health Promotion Management, American University
- **Certification** — NASM Certified Personal Trainer
- **Experience** — Training the general population, busy professionals, and athletes of all levels
- **Areas of Focus** — Strength & Conditioning · Body Composition · Chronic Pain & Movement · Health Behavior Change

**Personal interests (render as 3 cards):**
- **Brazilian Jiu-Jitsu** — Purple Belt
- **Improving my Spanish** — A lifelong student
- **Mental Health** — Passionate about mindset and well-being

**Mission statement (signature block):**
> "My mission is simple: help you build sustainable habits, improve your health, and become the strongest version of yourself — physically and mentally."
> **REALISTIC. SUSTAINABLE. RESULTS.**

---

### ABOUT
⚠️ The current site has **no separate About page** — all About content lives on the home page (above). The prior brief calls for a dedicated About page (Hero Portrait → Credentials Grid → My Story → Philosophy → Focus Areas → Personal Interests → Mission → CTA). Recommend splitting: a tighter, conversion-focused **Home**, and a full **About** page reusing the copy above.

---

### SERVICES (`Store 2 — TrainShane.html`)
Header: "Services — 3 Results". Three offerings:

| # | Name | Price | Duration | Description |
|---|---|---|---|---|
| 1 | **Free Consultation** | $0.00 | ~30 min ⚠️(not stated) | "Schedule a free consultation to discuss your goals, current routine, and determine if coaching is the right fit for you." |
| 2 | **In-Person One-on-One Session** | $100.00 | 1 hour | "$100 for a 1-hour personal training session for those local to DC, Maryland, and Virginia." |
| 3 | **Virtual Coaching** | $200.00 | per month ⚠️(assumed) | See full detail below. |

**Virtual Coaching — full copy:**
> "Personalized fitness coaching designed for busy professionals, beginners, and anyone looking to improve their body composition without spending hours in the gym."
>
> **What's Included**
> - Customized workout program tailored to your goals, schedule, experience level, and available equipment
> - Sustainable nutrition guidance focused on fat loss, muscle gain, and long-term success
> - Weekly check-ins to review progress, address challenges, and make adjustments
> - Unlimited messaging support for accountability and questions throughout the week
> - Exercise technique and form feedback through video review
> - Ongoing program modifications as your goals, schedule, and fitness level evolve
> - Progress tracking including body weight, measurements, strength, habits, and overall consistency
> - Behavior-change coaching based on evidence-based principles to help you build lasting habits
>
> **Who It's For**
> - Busy professionals with limited time
> - People looking to lose fat and build muscle
> - Beginners who feel overwhelmed and don't know where to start
> - Anyone seeking a simple, sustainable approach to health and fitness
>
> **My Approach**
> "No extreme diets. No spending hours in the gym. No fitness-industry gimmicks. Just a personalized plan, expert guidance, and accountability to help you build sustainable habits and achieve lasting results."

CTA on cards: "Learn More". Store footer band: "Have Questions? Let's Talk! Send us a quick note, and we'll map out the next steps together." + contact form.

---

### CONTACT (`Contact — TrainShane.html`)
- Heading: **"Tell Me How I Can Help"**
- Sub: "Fill out the form below to get started."
- Form: First Name (req), Last Name (req), Email (req), Message (req), SEND.

---

## 4. Contact / Business Info
| Field | Value |
|---|---|
| Email | `Shane12.sb@gmail.com` |
| Phone | ⚠️ not present on site |
| Address | Serves **DC, Maryland, Virginia** (in-person, local). No street address. |
| Instagram | Icon in footer, ⚠️ no URL exposed in export — need handle |
| Other socials | none found |
| Hours | ⚠️ not present |

---

## 5. Mapping → Sanity Schema (preview)

- **siteSettings** ← businessName "Train Shane", tagline "Realistic. Sustainable. Results.", email, address region (DC/MD/VA), Instagram, logo (`Logo.webp`), `bookingUrl` ⚠️(none yet — need Calendly/Google link), `paymentLinks` ⚠️(none yet — need Stripe links per service), SEO defaults.
- **homepage** ← hero (headline/subheadline/portrait/CTA), featuredServices → the 3 services, mission block, credentials + interests sections.
- **aboutPage** ← "About Me" + "My Goal for You" body, portrait, credentials, focus areas, interests, mission.
- **service** (×3) ← Free Consultation / In-Person Session / Virtual Coaching (name, description, price, duration, bookingLink or paymentLink override, order).
- **testimonial** ← ⚠️ none exist yet (brief wants a Success Stories section — needs real content).
- **galleryImage** ← ⚠️ none beyond stock — needs owner photos.

---

## 6. Open Questions (need owner decisions before/while seeding)
1. **Booking tool:** Calendly or Google Calendar appointment scheduling? (Need the URL to wire "Book Consultation".) — *Recommend Calendly.*
2. **Stripe Payment Links:** Are there live links yet for the $100 session and $200 Virtual Coaching? If not, I'll stub them and the owner pastes real ones later.
3. **Virtual Coaching = $200/month or one-time?** Confirm billing cadence.
4. **Free Consultation duration** (30 min?) and **booking** — should it go straight to the booking calendar.
5. **Nav structure:** keep simple (Home / About / Services / Contact) or expand (add Success Stories / Resources)?
6. **Instagram handle / URL** and any **phone number** to publish.
7. **Testimonials & gallery photos** — collect real ones, or omit those sections for the demo?

---

*For the initial demo: I'll proceed with sensible stubs for the ⚠️ items (placeholder booking/payment links, omit empty testimonial/gallery sections) so we get a working Vercel deploy to show the client, then swap in real values via the CMS.*
