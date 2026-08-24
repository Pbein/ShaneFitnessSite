# Hero Section — how it works, and what the image needs to be

Written 2026-08-21, after three rounds of tuning the hero by eye. The point of this
document is to stop doing that: to state what the section actually is, what
physically governs whether it reads well, and therefore what an image has to
contain before it will work.

---

## 1. The one number that governs everything

The hero puts three pieces of text over a photograph. Two are near-white, one is red.
Web accessibility requires a minimum contrast ratio between text and whatever is
behind it, and that ratio depends on the **luminance of the backdrop directly under
the glyphs**.

Working backwards from the requirement gives a hard ceiling on how bright the
photograph is allowed to be where the words sit:

| Text | Colour | Size | Needs | ⇒ backdrop must be no brighter than |
|---|---|---|---|---|
| Headline | `cream-100` `#F5F5F5` | 36–72px | 3:1 (large text) | **142 / 255** |
| Subheadline | `cream-300` `#B0B0B0` | 18px | 4.5:1 (body text) | **68 / 255** |
| Eyebrow | `brand` `#D62828` | 14px | 4.5:1 (body text) | ~40 / 255 (see §9) |

**The subheadline is the binding constraint: 68/255, roughly 27% brightness.**

That single number explains every problem we've had. The current photograph's left
half — where the copy sits — averages **140/255**. That is twice the allowed
brightness, which is why a scrim is needed at all, and why every attempt to
"brighten the hero" immediately broke the text.

**If the image arrives with its copy zone already at or below ~68/255, the scrim can
be deleted entirely and the rest of the photograph renders at full strength.** That
is the whole goal: stop dimming a bright photo, and start using a photo that is
already dark where it needs to be.

---

## 2. Anatomy — the four layers

`src/app/(site)/page.tsx`, the first `<section>`. Bottom to top:

```
┌─ 4. bottom fade      ink-950 → transparent, going up
│  ┌─ 3. side gradient  ink-950 → transparent, going right
│  │  ┌─ 2. flat scrim  ink-950/45, phones and tablets only
│  │  │  ┌─ 1. <Image fill object-cover>
```

1. **The photograph.** `next/image` with `fill`, so it stretches to the section box
   and crops rather than letterboxes. `priority` (it is the LCP element). Focal point
   shifts right on small screens (`object-[72%_center]`), centred from `md` up.
2. **Flat scrim** — a uniform `ink-950/45` wash. Present below `lg` (1024px) only.
3. **Side gradient** — opaque black at the left edge, 80% at 55% across, gone by 92%.
   This is what protects the copy on wide screens.
4. **Bottom fade** — resolves the photo into the page background so the section does
   not end in a visible horizontal line where it meets the next one.

The section has no fixed height. Its inner container is `min-h-[88vh]` plus `py-28`,
so **the hero is always 88% of the viewport height** and its width is the viewport.

---

## 3. How the text is laid out

All of it lives in one left-aligned, vertically centred block, `max-w-3xl` (768px),
inside `container-x` (`max-w-1200px`, 24px side padding, 32px from `md`).

- **Eyebrow** — 14px, uppercase, `0.18em` letter-spacing, brand red, preceded by a
  40×2px red rule.
- **Headline** — Oswald, uppercase, `leading-[0.98]`, 36px → 48 (`sm`) → 60 (`md`) →
  72 (`lg`).
- **Subheadline** — 18px, `cream-300`, `max-w-xl` (576px).
- **Two CTAs** — stacked below `sm`, side by side above.

### Measured geometry — this is the part that matters for the image

Where the text block actually sits, as a percentage of viewport width:

| Viewport | Hero height | Text block spans | Subheadline ends at | Headline |
|---|---|---|---|---|
| iPhone SE 375 | 620px | **6% – 94%** | 94% | 36px, 2 lines |
| iPhone 14 390 | 743px | **6% – 94%** | 94% | 36px, 2 lines |
| Pixel 412 | 805px | **6% – 94%** | 94% | 36px, 1 line |
| iPad 768 | 901px | **4% – 96%** | 79% | 60px |
| iPad Pro 1024 | 1202px | 3% – 78% | 59% | 72px |
| Laptop 1366 | 676px | **8% – 65%** | 51% | 72px |
| Desktop 1440 | 792px | **11% – 64%** | 51% | 72px |
| Wide 1920 | 950px | **20% – 60%** | 50% | 72px |
| Ultrawide 2560 | 950px | 28% – 58% | 50% | 72px |

**Read the bold rows together and the whole design problem appears:**

- **Below ~1024px the text covers essentially the entire width** (6%–94%). There is
  no "clear side" to hide it in. The image must be dark almost everywhere, or the
  text needs a scrim over the whole frame.
- **At 1366px and above the text occupies only the left ~60%**, and the right 35–40%
  is free. That is where the photograph can be interesting.

These are two genuinely different design problems. One image cannot satisfy both
well — which is the core finding of this document.

### The aspect-ratio problem, quantified

Because the hero is always 88vh tall and 100vw wide, its shape changes enormously:

| | Rendered aspect |
|---|---|
| iPhone 14 | **0.52** (tall portrait) |
| iPad | 0.85 (nearly square) |
| Desktop 1440 | 1.82 (landscape) |
| Wide 1920 | **2.02** (wide landscape) |

That is a **~4× range**. `object-cover` handles it by cropping — at 390px wide, a
1920×1081 source is scaled to 1330px wide and then **70% of its width is thrown
away**. Whatever composition was carefully arranged on the desktop version is simply
not present on a phone.

---

## 4. Why this keeps feeling wrong

The section is currently fighting itself:

- The photo is bright where the text is, so it needs a heavy scrim.
- The scrim dims the whole frame, so the photo looks murky.
- Lightening the scrim breaks the text. (Measured: at 32% the subheadline fell under
  4.5:1 on every phone width.)
- Phones crop away 70% of the image, so the composition that justified the photo
  isn't visible there anyway.

Every one of those is a symptom of a single root cause: **one bright, landscape image
being asked to serve a text-covered portrait crop and a text-free landscape crop at
the same time.**

---

## 5. What the established practice is

Consistent across the sources in §11:

- **A scrim is the reliable technique** — a semi-transparent layer between image and
  text that "instantly quiets the background". We already do this; the goal is to
  need less of it.
- **Validate contrast at the worst point, not the average.** Luminance varies across
  a photo, so the same text can pass in one region and fail in another.
- **Negative space is the mechanism.** Position the headline over an open area; the
  copy zone should be "simple patterns", low detail, ample negative space.
- **Two focal points on opposite sides is an anti-pattern** — there is no room for
  both on a 375px screen.
- **Art direction, not just resizing.** When the crop, aspect ratio, or composition
  needs to differ between mobile and desktop, that is the `<picture>` art-direction
  case, not the simpler resolution-switching case. The standard advice for a
  landscape hero on a portrait phone is a **separate, tighter, closer-to-square
  crop**.

---

## 6. What to aim for

Divide the frame into two zones and treat them completely differently.

```
DESKTOP  (landscape, text on the left 60%)
┌──────────────────────────────────────────────────────┐
│                              ·  ·  ·  ·  ·  ·  ·  ·  │
│   COPY ZONE                    FEATURE ZONE          │
│   0% ──────────────── 62%      62% ──────────── 100% │
│   dark, quiet, empty           the interesting part  │
│   ≤ 68/255                     80–160/255 fine       │
│   no hard edges, no detail     equipment, branding   │
│                              ·  ·  ·  ·  ·  ·  ·  ·  │
└──────────────────────────────────────────────────────┘

MOBILE  (portrait, text covers ~90% of the width)
┌──────────────────┐
│  FEATURE (top)   │  ← the only region that can carry detail
│  ~0–30% height   │
├──────────────────┤
│                  │
│   COPY ZONE      │  ← text sits here, vertically centred
│   ≤ 68/255       │
│   30–85% height  │
│                  │
├──────────────────┤
│  fade to ink-950 │
└──────────────────┘
```

---

## 7. Image spec — desktop

**Dimensions:** 2560 × 1280 (2:1). Covers the 1.8–2.1 range the hero actually renders
at, with no upscaling to 2560. Deliver as PNG or high-quality JPEG; the repo converts
to an optimised JPEG.

**Composition**
- Left **0–62%**: negative space. A wall, a shadowed floor, an out-of-focus room. No
  objects, no strong edges, no text, no high-frequency texture. If a viewer's eye
  catches on anything here, it is competing with the headline.
- Right **62–100%**: the subject. Equipment, the rack, branding. This is the only
  part that survives at every desktop width.
- **One focal point only**, and it must be on the right.
- Keep the bottom **10%** simple — it fades to black and any detail there is lost.

**Brightness (the important part)**
- Copy zone mean: **≤ 68/255**, ideally **40–55/255** for headroom.
- Copy zone must not have bright patches — a spotlight, a window, a light wall panel
  behind the words will fail even if the average passes.
- Feature zone: **80–160/255**. Bright enough to read as lit and intentional.
- Avoid crushing to pure black (<10/255) anywhere; that reads as a rendering fault
  rather than a dark room.

**In one line for an image generator:** *a dark, moody private gym interior; the left
two-thirds is an empty shadowed wall and floor in near-black with no detail; the right
third has a power rack, dumbbells and a wall sign, lit with warm accent lighting;
dramatic low-key lighting, deep shadows, no people, no text on the left.*

---

## 8. Image spec — mobile

**Dimensions:** 1200 × 2000 (3:5 portrait) or 1080 × 1920.

**Composition**
- The text covers 6%–94% of the width and sits vertically centred, so **the middle
  band of the image must be quiet across its full width.**
- Put the identifiable content — the rack, the sign — in the **top 30%**, above the
  headline.
- Everything from ~30% to ~85% height: **≤ 68/255**, low detail.

**In one line:** *the same gym, shot vertically; the rack and wall sign occupy the top
third, the lower two-thirds is empty dark floor and wall receding into shadow.*

---

## 9. Palette

Site tokens: `ink-950 #0A0A0A` · `ink-900 #111111` · `brand #D62828` ·
`cream-100 #F5F5F5` · `cream-300 #B0B0B0`.

- **Push the image cooler or more neutral than the current one.** The present photo is
  lit at roughly tungsten temperature; its beige wall sits in the mid-tones, which is
  the worst place for it — too bright to be a backdrop, too flat to be a feature.
- **A charcoal or near-black wall with warm accent lighting** keeps the palette and
  solves the contrast problem simultaneously. The warm light then reads as an accent
  against the red rather than competing with it.
- **Red in the image is a bonus, not a requirement** — the TS sign is enough. Large
  red areas will compete with the CTA button, which is the one thing on the page that
  must win the eye.

### One separate finding

The red eyebrow (`#D62828`, 14px) measures **4.0:1 on plain `ink-950`** — under the
4.5:1 that size requires — and drops to ~3.5:1 over a photo. This is **site-wide**,
on every `SectionHeading`, and predates any hero work. No image can fix it. Options:
move eyebrows to `brand-light` `#E5383B`, increase them to 16px, or accept it on the
grounds that the eyebrow is decorative and its content always repeats in the heading
below. Tracked as S10 in `LAUNCH-READINESS.md`.

---

## 10. The code change this implies

Once two assets exist, swap the single `<Image>` for art direction — two images,
one shown per breakpoint:

```tsx
<Image src="/images/hero-mobile.jpg"  className="object-cover lg:hidden" fill priority
       sizes="100vw" alt="" />
<Image src="/images/hero-desktop.jpg" className="hidden object-cover lg:block" fill
       sizes="100vw" alt="" />
```

Then, if the copy zones land at ≤68/255:

- **Delete the flat scrim** (`bg-ink-950/45`) entirely — it exists only to rescue a
  too-bright source.
- **Soften the side gradient** to a light polish rather than the current 80%-to-55%
  wall.
- **Keep the bottom fade.** It is not about contrast; it stops the section ending in
  a hard line.

Note `sizes="100vw"` should be re-checked at ultrawide — a 2560px viewport was
observed being served a 1280px candidate.

---

## 10a. What actually shipped, 2026-08-23

The split in §10 is now in place, at `md` (768px) rather than `lg`, and with one
change of emphasis worth recording: **it was not shot as a portrait mobile crop.**
§8 asks for 1200×2000. What existed was a second render of the same room at
1920×1080 with the painted TRAIN SHANE sign removed, and cropping that to portrait
would have meant upscaling a 608px-wide slice. Serving the landscape plate and
letting `object-cover` crop it keeps the pixels honest. §8 stands as the spec for
a future shoot; it is not what is on the site today.

Both plates are resolved through `getImageProps` and composed into a `<picture>`.
Two `<Image>` elements toggled with `hidden md:block` would have been simpler and
wrong: a display:none image is still fetched, so every phone would have paid for
the desktop plate as well. Note that `priority` is inert through `getImageProps` —
the preload is issued from inside the real `<Image>` component, and the returned
props carry `fetchPriority: undefined`. The two `media`-scoped
`<link rel="preload">` tags in `page.tsx` exist to put that back; delete them and
the hero silently stops being preloaded.

**Why the split was needed at all is not what §1 predicts.** The reported defect
was the headline sitting on top of the painted wall sign on a phone — and that is
a *legibility* failure, not a *luminance* one. The sign is dark text on a dark
wall; the white headline over it still measures 12:1. See §11 for what follows
from that.

---

## 11. How to know it worked

`scripts/audit-site.mjs` covers layout. For contrast specifically, the method used
here was: screenshot the page twice, once with the hero text visible and once with it
hidden, diff the two to isolate the exact pixels the glyphs occupy, then measure WCAG
contrast between each text colour and the backdrop beneath those pixels. Averages and
bounding-box sampling both lie — the first hides local bright patches, the second
penalises text that does not fill its box.

**Acceptance criteria**, at 375 / 390 / 412 / 768 / 1024 / 1366 / 1440 / 1920:

| Check | Target |
|---|---|
| Headline contrast, 5th percentile | ≥ 4.5:1 (spec is 3:1; the margin absorbs a future copy change) |
| Subheadline contrast, 5th percentile | ≥ 4.5:1 |
| Image box vs section box | 0px gap, top and bottom |
| Hero bottom edge | no luminance step beyond the 1px section divider |
| Page errors | none |

Current state for reference — passing, but only because the scrim is doing heavy
lifting: headline 12.2–15.5:1, subheadline 5.9–8.6:1.

### This is now automated — and here is exactly what it does not cover

`e2e/hero.spec.ts` runs the method above on every width in the table, on each
`npm run test:e2e`. No more measuring by hand.

**But the contrast suite did not catch the bug that prompted the §10a split, and
would not catch it again.** This was verified rather than assumed: with the
branded plate deliberately wired back onto phones — the exact defect, headline
sitting across the painted sign — all nine widths still passed comfortably.

The reason is that WCAG contrast measures *luminance* between glyph and backdrop.
The sign is dark-on-dark, so a white headline over it measures fine. What makes it
unreadable is two sets of letterforms occupying the same pixels: **visual
interference, which contrast is blind to by construction.**

A backdrop "busyness" metric was tried as a replacement — mean |Laplacian| under
the glyphs, on the theory that text-on-text reads as high edge energy. It was
rejected on the numbers. Across 375/390/440 the broken and fixed versions differed
by roughly 4.3 → 3.8, and at 440 the *fixed* version scored higher than the broken
one. Any threshold drawn through that would be a number invented to pass, not a
measurement. It is not in the suite.

So the guard against text-on-text is the blunt one, in the same spec: **assert
which plate each breakpoint loads.** It fails loudly if a phone is ever pointed at
the branded frame again. It is narrow and it is honest about being narrow.

**The standing implication: contrast is necessary, not sufficient. A green suite
means the hero is not too bright. It does not mean the hero reads well. Anything
placed behind the copy that has structure of its own — a sign, a logo, a face, a
barbell crossing the baseline — still needs a human to look at it.**

---

## 12. Sources

- [Smashing Magazine — Designing Accessible Text Over Images](https://www.smashingmagazine.com/2023/08/designing-accessible-text-over-images-part1/)
- [WCAG.com — Text Over Images: Accessibility & Best Practices](https://www.wcag.com/blog/content-over-images-how-does-this-ux-ui-trend-impact-accessibility/)
- [Cloud Four — Responsive Hero Images](https://cloudfour.com/thinks/responsive-hero-images/)
- [Mario Hernandez — Art Direction using the picture element](https://mariohernandez.io/blog/art-direction-using-the-picture-html-element/)
- [imgix — Focal Point Cropping for Responsive Art Direction](https://docs.imgix.com/en-US/getting-started/tutorials/cropping-and-enhancement/focal-point-cropping)
- [Webflow — Hero image best practices](https://webflow.com/blog/website-hero-image)
- [WP Fangirl — How to Choose (and Crop) a Mobile-Friendly Hero Image](https://www.wpfangirl.com/2017/how-to-choose-and-crop-a-mobile-friendly-hero-image/)
