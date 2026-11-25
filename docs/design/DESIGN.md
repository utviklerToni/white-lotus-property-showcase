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
  --color-espresso: #2B211C;      /* mobile menu, filter sheet, footer (cream 13.3:1, gold 5.1:1, cream 65% 6.4:1 on it) */
  --color-cream: #F3EBDD;         /* text on espresso */

  --font-serif: "Cormorant Garamond", serif;   /* 400, 500, 600 (wordmark only) */
  --font-sans: "Jost", sans-serif;             /* 300, 400, 500 */

  /* motion curves, same values as src/lib/motion.ts (§5) */
  --ease-enter: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-exit: cubic-bezier(0.64, 0, 0.78, 0);
}
```

Hairlines: `rgba(40,45,60,.2)`–`.25` on stone; `rgba(255,255,255,.35)` on the hero scrim.
Load fonts in `index.html` with `preconnect` + `display=swap`, only the weights above.

---

## 2. Typography

| Role | Font | Mobile | Desktop | Notes |
|---|---|---|---|---|
| Wordmark (header) | Cormorant 600 | "WL" 24px | "White Lotus" 22px | The only 600 |
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
- Square corners everywhere (radius 0), except the mobile filter pill and card (§4) and their round controls. No shadows. Separation comes from hairlines and space.

---

## 4. Components

### Header
Sticky on all sizes with a solid stone background (the page colour, no transparency or blur); the hairline bottom border fades in once the page has scrolled. Left: text wordmark in Cormorant 600, monogram "WL" below md, "White Lotus" from md. Right, from md: inline nav links (sans, small caps, 44px tap target, the active link keeps its gold line drawn, §5). Below md: a "MENU" button (small caps, letter-spaced, with a two-line icon) that opens the menu overlay; the nav links are hidden. No logo image. 80px tall; `html` has `scroll-padding-top: 5rem` and sticky columns use `top-28` so nothing hides under it.

### Mobile menu (below md)
Full-screen overlay, espresso background, cream text, gold accents. Top row matches the header: "White Lotus" wordmark (Cormorant 600) left, "CLOSE" with the icon turned into an X right, where "MENU" was. Middle: the nav items in Cormorant 500 at 36px, each with a small gold number (`01 Residences`, `02 Admin`) and a gold hairline under it; the current page's hairline is full gold, the others at 35%. Bottom: a 40px gold rule and "BENGALURU" in small caps. Rendered outside `#root`, which is made inert and dimmed to 35% with page scroll locked while it is open; focus moves to Close, Tab wraps inside, Escape closes. Nothing on the page changes while the menu animates out: the dim, scroll lock, `inert`, focus return to "MENU" and the button's state are released together once the exit has finished. A backing as tall as the largest viewport (`100lvh`) sits under the panel, so a phone toolbar sliding can never show the page below it. Any navigation closes it, and so does widening past md.

### Listings intro
Small gold-text caps line ("Residences · Bengaluru"), Cormorant headline, one short Jost 300 paragraph. Our own copy, never White Lotus's text.

### Filter bar
- Labels: small caps, slate, above each control.
- Controls: **white fill with a 1px bottom border in gold-text `#8A6418`** (turns navy on hover; bright `#B98A39` fails 3:1 on stone), no other border, navy text, Jost 300 14px, padding 10–12px, gold chevron icon on the right (the chevron identifies the control). Focus ring as in §6.
- From md only: hidden below md, where the filter sheet replaces it. 2 columns at md, one row from lg. The count line below shows on every size.
- Below: result count (slate) left, "Clear filters" right (text link, gold underline).
- While refetching: grid at `opacity-60` + `aria-busy="true"`.

### Mobile filter sheet (below md)
- **Pill:** fixed at the bottom centre, 16px above the safe area, always visible. Espresso at 85% with a backdrop blur, fully rounded, cream "Filters" (13px) and a 32px circular chevron button (cream 30% outline). A gold count badge (espresso text) shows how many filters narrow the results (location, bedrooms, status; sort doesn't count).
- **Card:** the pill grows into it (shared `layoutId`, §5). 280px wide (at most the screen minus 2rem), espresso at 95% with a blur, radius 20px, anchored at the bottom and growing upward. Top row: "Filters" left, the chevron (turned to point down) right, which collapses it. Then one section per filter with a small cream-65% caps label (LOCATION, BEDROOMS, STATUS, SORT) and its options as radio rows (16px circle + label, 44px tall); "Any" first except for Sort; the chosen row's circle is filled gold. A choice applies at once through the URL, like the inline selects. The sections scroll inside the card past 60vh (thin cream scrollbar, never sideways). Bottom: a hairline and "CLEAR" (caps, gold underline), which resets every filter; dimmed when there is nothing to clear.
- Behind it: a 40% espresso backdrop; tapping it, Escape or the chevron closes the card. Page scroll is locked while it is open (the body is padded by the scrollbar's width, no reserved gutter), released once the backdrop has faded out. Focus moves to the chevron on open, Tab wraps inside the card (one stop per radio group, arrow keys within it), and focus returns to the pill on close. Widening past md closes it.
- The results section has 96px bottom padding below md, so the pill never covers the last card.

### Property card (text below the photo)
1. Photo: 4:3, `object-cover`, sand placeholder behind it. Status badge top-left inside the photo.
2. Row: `No. 04` (gold-text small caps) left, location (slate small caps) right.
3. Name: Cormorant 500.
4. Hairline, then row: facts with gold `lucide` icons (bed, ruler: stroke 1.25, 15px) left; price (tabular) right.
5. "View residence →" text link with a navy underline.
Whole card is one link (one focusable element); no nested interactive elements.
`No.` = the property's database id, zero-padded (`No. 04`), so the card and the detail page always match.

### Status badge
Small caps 10px, padding 6px 10px, square. Available: champagne bg / navy text (stays visible on bright sky photos). No borders on badges. Under construction: navy bg / champagne text. Sold: slate bg / stone text.

### Buttons and links
- Primary: navy fill, stone text, small caps 11px, `letter-spacing .2em`, padding 12–14px 22px, square.
- On navy: champagne fill, navy text.
- Secondary: transparent, 1px navy outline (admin only).
- Text links: underline (1px, offset 3–4px), never a button style.
- Links whose gold line shows only on hover or when active (header nav, admin sub-nav, "← All residences", the card's "View residence") use `link-draw` (§5). Always-underlined text links stay as they are.
- **No pills,** except the mobile Filters pill (§4).

### Detail page
1. **Hero:** full-bleed photo, 4:5 box on phones (grows only if the content needs it) / min-height 80vh from md. The photo is cropped by Unsplash to the box's shape (`<picture>`: 4:5 below md, 3:2 from md, `sizes="100vw"`), so `object-cover` barely scales it. A full-width gold line under the title (§5). bottom scrim `rgba(22,25,38,.55)` minimum so white text passes 4.5:1. Status badge top-left. Centered: small caps line (`No. 04 · Indiranagar`, champagne) + title. Bottom edge: facts as a `<dl>` — label (small caps, `on-navy` colour) over value (white, 17px): Price, Bedrooms, Size, Location. 2×2 on mobile, 4 across on desktop, hairline above.
2. **Overview:** gold-text "Overview" label, then the short `description` as the lead (Jost 300, large, indented first line).
3. **Specs:** hairline rows, label (slate small caps) left, value right: Status, Built-up area, Bedrooms, Neighbourhood.
4. **Details:** the long `details` text as body copy.
5. **Inquiry band:** full-width navy section. Inside, a frame with a **0.5px gold border** (the only border on the page besides hairlines). Small caps "Private viewing" (`on-navy-accent`), Cormorant heading "Arrange a visit to {name}", then the form, then a champagne "Send enquiry" button and a one-line reassurance.
   - **Inputs: light fill (stone `#FAF6F0`), no border**, navy text, labels above in `on-navy` small caps.
   - Success: replace the form with a calm confirmation message in the same frame. Server errors appear above the button without clearing the inputs.
6. Desktop: below the hero, two columns: overview + specs + details left (~60%), inquiry band as a sticky panel right (~40%).

### Footer
Espresso on every page, cream text, gold accents, 64px above it (96px from md).
- **CTA:** "Considering a residence?" in Cormorant 500 (32px, 48px from md) with "Let’s talk" in gold on its own line, and a gold arrow-in-circle (48px, 56px from md) that fills gold on hover/focus. The whole block is one link to the residences list (`/`).
- A full-width gold hairline.
- Nav: "Residences", "Admin" (small caps, cream, `link-draw`, 44px tap targets; the current page's line stays drawn). Then "BENGALURU" (small caps, cream 65%). No address, phone or email: none are given, and none are invented.
- "© {current year} White Lotus" (small caps 10px, cream 65%). No newsletter.
- Mobile: one column, in that order; bottom padding 96px plus the safe area, so the listing's Filters pill never covers the copyright. From md: CTA left, nav and city right (aligned to its bottom), then the hairline and the copyright across the full width.

### States
- Loading: card skeletons in sand (photo block + three bars), same layout as the card.
- Empty: Cormorant line "No residences match these filters" + "Clear filters" link.
- Error: Cormorant line "We couldn't load the residences" + primary "Try again" button.
- Route error / 404: same style, with a link back to Residences.

### Admin
Same tokens and fonts, denser and plainer: stone background, white table rows separated by hairlines, small caps column headers, navy primary buttons, secondary outline buttons. Form inputs: white fill, no border, label above, inline error text below in a readable red (`#9B2C2C`, 4.5:1+). Delete confirmation in a native `<dialog>` with focus trapped and Escape to close, fixed and centred, at most `100vw - 2rem` wide, buttons stacked full width on phones, page scroll locked while open. On phones the tables drop low-priority columns so Name and the actions fit without scrolling (D105–D107).

---

## 5. Motion
Calm and slow, never bouncy. Library: `motion` (`LazyMotion` + `m` with `domAnimation`, `MotionConfig reducedMotion="user"`; the filter sheet alone adds `domMax` for its layout morph, loaded as its own chunk). Curves, durations and variants live in `src/lib/motion.ts`; components never use their own values. Only `transform` and `opacity` animate.

- **Curves:** entrances `easeOut` `[0.22, 1, 0.36, 1]`, exits `easeIn` `[0.64, 0, 0.78, 0]`. Entrances are slower than exits.
- **Level 1, hero slide** (hero moments only: the mobile home headline, the detail title, the menu wordmark): text in an `overflow: hidden` mask slides `x: -105% → 0`, 850ms; a gold line under it draws `scaleX 0 → 1` from the left, 900ms, 150ms after the text. Exit: text to `x: 105%`, 420ms; the line retracts to the right.
- **Level 2, drift** (everything else): opacity 0 → 1 and `x: -28px → 0`, 650ms, siblings 85ms apart. Exit: opacity 0 and `x: +28px`, 400ms, reverse stagger.
- **Link line** (`link-draw` in `index.css`): gold 1px line draws left to right on hover/focus (600ms, enter curve), retracts to the right on leave (420ms, exit curve), stays drawn on `aria-current="page"`.
- Still from before: image fade-in on load (300ms), slow zoom on card image hover (`scale-[1.03]`, 700ms), 200ms colour transitions on links and buttons.
- **Detail title sequence:** the name enters with the Level 1 slide; a full-width gold line under the title block draws over 1100ms, 150ms after it; the four facts fade in and rise 8px (500ms) as the line's drawn tip reaches 15/40/65/90% of its length (delays solved from the `easeOut` curve: 188, 260, 358, 561ms). Once per mount (keyed by property id), instant under reduced motion.
- **Mobile menu:** open: the page dims to 35% (600ms) while the overlay panel fades in (600ms; the panel never moves, so it always covers the whole screen) and its contents drift in from `x: -24px`; the wordmark slides in (Level 1, 120ms delay); items drift in from 260ms, 90ms apart; each hairline draws 350ms after its item starts; then the foot rule and "BENGALURU" (from 750ms, 150ms apart). The icon's lines meet and turn into an X. Close: items leave to the right last-first with their hairlines retracting, the wordmark slides out to the right, then the panel fades out while its contents drift `+24px` (450ms, both starting once the wordmark has gone) and the page fades back up. Children timed by a parent never set their own `delay` (Motion lets it replace the parent's).
- **Mobile filter sheet:** the pill morphs into the card through a shared `layoutId` (450ms, `easeOut`, both ways) while the backdrop fades in; the chevron turns 180°. The sections then drift in (Level 2) from 270ms, 85ms apart. Close: the card shrinks back into the pill (no exit drift first, so closing is no slower than opening) and the pill's label fades in over its last 40%; the backdrop fades out (450ms, `easeIn`). Neither the card nor its contents overflow sideways in any frame (the scroll area is `overflow-x: hidden`).
- **Footer:** the first time 30% of it scrolls into view, its parts drift in (Level 2, 85ms apart) and the gold hairline draws from the left (900ms, in the stagger). Once only; instant under reduced motion.
- Never animate the first property image or the detail hero image (LCP). Hero text starts on mount with no delay.
- All of it instant under `prefers-reduced-motion: reduce` (MotionConfig for transforms, the global CSS rule for transitions).

---

## 6. Accessibility and mobile (hard requirements)
- Contrast: 4.5:1 for text, 3:1 for large text, icons and focus indicators — checked against the real background. Every text colour set explicitly.
- Gold `#B98A39` never for small text on stone; use `#8A6418`.
- Focus: visible 2px ring with 2px offset on every interactive element: `gold-text` `#8A6418` on light backgrounds (4.98:1 on stone), `gold` `#B98A39` only on navy (4.41:1). Bright gold on stone is 2.89:1, below 3:1.
- Skip-to-content link; logical heading order (one `h1` per page).
- Real `<label>` for every input and select; errors linked with `aria-describedby`; `aria-invalid` on failed fields.
- Photos: `alt` = "{name}, {location}". Decorative icons `aria-hidden`.
- Tap targets ≥ 44px. No horizontal scroll at 320px. Works at 200% zoom.
- Inputs on stone rely on fill + label (filter selects also have a chevron and a bottom border); the focus ring must be clearly visible.
- Phase 7: Lighthouse Accessibility ≥ 95 and Performance ≥ 90 on mobile, plus one keyboard-only pass.

---

## 7. Don't
- Don't copy White Lotus's layout, text, logo, italic serif style, pills or `|` facts rows. (The mobile Filters pill and card are our own, human-specified, §4.)
- No gradients (except the hero scrim), no shadows, no rounded corners (except the mobile filter pill and card, §4), no emoji, no entrance animations beyond §5.
- No borders on inputs, except the filter selects' 1px bottom border (§4). No more colour than the palette above.
