# DESIGN.md — visual design brief

Replaces the old PLAN §6b ("match White Lotus"). We keep **only White Lotus's colour palette** so it feels familiar. Layout, typography and components are our own: **Italian warmth in the type, Nordic discipline in the layout.**

Reference mocks (exact CSS values, open in a browser):
- `docs/design/listing-mobile.html` — listings page, 480px
- `docs/design/detail-mobile.html` — property detail page, 480px

Copy values from the mocks. Where this brief and a mock disagree, ask.

---

## 1. Tokens (Tailwind v4 `@theme` in `apps/web/src/index.css`)

```css
@theme {
  /* palette (from White Lotus) */
  --color-navy: #282D3C;          /* primary text, primary buttons, inquiry band */
  --color-champagne: #FAE1C8;     /* tinted panels, button on navy */
  --color-gold: #B98A39;          /* icons, hairline frames, focus ring on navy, active underline (NOT small text) */
  --color-gold-text: #8A6418;     /* gold for small text and the focus ring on light bg (4.9:1 on stone) */
  --color-slate: #454B4F;         /* secondary text */
  --color-danger: #9B2C2C;        /* inline form errors (admin) */

  /* our neutrals */
  --color-stone: #FAF6F0;         /* page background */
  --color-sand: #D9CFC2;          /* image placeholder / skeleton */
  --color-on-navy: #E8DCCB;       /* labels on navy (10:1) */
  --color-on-navy-accent: #E8C99A;/* small accent text on navy */

  --font-serif: "Cormorant Garamond", serif;   /* 400, 500 */
  --font-sans: "Jost", sans-serif;             /* 300, 400, 500 */
}
```

Hairlines: `rgba(40,45,60,.2)`–`.25` on stone; `rgba(255,255,255,.35)` on the hero scrim.
Load fonts in `index.html` with `preconnect` + `display=swap`, only the weights above.

---

## 2. Typography

| Role | Font | Mobile | Desktop | Notes |
|---|---|---|---|---|
| Page headline (listings intro) | Cormorant 500 | 40px / 1.05 | 64px | Upright, never italic |
| Detail title (hero) | Cormorant 500 | 48px / 1.0 | 80px | Centered on the hero |
| Card name | Cormorant 500 | 28px | 30px | |
| Section heading (inquiry) | Cormorant 500 | 30px / 1.1 | 36px | |
| Overview lead | Jost 300 | 22px / 1.45 | 28px | `text-indent: 2em` |
| Body | Jost 300 | 14px / 1.7–1.8 | 16px | Paragraphs never below 14px |
| Data (facts, price, specs) | Jost 400 | 13–17px | same | Prices: `font-variant-numeric: tabular-nums` |
| Label / small caps | Jost 400–500 | 10–11px, `letter-spacing: .22em`, uppercase | same | Only short labels, never sentences |

Cormorant is thin: always 500 for headings and names, explicit navy colour.

**Minimum sizes:** body paragraphs ≥ 14px. Other readable text (result count, "View residence", the form's reassurance line, facts) ≥ 13px. Only small-caps labels may be 10–11px.

---

## 3. Layout and spacing

- **Mobile first.** Design at 390px; side padding 24px. Desktop container max 1200px, side padding 48px.
- Generous vertical rhythm: 28–48px between blocks on mobile, 64–96px on desktop.
- Listings grid: 1 column mobile, 2 at `md`, 3 at `lg`. Gap 28px mobile, 40px desktop.
- Square corners everywhere (radius 0). No shadows. Separation comes from hairlines and space.

---

## 4. Components

### Header
Stone background, hairline bottom border. Left: text wordmark "WHITE LOTUS" in small caps (Jost 500). Right: inline nav links on all sizes, no menu button (sans, small caps, 44px tap target, active link has a gold underline). No logo image.

### Listings intro
Small gold-text caps line ("Residences · Bengaluru"), Cormorant headline, one short Jost 300 paragraph. Our own copy, never White Lotus's text.

### Filter bar
- Labels: small caps, slate, above each control.
- Controls: **light fill (white), no border**, navy text, Jost 300 14px, padding 10–12px, navy chevron icon on the right (the chevron identifies the control).
- 2-column grid on mobile, one row on desktop.
- Below: result count (slate) left, "Clear filters" right (text link, gold underline).
- While refetching: grid at `opacity-60` + `aria-busy="true"`.

### Property card (text below the photo)
1. Photo: 4:3, `object-cover`, sand placeholder behind it. Status badge top-left inside the photo.
2. Row: `No. 04` (gold-text small caps) left, location (slate small caps) right.
3. Name: Cormorant 500.
4. Hairline, then row: facts with gold `lucide` icons (bed, ruler: stroke 1.25, 15px) left; price (tabular) right.
5. "View residence →" text link with a navy underline.
Whole card is one link (one focusable element); no nested interactive elements.
`No.` = the property's database id, zero-padded (`No. 04`), so the card and the detail page always match.

### Status badge
Small caps 10px, padding 6px 10px, square. Available: stone bg / navy text. Under construction: navy bg / champagne text. Sold: slate bg / stone text.

### Buttons and links
- Primary: navy fill, stone text, small caps 11px, `letter-spacing .2em`, padding 12–14px 22px, square.
- On navy: champagne fill, navy text.
- Secondary: transparent, 1px navy outline (admin only).
- Text links: underline (1px, offset 3–4px), never a button style.
- **No pills anywhere.**

### Detail page
1. **Hero:** full-bleed photo, min-height 520px mobile / 80vh desktop, bottom scrim `rgba(22,25,38,.55)` minimum so white text passes 4.5:1. Status badge top-left. Centered: small caps line (`No. 04 · Indiranagar`, champagne) + title. Bottom edge: facts as a `<dl>` — label (small caps, `on-navy` colour) over value (white, 17px): Price, Bedrooms, Size, Location. 2×2 on mobile, 4 across on desktop, hairline above.
2. **Overview:** gold-text "Overview" label, then the short `description` as the lead (Jost 300, large, indented first line).
3. **Specs:** hairline rows, label (slate small caps) left, value right: Status, Built-up area, Bedrooms, Neighbourhood.
4. **Details:** the long `details` text as body copy.
5. **Inquiry band:** full-width navy section. Inside, a frame with a **0.5px gold border** (the only border on the page besides hairlines). Small caps "Private viewing" (`on-navy-accent`), Cormorant heading "Arrange a visit to {name}", then the form, then a champagne "Send enquiry" button and a one-line reassurance.
   - **Inputs: light fill (stone `#FAF6F0`), no border**, navy text, labels above in `on-navy` small caps.
   - Success: replace the form with a calm confirmation message in the same frame. Server errors appear above the button without clearing the inputs.
6. Desktop: below the hero, two columns: overview + specs + details left (~60%), inquiry band as a sticky panel right (~40%).

### Footer
Stone, hairline top. Small caps: "White Lotus · Bengaluru" (slate) left, "Since 2014" (gold-text) right.

### States
- Loading: card skeletons in sand (photo block + three bars), same layout as the card.
- Empty: Cormorant line "No residences match these filters" + "Clear filters" link.
- Error: Cormorant line "We couldn't load the residences" + primary "Try again" button.
- Route error / 404: same style, with a link back to Residences.

### Admin
Same tokens and fonts, denser and plainer: stone background, white table rows separated by hairlines, small caps column headers, navy primary buttons, secondary outline buttons. Form inputs: white fill, no border, label above, inline error text below in a readable red (`#9B2C2C`, 4.5:1+). Delete confirmation in a native `<dialog>` with focus trapped and Escape to close.

---

## 5. Motion
Only: image fade-in on load (300ms), slow zoom on card image hover (`scale-[1.03]`, 700ms), 200ms colour transitions on links and buttons. All disabled under `prefers-reduced-motion`.

---

## 6. Accessibility and mobile (hard requirements)
- Contrast: 4.5:1 for text, 3:1 for large text, icons and focus indicators — checked against the real background. Every text colour set explicitly.
- Gold `#B98A39` never for small text on stone; use `#8A6418`.
- Focus: visible 2px ring with 2px offset on every interactive element: `gold-text` `#8A6418` on light backgrounds (4.98:1 on stone), `gold` `#B98A39` only on navy (4.41:1). Bright gold on stone is 2.89:1, below 3:1.
- Skip-to-content link; logical heading order (one `h1` per page).
- Real `<label>` for every input and select; errors linked with `aria-describedby`; `aria-invalid` on failed fields.
- Photos: `alt` = "{name}, {location}". Decorative icons `aria-hidden`.
- Tap targets ≥ 44px. No horizontal scroll at 320px. Works at 200% zoom.
- Borderless inputs on stone rely on fill + label + chevron; the focus ring must be clearly visible.
- Phase 7: Lighthouse Accessibility ≥ 95 and Performance ≥ 90 on mobile, plus one keyboard-only pass.

---

## 7. Don't
- Don't copy White Lotus's layout, text, logo, italic serif style, pills or `|` facts rows.
- No gradients (except the hero scrim), no shadows, no rounded corners, no emoji, no entrance animations.
- No borders on inputs. No more colour than the palette above.
